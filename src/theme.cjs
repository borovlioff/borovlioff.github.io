// theme-manager.js

/**
 * Преобразует HEX-цвет в RGBA
 */
function hexToRgba(hex, alpha = 1) {
  if (hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  else {
    return '';
  }
}

/**
 * Применяет стили из сохранённой темы к CSS-переменным
 */
function applyThemeStyles(themeData) {
  const root = document.documentElement;

  // INPUT
  root.style.setProperty('--input-border-radius', `${themeData.inputBorderRadius}px`);
  root.style.setProperty('--input-border-width', `${themeData.inputBorderWidth}px`);
  root.style.setProperty('--input-border-color', themeData.inputBorderColor);
  root.style.setProperty('--input-bg-color', hexToRgba(themeData.inputBgColor, themeData.inputBgAlpha));
  root.style.setProperty('--input-text-color', themeData.inputTextColor);
  root.style.setProperty('--input-backdrop-filter', `blur(${themeData.inputBackdropBlur}px`);

  // BUTTON
  root.style.setProperty('--button-border-radius', `${themeData.buttonBorderRadius}px`);
  root.style.setProperty('--button-border-width', `${themeData.buttonBorderWidth}px`);
  root.style.setProperty('--button-border-color', themeData.buttonBorderColor);
  root.style.setProperty('--button-bg-color', hexToRgba(themeData.buttonBgColor, themeData.buttonBgAlpha));
  root.style.setProperty('--button-text-color', themeData.buttonTextColor);
  root.style.setProperty('--button-backdrop-filter', `blur(${themeData.buttonBackdropBlur}px`);

  // LINK & TEXT
  root.style.setProperty('--link-color', themeData.linkColor);
  root.style.setProperty('--text-font-size', `${themeData.textFontSize}px`);
  root.style.setProperty('--text-color', themeData.textColor);

  // BODY BG
  root.style.setProperty('--bg-color', hexToRgba(themeData.bgColor, themeData.bgAlpha));
  root.style.setProperty('--bg-backdrop-filter', `blur(${themeData.bgBackdropBlur}px`);

  // SECOND BG
  root.style.setProperty('--bg2-color', hexToRgba(themeData.bg2Color, themeData.bg2Alpha));
  root.style.setProperty('--bg2-backdrop-filter', `blur(${themeData.bg2BackdropBlur}px`);
}

/**
 * Возвращает сохранённую тему из localStorage
 */
function getSavedTheme() {
  return JSON.parse(localStorage.getItem('theme')) || {};
}

/**
 * Сохраняет текущую тему в localStorage
 */
function saveThemeToLocalStorage(themeData) {
  localStorage.setItem('theme', JSON.stringify(themeData));
}

export { hexToRgba, applyThemeStyles, getSavedTheme, saveThemeToLocalStorage };