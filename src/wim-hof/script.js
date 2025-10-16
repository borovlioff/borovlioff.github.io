
// script.js
import "./style.css";
import { SoundGenerator } from './breathing-sound.js';

const sound = new SoundGenerator();
sound.init();

class DataManager {
  constructor() {
    this.startData = Date.now();
    this.currentData = Date.now();
  }

  getTime() {
    const now = Date.now();
    const secondsFromStart = Math.floor((now - this.startData) / 1000);
    const secondsFromLast = Math.floor((now - this.currentData) / 1000);
    this.currentData = now;
    return [secondsFromStart, secondsFromLast];
  }

  waitUntil(targetTime, interval = 100, callback = () => {}) {
    return new Promise(resolve => {
      const timerId = setInterval(() => {
        if (isStopped || isPaused) {
          clearInterval(timerId);
          resolve(Date.now());
          return;
        }
        const now = Date.now();
        callback(now);
        if (now >= targetTime) {
          clearInterval(timerId);
          resolve(now);
        }
      }, interval);
    });
  }

  sleep(ms) {
    const target = Date.now() + ms;
    return this.waitUntil(target, 50);
  }
}

const dataManager = new DataManager();

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const sessionScreen = document.getElementById('session-screen');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseIcon = document.getElementById('pause-icon');
const stageText = document.getElementById('stage-text');
const counter = document.getElementById('counter');
const roundInfo = document.getElementById('round-info');
const breathAnimation = document.getElementById('breath-animation');
const animationText = document.getElementById('animation-text');
const nextBtn = document.getElementById('next-btn');

// Настройки из формы
const roundsInput = document.getElementById('rounds');
const breathCountInput = document.getElementById('breathCount');
const holdAfterExhaleSecInput = document.getElementById('holdAfterExhaleSec');
const holdAfterInhaleSecInput = document.getElementById('holdAfterInhaleSec');

// Состояние
let totalRounds = 3;
let breathCountGoal = 35;         // Кол-во вдохов
let maxHoldAfterExhale = 120;     // Секунд задержки после выдоха
let holdAfterInhaleDuration = 15; // Секунд задержки после вдоха

let currentRound = 1;
let isPaused = false;
let isStopped = false;

// Этапы
const STAGES = {
  BREATHING: 'breathing',
  HOLD_AFTER_EXHALE: 'hold-after-exhale',
  HOLD_AFTER_INHALE: 'hold-after-inhale'
};

let currentStage = null;

// === Управление сессией ===
startBtn.addEventListener('click', async () => {
  // Считываем настройки
  totalRounds = parseInt(roundsInput.value) || 3;
  breathCountGoal = parseInt(breathCountInput.value) || 35;
  maxHoldAfterExhale = parseInt(holdAfterExhaleSecInput.value) || 120;
  holdAfterInhaleDuration = parseInt(holdAfterInhaleSecInput.value) || 15;

  welcomeScreen.classList.add('opacity-0');
  await dataManager.waitUntil(Date.now() + 500);
  welcomeScreen.classList.add('hidden');
  sessionScreen.classList.remove('hidden');
  sessionScreen.classList.remove('opacity-0');

  startSession();
});

stopBtn.addEventListener('click', stopSession);
pauseBtn.addEventListener('click', togglePause);

function togglePause() {
  if (!currentStage || isStopped) return;
  isPaused = !isPaused;
  pauseIcon.textContent = isPaused ? '▶️' : '⏸️';
}

function stopSession() {
  isStopped = true;
  isPaused = false;
  currentStage = null;

  sessionScreen.classList.add('opacity-0');
  setTimeout(() => {
    sessionScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    welcomeScreen.classList.remove('opacity-0');
    isStopped = false;
  }, 500);
}

// === Основная сессия ===
async function startSession() {
  isStopped = false;
  isPaused = false;
  currentRound = 1;
  await nextRound();
}

async function nextRound() {
  if (isStopped) return;
  await doBreathingPhase();                     // N вдохов
  if (isStopped) return;
  await holdAfterExhale(maxHoldAfterExhale);   // Задержка после выдоха
  if (isStopped) return;
  await holdAfterInhale(holdAfterInhaleDuration); // Задержка после вдоха
  currentRound++;
  if (currentRound <= totalRounds && !isStopped) {
    await dataManager.sleep(2000);
    await nextRound();
  } else if (!isStopped) {
    finishSession();
  }
}

// --- Этап 1: N глубоких вдохов ---
async function doBreathingPhase() {
  currentStage = STAGES.BREATHING;
  let breathCount = 0;
  const breathCycleMs = 1200; // ~1.2 сек на цикл
  const startTime = Date.now();

  stageText.textContent = 'Глубокие вдохи';
  roundInfo.textContent = `Круг ${currentRound}/${totalRounds}`;
  counter.textContent = '0';

  return new Promise(resolve => {
    const intervalId = setInterval(() => {
      if (isStopped) {
        clearInterval(intervalId);
        return resolve();
      }
      if (isPaused) return;

      const elapsed = Date.now() - startTime;
      const newCount = Math.floor(elapsed / breathCycleMs);

      if (newCount !== breathCount && newCount < breathCountGoal) {
        breathCount = newCount;
        counter.textContent = breathCount ;

        if (breathCount % 2 === 0) {
          // Вдох
          breathAnimation.className =
            'w-40 h-40 md:w-60 md:h-60 rounded-full bg-white bg-opacity-20 border-4 border-blue-300 flex items-center justify-center scale-110 transition-transform duration-300';
          animationText.textContent = 'Вдох';
          sound.playBreathSound();
        } else {
          // Выдох
          breathAnimation.className =
            'w-40 h-40 md:w-60 md:h-60 rounded-full bg-white bg-opacity-20 border-4 border-gray-400 flex items-center justify-center scale-95 transition-transform duration-300';
          animationText.textContent = 'Выдох';
        }
      }

      if (breathCount >= breathCountGoal - 1) {
        clearInterval(intervalId);
        counter.textContent = breathCountGoal.toString();
        breathAnimation.className =
          'w-40 h-40 md:w-60 md:h-60 rounded-full bg-white bg-opacity-10 border-4 border-red-500 border-opacity-60 flex items-center justify-center scale-95';
        animationText.textContent = 'Выдохните...';
        sound.playBeep(600, 0.2);
        resolve();
      }
    }, 100);
  });
}

// --- Этап 2: Задержка после выдоха (с кнопкой "Далее") ---
async function holdAfterExhale(maxSec = 120) {
  currentStage = STAGES.HOLD_AFTER_EXHALE;
  let elapsedSec = 0;
  const startTime = Date.now();
  let buttonShown = false;

  stageText.textContent = 'Задержка дыхания';
  animationText.textContent = 'Выдохните...';
  breathAnimation.className =
    'w-40 h-40 md:w-60 md:h-60 rounded-full bg-white bg-opacity-10 border-4 border-red-500 border-opacity-60 flex items-center justify-center scale-95';

  nextBtn.classList.add('hidden', 'opacity-0');
  nextBtn.classList.remove('opacity-100');

  return new Promise(resolve => {
    const onClick = () => {
      nextBtn.removeEventListener('click', onClick);
      nextBtn.classList.add('hidden');
      sound.playBeep(500, 0.3);
      clearInterval(intervalId);
      resolve();
    };
    nextBtn.addEventListener('click', onClick);

    const intervalId = setInterval(() => {
      if (isStopped) {
        clearInterval(intervalId);
        nextBtn.removeEventListener('click', onClick);
        nextBtn.classList.add('hidden');
        return resolve();
      }
      if (isPaused) return;

      elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      counter.textContent = elapsedSec;

      // Показываем кнопку через 5 секунд
      if (!buttonShown && elapsedSec >= 5) {
        buttonShown = true;
        nextBtn.classList.remove('hidden');
        void nextBtn.offsetWidth;
        nextBtn.classList.remove('opacity-0');
        nextBtn.classList.add('opacity-100');
      }

      // Авто-завершение
      if (elapsedSec >= maxSec) {
        clearInterval(intervalId);
        nextBtn.removeEventListener('click', onClick);
        nextBtn.classList.add('hidden');
        sound.playBeep(500, 0.3);
        resolve();
      }
    }, 100);
  });
}

// --- Этап 3: Задержка после вдоха ---
async function holdAfterInhale(totalSec = 15) {
  currentStage = STAGES.HOLD_AFTER_INHALE;
  let remaining = totalSec;
  const endTime = Date.now() + totalSec * 1000;

  stageText.textContent = 'Задержка после вдоха';
  breathAnimation.className =
    'w-40 h-40 md:w-60 md:h-60 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 border-4 border-blue-300 flex items-center justify-center scale-110 animate-pulse';
  animationText.textContent = 'Дышите...';

  return new Promise(resolve => {
    const intervalId = setInterval(() => {
      if (isStopped) {
        clearInterval(intervalId);
        return resolve();
      }
      if (isPaused) return;

      remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      counter.textContent = remaining;

      if (remaining === 0) {
        clearInterval(intervalId);
        sound.playBeep(700, 0.4);
        resolve();
      }
    }, 100);
  });
}

// --- Финал ---
function finishSession() {
  currentStage = null;

  stageText.textContent = 'Сессия завершена';
  counter.textContent = '✅';
  animationText.textContent = 'Отдохните';
  breathAnimation.className =
    'w-40 h-40 md:w-60 md:h-60 rounded-full bg-green-500 bg-opacity-30 border-4 border-green-400 flex items-center justify-center';

  dataManager.waitUntil(Date.now() + 3000).then(() => {
    if (!isStopped) stopSession();
  });
}