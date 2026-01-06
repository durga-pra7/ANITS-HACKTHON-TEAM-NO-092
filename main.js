/**
 * main.js - Hardened Multi-User Biometric Isolation Engine
 */



// --- 1. Biometric Engine Configuration ---
let modelsLoaded = false;
let webcamStream = null;
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Professional Strictness Threshold (Revised to 0.62 for better detection stability)
const BIOMETRIC_MATCH_THRESHOLD = 0.62;

async function loadFaceModels(statusElement) {
    if (modelsLoaded) return true;
    try {
        console.log("[BIOMETRIC] Loading Secure AI Models...");
        if (statusElement) statusElement.innerText = "Initializing AI Core...";

        // Performance Optimization: Parallel model loading
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        modelsLoaded = true;
        console.log("[BIOMETRIC] Identity Engine: Ready");
        if (statusElement) statusElement.innerText = "AI Core Ready.";
        return true;
    } catch (e) {
        console.error("[CRITICAL] Biometric Engine Load Failure:", e);
        if (statusElement) statusElement.innerText = "Error: Models failed (Check Internet).";
        return false;
    }
}

// --- 2. Advanced Registration Flow ---
let tempUserData = null;

function handleDetailsSubmit(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    if (password !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    const userData = {
        fullname: document.getElementById('fullname').value,
        college: document.getElementById('college').value,
        email: document.getElementById('email').value,
        password: password
    };

    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const existingIdx = users.findIndex(u => u.email === userData.email);
    if (existingIdx > -1) users[existingIdx] = userData;
    else users.push(userData);

    localStorage.setItem('allUsers', JSON.stringify(users));

    alert("Account Successfully Created!");
    window.location.href = 'login.html';
}

/**
 * Robust Webcam Initialization
 * Standardizes access across browsers and provides clear error feedback.
 */
function initWebcam(videoId) {
    return new Promise((resolve, reject) => {
        const video = document.getElementById(videoId);
        const status = document.getElementById('faceLoginStatus');

        if (!video) return reject("Video element missing");

        // Browser Security Check: getUserMedia requires HTTPS or localhost
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const errorMsg = "Security Block: Webcam access is restricted. Use localhost or HTTPS.";
            console.error(errorMsg);
            if (status) status.innerHTML = `<span style="color:red;">${errorMsg}</span>`;
            alert(errorMsg);
            return reject(errorMsg);
        }

        // More flexible constraints using 'ideal' for better compatibility
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user"
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log(`[WEBCAM] Stream secured for ${videoId}`);
                webcamStream = stream;
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    resolve(stream);
                };
            })
            .catch(err => {
                let msg = "Camera access denied or device not found.";
                if (err.name === 'NotAllowedError') msg = "Permission Denied: Please allow camera access.";
                if (err.name === 'NotFoundError') msg = "Hardware Error: No camera device detected.";

                console.error(`[WEBCAM] ${err.name}: ${err.message}`);
                if (status) status.innerHTML = `<span style="color:red;">${msg}</span>`;
                alert(msg);

                reject(err);
            });
    });
}

// Biometric functions removed as per user request

// --- UI Utilities ---
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert("Invalid credentials.");
    }
}

function checkStrength(password) {
    const bar = document.getElementById('strengthBar');
    if (!bar) return;
    let strength = 0;
    if (password.length > 5) strength++;
    if (password.length > 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    const colors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981', '#059669'];
    bar.style.width = (strength * 25) + '%';
    bar.style.backgroundColor = colors[strength];
}

function togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.setAttribute('name', input.type === 'password' ? 'eye-outline' : 'eye-off-outline');
}

function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function checkAuthRedirect() {
    if (localStorage.getItem('user')) {
        window.location.href = 'dashboard.html';
    }
}

