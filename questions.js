/**
 * questions.js - Mock Question Bank
 * Structure: { id, t: text, o: options, a: correctIndex }
 */

const QUESTION_BANK = {
    python: {
        easy: [
            { t: "What is the output of `print(2 ** 3)`?", o: ["6", "8", "9", "5"], a: 1 },
            { t: "Which keyword defines a function?", o: ["func", "def", "function", "define"], a: 1 },
            { t: "Which data type is immutable?", o: ["List", "Dictionary", "Tuple", "Set"], a: 2 },
            { t: "What does `len('hello')` return?", o: ["4", "5", "6", "Error"], a: 1 },
            { t: "Comment symbol in Python?", o: ["//", "/*", "#", "<!--"], a: 2 },
            { t: "Create a list:", o: ["[]", "{}", "()", "<>"], a: 0 },
            { t: "Result of `type(3.14)`?", o: ["int", "float", "double", "decimal"], a: 1 },
            { t: "String concatenation operator?", o: [".", "+", "&", "concat()"], a: 1 },
            { t: "Value of `bool('')`?", o: ["True", "False", "Error", "None"], a: 1 },
            { t: "Loop not supported in Python?", o: ["for", "while", "do-while", "None"], a: 2 },
            { t: "Output of `10 // 3`?", o: ["3.33", "3", "3.0", "4"], a: 1 },
            { t: "Keyword to import module?", o: ["include", "import", "using", "require"], a: 1 },
            { t: "Start of index in Python list?", o: ["1", "0", "-1", "None"], a: 1 },
            { t: "Output of `print('Hi' * 2)`?", o: ["HiHi", "Hi2", "Error", "Hi Hi"], a: 0 },
            { t: "Which is IS a keyword?", o: ["eval", "assert", "local", "function"], a: 1 }
        ],
        medium: [
            { t: "Output `print('a' * 3)`?", o: ["a3", "aaa", "Error", "a a a"], a: 1 },
            { t: "Add element to list end?", o: ["push()", "add()", "append()", "insert()"], a: 2 },
            { t: "Output `set([1, 2, 2, 3])`?", o: ["{1, 2, 2, 3}", "{1, 2, 3}", "[1, 2, 3]", "Error"], a: 1 },
            { t: "Handle exceptions?", o: ["try-catch", "try-except", "do-catch", "try-error"], a: 1 },
            { t: "Lambda function is?", o: ["Named", "Anonymous", "Recursive", "Loop"], a: 1 },
            { t: "Invalid dictionary key?", o: ["'key'", "10", "(1, 2)", "[1, 2]"], a: 3 },
            { t: "Pass statement does?", o: ["Stop", "Skip", "Nothing", "Return"], a: 2 },
            { t: "Output `list(range(2, 5))`?", o: ["[2, 3, 4, 5]", "[2, 3, 4]", "[3, 4, 5]", "[2, 5]"], a: 1 },
            { t: "Regex module?", o: ["regex", "re", "string", "pyre"], a: 1 },
            { t: "Check 'a' in list `x`?", o: ["x.contains('a')", "'a' in x", "find('a', x)", "x.has('a')"], a: 1 },
            { t: "__init__ is?", o: ["Constructor", "Package", "File", "Destructor"], a: 0 },
            { t: "`'hello'.upper()`?", o: ["Hello", "HELLO", "hELLO", "Error"], a: 1 },
            { t: "Slice `x[1:3]` excludes?", o: ["Index 1", "Index 2", "Index 3", "None"], a: 2 },
            { t: "Dictionary `get()` method?", o: ["Key error", "Returns None if missing", "Adds key", "Deletes key"], a: 1 },
            { t: "Tuple mutable?", o: ["Yes", "No", "Sometimes", "Only init points"], a: 1 }
        ],
        hard: [
            { t: "Output `[i for i in range(3) if i < 1]`?", o: ["[0, 1]", "[0]", "[]", "[1]"], a: 1 },
            { t: "Multiple inheritance concept?", o: ["Multilevel", "Multiple", "Poly", "Encap"], a: 1 },
            { t: "Global Interpreter Lock (GIL)?", o: ["Security", "Single thread bytecode exec", "Memory", "DB Lock"], a: 1 },
            { t: "@staticmethod?", o: ["Private", "No instance needed", "Persistent", "None"], a: 1 },
            { t: "`list.sort()` complexity?", o: ["O(n)", "O(n^2)", "O(n log n)", "O(1)"], a: 2 },
            { t: "Generator statement?", o: ["return", "yield", "emit", "send"], a: 1 },
            { t: "`x=[1,2]; y=x; y.append(3); print(x)`?", o: ["[1, 2]", "[1, 2, 3]", "Error", "None"], a: 1 },
            { t: "Decorator is?", o: ["Design pattern", "Wrapped function", "UI", "Type"], a: 1 },
            { t: "`is` vs `==`?", o: ["Same", "Identity vs Value", "Value vs Identity", "Memory"], a: 1 },
            { t: "Data manipulation lib?", o: ["NumPy", "Pandas", "Matplotlib", "Requests"], a: 1 },
            { t: "Pickling is?", o: ["Compress", "Serialize", "Encrypt", "Hash"], a: 1 },
            { t: "`*args` passes?", o: ["Keyword", "Variable Positional", "Pointers", "Multi"], a: 1 },
            { t: "Metaclass purpose?", o: ["Class of a class", "Inheritance", "Polymorphism", "Debug"], a: 0 },
            { t: "`__slots__` usage?", o: ["Memory optimization", "Security", "Threading", "Networking"], a: 0 },
            { t: "Deep copy module?", o: ["copy", "clone", "duplicate", "sys"], a: 0 }
        ]
    }
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomSubset(array, count) {
    if (!array || array.length < count) {
        console.error("Not enough questions in pool");
        return array || [];
    }
    const shuffled = shuffleArray([...array]);
    return shuffled.slice(0, count);
}
