import './styles.css'


// Элементы DOM
const wordDisplay = document.getElementById('wordDisplay');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const startSpeedInput = document.getElementById('startSpeed');
const endSpeedInput = document.getElementById('endSpeed');
const textInput = document.getElementById('textInput');
const fileInput = document.getElementById('fileInput');
const clearTextButton = document.getElementById('clearText');
const toggleSettings = document.getElementById('toggleSettings');
const settingsPanel = document.getElementById('settingsPanel');

// Состояние
let words = [];
let currentWordIndex = 0;
let readingSpeed = 200; // миллисекунды между словами
let interval = null;
let isRunning = false;

// Загрузка сохранённого состояния
document.addEventListener('DOMContentLoaded', () => {
    const savedWords = localStorage.getItem('words');
    const savedIndex = localStorage.getItem('currentWordIndex');
    const savedSpeed = localStorage.getItem('readingSpeed');

    if (savedWords) {
        words = JSON.parse(savedWords);
        textInput.value = words.join(' ');
    }
    if (savedIndex) currentWordIndex = parseInt(savedIndex, 10);
    if (savedSpeed) {
        readingSpeed = parseInt(savedSpeed, 10);
        speedControl.value = getWPM(readingSpeed);
        speedValue.textContent = getWPM(readingSpeed);
    } else {
        speedControl.value = 300;
        speedValue.textContent = 300;
        updateSpeed();
    }

    startSpeedInput.value = localStorage.getItem('startSpeed') || 300;
    endSpeedInput.value = localStorage.getItem('endSpeed') || 600;
});

// Привязка событий
startButton.addEventListener('click', startReading);
pauseButton.addEventListener('click', pauseReading);
resetButton.addEventListener('click', resetReading);
wordDisplay.addEventListener('click', () => isRunning ? pauseReading() : startReading());

speedControl.addEventListener('input', () => {
    speedValue.textContent = speedControl.value;
    updateSpeed();
});

startSpeedInput.addEventListener('input', saveStartSpeed);
endSpeedInput.addEventListener('input', saveEndSpeed);

textInput.addEventListener('input', () => {
    words = textInput.value.trim().split(/\s+/).filter(w => w);
    currentWordIndex = 0;
    saveWords();
});

fileInput.addEventListener('change', loadFromFile);
clearTextButton.addEventListener('click', clearText);

toggleSettings.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
});

// Функции
function updateSpeed() {
    const wpm = parseInt(speedControl.value, 10);
    readingSpeed = 60000 / wpm; // мс на слово
}

function getWPM(ms) {
    return Math.round(60000 / ms);
}

function startReading() {
    if (words.length === 0) {
        alert('Добавьте текст для чтения.');
        return;
    }

    if (isRunning) return;

    isRunning = true;
    startButton.classList.add('hidden');
    pauseButton.classList.remove('hidden');

    clearInterval(interval);
    interval = setInterval(() => {
        if (currentWordIndex < words.length) {
            wordDisplay.textContent = words[currentWordIndex];
            currentWordIndex++;
            saveProgress();
        } else {
            stopReading();
        }
    }, readingSpeed);
}

function pauseReading() {
    if (!isRunning) return;
    clearInterval(interval);
    isRunning = false;
    pauseButton.classList.add('hidden');
    startButton.classList.remove('hidden');
    saveProgress();
}

function stopReading() {
    clearInterval(interval);
    isRunning = false;
    pauseButton.classList.add('hidden');
    startButton.classList.remove('hidden');
    currentWordIndex = 0;
    wordDisplay.textContent = 'Чтение завершено';
    setTimeout(() => {
        if (!isRunning) wordDisplay.textContent = 'Нажмите "Старт"';
    }, 1500);
}

function resetReading() {
    pauseReading();
    currentWordIndex = 0;
    wordDisplay.textContent = 'Нажмите "Старт"';
    saveProgress();
}

function loadFromFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const text = event.target.result;
        textInput.value = text;
        words = text.trim().split(/\s+/).filter(w => w);
        currentWordIndex = 0;
        saveWords();
    };
    reader.readAsText(file);
}

function clearText() {
    textInput.value = '';
    words = [];
    currentWordIndex = 0;
    saveWords();
    saveProgress();
}

function saveWords() {
    localStorage.setItem('words', JSON.stringify(words));
}

function saveProgress() {
    localStorage.setItem('currentWordIndex', currentWordIndex);
    localStorage.setItem('readingSpeed', readingSpeed);
}

function saveStartSpeed(e) {
    localStorage.setItem('startSpeed', e.target.value);
}

function saveEndSpeed(e) {
    localStorage.setItem('endSpeed', e.target.value);
}