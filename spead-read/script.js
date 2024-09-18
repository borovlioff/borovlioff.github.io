let words = [];
let currentWordIndex = 0;
let startSpeed = 100;
let endSpeed = 700;
let interval;
let isPaused = false;
let readingSpeed = startSpeed;
let speedMultiplier = 1;

const loadFile = document.getElementById('loadFile');
const loadFilePopup = document.querySelector("#loadFilePopup");
const wordDisplayHTML = document.getElementById('wordDisplay');
const clearTextHTML = document.getElementById('clearText');
const startSpeedHTML = document.getElementById('startSpeed');
const endSpeedHTML = document.getElementById('endSpeed');
const textInput = document.getElementById('textInput');
const fileInput = document.getElementById('fileInput');
// Элементы управления
const startButton = document.getElementById('start');
const wordDisplay = document.getElementById('wordDisplay');
const speedControl = document.getElementById('speedControl');

const setting = document.getElementById('setting');
const settingPopup = document.querySelector("#settingPopup");

function pause() {
  startButton.style.display = 'block';
  clearInterval(interval);
  isPaused = true;
}

document.addEventListener('DOMContentLoaded', () => {
  words = JSON.parse(localStorage.getItem('words')) || [];
  textInput.value = words.join(' ');
  startSpeed = localStorage.getItem('startSpeed') || startSpeed;
  startSpeedHTML.value = startSpeed;
  endSpeed = localStorage.getItem('endSpeed') || endSpeed;
  endSpeedHTML.value = endSpeed;
})


// Загрузка текста из поля ввода
textInput.addEventListener('input', () => {
  words = textInput.value.trim().split(/\s+/);
  currentWordIndex = 0;
  localStorage.setItem('words', JSON.stringify(words));
});

// Загрузка текста из файла
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      words = e.target.result;
    };
    reader.readAsText(file);
  }
});

// Очистка текста
clearTextHTML.addEventListener('click', () => {
  textInput.value = '';
  words = [];
  localStorage.removeItem('words');
  currentWordIndex = 0;
});



// Функция для начала чтения
startButton.addEventListener('click', () => {
  if (words.length === 0) {
    alert('Нужно загрузить текст или вставить его в поле ввода.');
    return;
  }
  startButton.style.display = 'none';
  if (isPaused) {
    isPaused = false;
    startReading();
    return;
  }
  updateSpeed();
  startReading();
});


// Функция для паузы
wordDisplay.addEventListener('click', () => {
  pause()
})

// Функция для отображения слов
function startReading() {
  clearInterval(interval);
  interval = setInterval(() => {
    if (currentWordIndex < words.length) {
      wordDisplay.textContent = words[currentWordIndex];
      currentWordIndex++;
    } else {
      clearInterval(interval); // Остановка, если текст закончился
    }
  }, readingSpeed);
}

const minut = 60000;
// Настройка скорости
function updateSpeed() {
  if(minut / (startSpeed ) > minut / endSpeed) {
    const speedMultiplier = parseFloat(speedControl.value); // От 1 до 5
    readingSpeed = 60000 / (startSpeed * speedMultiplier); // Скорость слов в минуту
  }
}

// Изменение скорости нарастания
speedControl.addEventListener('input', updateSpeed);

loadFile.addEventListener("click", () => {
  pause();
  loadFilePopup.classList.add("active");
})

loadFilePopup.querySelector(".close").addEventListener("click", () => {
  loadFilePopup.classList.remove("active");
})


setting.addEventListener("click", () => {
  pause();
  settingPopup.classList.add("active");
})

settingPopup.querySelector(".close").addEventListener("click", () => {
  settingPopup.classList.remove("active");
})



startSpeedHTML.addEventListener('input', (e) => {
  startSpeed = e.target.value;
  localStorage.setItem('startSpeed', startSpeed);
  updateSpeed();
})

endSpeedHTML.addEventListener('input', (e) => {
  endSpeed = e.target.value;
  localStorage.setItem('endSpeed', endSpeed);
  updateSpeed();
})

