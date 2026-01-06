/**
 * exam.js - Assessment Logic & Proctoring
 */

let currentQuestion = 1;
const totalQuestions = 10;
let timeLeft = 15 * 60; // Reduced to 15 minutes for 10 questions
let isProctoringActive = false; // Flag to enable strict checks
let examQuestions = []; // Store generated session questions

document.addEventListener('DOMContentLoaded', () => {
    // Start with Grace Period logic instead of immediate init
    startGracePeriod();

    // Load Question Bank
    if (typeof QUESTION_BANK === 'undefined') {
        console.warn("Question Bank not loaded or empty.");
    } else {
        generateExam('python');
    }

    enterFullscreen();
    setupProctoring();
});

/* --- Exam Generation Logic --- */

function generateExam(courseId) {
    if (!QUESTION_BANK || !QUESTION_BANK[courseId]) {
        alert("Course content missing!");
        return;
    }

    const courseData = QUESTION_BANK[courseId];

    // Mix for 10 questions: 4 Easy, 3 Medium, 3 Hard
    const easy = getRandomSubset(courseData.easy, 4);
    const medium = getRandomSubset(courseData.medium, 3);
    const hard = getRandomSubset(courseData.hard, 3);

    // Combine and Shuffle Order
    let allQs = [...easy, ...medium, ...hard];
    allQs = shuffleArray(allQs);

    // Process questions: Assign local IDs for this session and Shuffle Options
    examQuestions = allQs.map((q, index) => {
        const correctAnswerText = q.o[q.a];
        let options = [...q.o];
        options = shuffleArray(options); // Shuffle options

        return {
            id: index + 1,
            text: q.t,
            options: options,
            correctAnswer: correctAnswerText,
            userAnswer: null
        };
    });

    initPalette();
    renderQuestion(0);
}

/* --- AI Proctoring (Multi-Person Detection) --- */

let detector = null;

async function loadAIModel() {
    try {
        const status = document.getElementById('aiStatus');
        if (status) status.innerText = "Loading AI Models...";
        detector = await cocoSsd.load();
        if (status) status.innerText = "AI Proctoring Ready.";
        startDetection();
    } catch (err) {
        console.error("AI Model Loading Failed:", err);
        const status = document.getElementById('aiStatus');
        if (status) status.innerText = "AI Offline (Proceeding with manual proctoring)";
    }
}

async function startDetection() {
    const video = document.getElementById('webcam');

    // Run detection loop
    const runDetection = async () => {
        if (!isProctoringActive || !detector) {
            requestAnimationFrame(runDetection);
            return;
        }

        try {
            const predictions = await detector.detect(video);
            const persons = predictions.filter(p => p.class === 'person' && p.score > 0.6);

            if (persons.length > 1) {
                terminateExam("Multiple people detected! Only one person is allowed in the frame.");
                return; // Stop loop
            }
        } catch (err) {
            console.error("Detection Error:", err);
        }

        // Loop every 2 seconds to save performance
        setTimeout(() => requestAnimationFrame(runDetection), 2000);
    };

    runDetection();
}

/* --- Grace Period & Webcam --- */

function startGracePeriod() {
    let graceTime = 15;
    const timerElem = document.getElementById('graceTimer');

    // Initialize AI Model alongside webcam
    loadAIModel();
    initWebcam();

    const interval = setInterval(() => {
        graceTime--;
        if (timerElem) timerElem.innerText = graceTime;

        if (isProctoringActive) {
            clearInterval(interval);
            const modal = document.getElementById('cameraSetupModal');
            if (modal) modal.style.display = 'none';
            initTimer();
        } else if (graceTime <= 0) {
            clearInterval(interval);
            alert("Camera permission not granted in time. Exam cannot proceed.");
            exitExam();
        }
    }, 1000);
}

function initWebcam() {
    const video = document.getElementById('webcam');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                isProctoringActive = true;
            })
            .catch(err => {
                console.error("Webcam error:", err);
            });
    } else {
        alert("Webcam not supported in this browser.");
    }
}

/* --- Proctoring & Security --- */

function setupProctoring() {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('copy', (e) => { e.preventDefault(); alertViolation('Copy attempt detected'); });
    document.addEventListener('paste', (e) => { e.preventDefault(); alertViolation('Paste attempt detected'); });
    document.addEventListener('selectstart', (e) => { e.preventDefault(); });

    document.addEventListener('visibilitychange', () => {
        if (!isProctoringActive) return;
        if (document.hidden) {
            terminateExam("Tab switching detected! You left the exam window.");
        }
    });

    window.addEventListener('blur', () => {
        if (!isProctoringActive) return;
        setTimeout(() => {
            if (!document.hasFocus() && isProctoringActive) {
                terminateExam("Exam window lost focus (Alt+Tab or external click detected).");
            }
        }, 1000);
    });

    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', () => {
        history.pushState(null, null, document.URL);
    });
}

function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log("Fullscreen blocked or not supported", err);
        });
    }
}

/* --- Exam Logic --- */

function initTimer() {
    const timerDisplay = document.getElementById('timer');
    const interval = setInterval(() => {
        if (!isProctoringActive) return;

        timeLeft--;
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.innerHTML = `${m}:${s}`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            submitExam("Time's up!");
        }
    }, 1000);
}

function selectOption(label) {
    const all = document.querySelectorAll('.option-item');
    all.forEach(el => el.classList.remove('selected'));
    const radio = label.querySelector('input[type="radio"]');
    radio.checked = true;
    label.classList.add('selected');

    if (examQuestions[currentQuestion - 1]) {
        examQuestions[currentQuestion - 1].userAnswer = radio.value;
        const paletteItem = document.querySelectorAll('.palette-item')[currentQuestion - 1];
        if (paletteItem) paletteItem.classList.add('answered');
    }
}

function nextQuestion() {
    if (currentQuestion < examQuestions.length) {
        currentQuestion++;
        updateQuestionUI();
    } else {
        confirmSubmit();
    }
}

function prevQuestion() {
    if (currentQuestion > 1) {
        currentQuestion--;
        updateQuestionUI();
    }
}

function updateQuestionUI() {
    document.getElementById('currentQNum').innerText = currentQuestion;
    document.getElementById('prevBtn').disabled = currentQuestion === 1;
    document.getElementById('nextBtn').innerText = currentQuestion === examQuestions.length ? 'Finish' : 'Next Question';

    const items = document.querySelectorAll('.palette-item');
    items.forEach(i => i.classList.remove('active'));
    if (items[currentQuestion - 1]) items[currentQuestion - 1].classList.add('active');

    renderQuestion(currentQuestion - 1);
}

function renderQuestion(index) {
    if (!examQuestions || !examQuestions[index]) return;

    const q = examQuestions[index];
    document.querySelector('.question-text').innerText = q.text;

    const container = document.querySelector('.options-list');
    container.innerHTML = '';

    q.options.forEach(opt => {
        const label = document.createElement('label');
        label.className = 'option-item';
        if (q.userAnswer === opt) label.classList.add('selected');

        label.onclick = () => selectOption(label);
        const checked = q.userAnswer === opt ? 'checked' : '';

        label.innerHTML = `
            <input type="radio" name="q_${q.id}" class="option-radio" value="${opt}" ${checked}>
            <span>${opt}</span>
        `;
        container.appendChild(label);
    });
}

function initPalette() {
    const p = document.getElementById('qPalette');
    p.innerHTML = '';
    p.style.gridTemplateColumns = 'repeat(5, 1fr)';

    examQuestions.forEach((q, i) => {
        const div = document.createElement('div');
        div.className = (i + 1) === currentQuestion ? 'palette-item active' : 'palette-item';
        div.innerText = i + 1;
        div.onclick = () => {
            currentQuestion = i + 1;
            updateQuestionUI();
        };
        p.appendChild(div);
    });
}

function confirmSubmit() {
    if (confirm("Are you sure you want to submit your assessment?")) {
        calculateScoreAndFinish();
    }
}

function calculateScoreAndFinish() {
    let score = 0;
    const count = examQuestions.length;

    examQuestions.forEach(q => {
        if (q.userAnswer && q.userAnswer === q.correctAnswer) {
            score++;
        }
    });

    const percentage = Math.round((score / count) * 100);
    const passed = percentage >= 60;

    const result = {
        course: "Python Programming Fundamentals",
        score: percentage,
        passed: passed,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        certId: passed ? 'CRT-' + Math.random().toString(36).substr(2, 9).toUpperCase() : null
    };

    localStorage.setItem('lastResult', JSON.stringify(result));

    if (passed) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userEmail = user.email || 'guest';
        const storageKey = `certifications_${userEmail}`;

        const certs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        certs.unshift(result);
        localStorage.setItem(storageKey, JSON.stringify(certs));
    }

    window.location.href = 'result.html';
}

function submitExam(msg) {
    alert(msg);
    calculateScoreAndFinish();
}

function alertViolation(msg) {
    if (!isProctoringActive) return;
    alert("WARNING: " + msg);
}

function terminateExam(reason) {
    if (!isProctoringActive) return;
    const modal = document.getElementById('violationModal');
    document.getElementById('violationReason').innerText = reason;
    modal.style.display = 'flex';
    if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
    isProctoringActive = false;
}

function exitExam() {
    window.location.href = 'dashboard.html';
}
