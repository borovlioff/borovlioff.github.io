// index.js

import { applyThemeStyles, getSavedTheme, saveThemeToLocalStorage } from './theme.cjs';

// Получаем элементы формы
const controls = {
  inputBorderRadius: document.getElementById('inputBorderRadius'),
  inputBorderWidth: document.getElementById('inputBorderWidth'),
  inputBorderColor: document.getElementById('inputBorderColor'),
  inputBgColor: document.getElementById('inputBgColor'),
  inputBgAlpha: document.getElementById('inputBgAlpha'),
  inputTextColor: document.getElementById('inputTextColor'),
  inputBackdropBlur: document.getElementById('inputBackdropBlur'),

  buttonBorderRadius: document.getElementById('buttonBorderRadius'),
  buttonBorderWidth: document.getElementById('buttonBorderWidth'),
  buttonBorderColor: document.getElementById('buttonBorderColor'),
  buttonBgColor: document.getElementById('buttonBgColor'),
  buttonBgAlpha: document.getElementById('buttonBgAlpha'),
  buttonTextColor: document.getElementById('buttonTextColor'),
  buttonBackdropBlur: document.getElementById('buttonBackdropBlur'),

  linkColor: document.getElementById('linkColor'),
  textColor: document.getElementById('textColor'),
  textFontSize: document.getElementById('textFontSize'),

  bgColor: document.getElementById('bgColor'),
  bgAlpha: document.getElementById('bgAlpha'),
  bgBackdropBlur: document.getElementById('bgBackdropBlur'),

  bg2Color: document.getElementById('bg2Color'),
  bg2Alpha: document.getElementById('bg2Alpha'),
  bg2BackdropBlur: document.getElementById('bg2BackdropBlur')
};

// Загружаем сохранённую тему
const savedTheme = getSavedTheme();

// Восстанавливаем значения полей
Object.keys(controls).forEach(key => {
  if (savedTheme[key] !== undefined) {
    controls[key].value = savedTheme[key];
  }
});

// Применяем стили при загрузке
applyThemeStyles(savedTheme);

// Функция обновления стилей
function applyStyles() {
  const currentValues = {};

  for (const key in controls) {
    currentValues[key] = controls[key].value;
  }

  applyThemeStyles(currentValues);
  saveThemeToLocalStorage(currentValues);
}

// Обработчики событий
Object.values(controls).forEach(input => {
  input.addEventListener('input', applyStyles);
});