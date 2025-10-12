import './styles.css';

// --- Транслитерация кириллицы ---
const TRANSLIT_MAP = {
  // Строчные
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  // Прописные
  А: "A", Б: "B", В: "V", Г: "G", Д: "D", Е: "E", Ё: "Yo", Ж: "Zh",
  З: "Z", И: "I", Й: "Y", К: "K", Л: "L", М: "M", Н: "N", О: "O",
  П: "P", Р: "R", С: "S", Т: "T", У: "U", Ф: "F", Х: "H", Ц: "C",
  Ч: "Ch", Ш: "Sh", Щ: "Sch", Ъ: "", Ы: "Y", Ь: "", Э: "E", Ю: "Yu", Я: "Ya"
};

function transliterate(text) {
  return Array.from(text)
    .map(char => TRANSLIT_MAP[char] || char)
    .join("");
}

// --- Утилиты ---
function getValue() {
  const textarea = document.getElementById('textArea');
  return textarea ? textarea.value : '';
}

function setValue(value) {
  const textarea = document.getElementById('textArea');
  if (textarea) {
    textarea.value = value;
  } else {
    console.error('[TextMaster] #textArea не найден');
  }
}

function alertUser(message) {
  alert(message);
}

// --- Все функции обработки текста ---
const TextActions = {
  uppercaseText() {
    setValue(getValue().toUpperCase());
  },

  lowercaseText() {
    setValue(getValue().toLowerCase());
  },

  capitalizeText() {
    const text = getValue();
    const result = text.replace(/(^|[.!?]\s*)([a-zа-яё])/gi, (match, before, letter) =>
      before + letter.toUpperCase()
    );
    setValue(result);
  },

  removeExtraSpaces() {
    let text = getValue().trim();
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/^\s+|\s+$/gm, '');
    setValue(text);
  },

  removeHtmlTags() {
    setValue(getValue().replace(/<[^>]*>/g, ""));
  },

  convertToTranslit() {
    setValue(transliterate(getValue()));
  },

  sortAlphabetically() {
    const lines = getValue()
      .split('\n')
      .filter(line => line.trim() !== "")
      .sort((a, b) => a.localeCompare(b, 'ru'));
    setValue(lines.join('\n'));
  },

  sortReverseAlphabetically() {
    const lines = getValue()
      .split('\n')
      .filter(line => line.trim() !== "")
      .sort((a, b) => b.localeCompare(a, 'ru'));
    setValue(lines.join('\n'));
  },

  removeDuplicates() {
    const lines = getValue()
      .split('\n')
      .filter(line => line.trim() !== "");
    const unique = [...new Set(lines)];
    setValue(unique.join('\n'));
  },

  convertToJsonArray() {
    const lines = getValue()
      .split('\n')
      .filter(line => line.trim() !== "");
    try {
      setValue(JSON.stringify(lines, null, 2));
    } catch (e) {
      alertUser("Ошибка при создании JSON массива.");
    }
  },

  convertToJsonObject() {
    const lines = getValue()
      .split('\n')
      .filter(line => line.trim() !== "");
    const obj = {};
    lines.forEach(line => {
      const key = transliterate(line).replace(/\s+/g, '_').toLowerCase();
      obj[key] = line;
    });
    try {
      setValue(JSON.stringify(obj, null, 2));
    } catch (e) {
      alertUser("Ошибка при создании JSON объекта.");
    }
  },

  generateBase64() {
    try {
      const text = getValue();
      const encoded = btoa(unescape(encodeURIComponent(text)));
      setValue(encoded);
    } catch (e) {
      alertUser("Невозможно закодировать в Base64 (возможно, есть символы UTF-16)");
    }
  },

  decodeBase64() {
    try {
      const text = getValue();
      const decoded = decodeURIComponent(escape(atob(text)));
      setValue(decoded);
    } catch (e) {
      alertUser("Неверный формат Base64 или повреждённые данные.");
    }
  },

  generateSlug() {
    setValue(
      getValue()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );
  },

  cleanPhoneNumbers() {
    setValue(getValue().replace(/\D/g, ""));
  },

  replaceNewLineWithTab() {
    setValue(getValue().replace(/\n/g, '\t'));
  },

  replaceCommaWithTab() {
    setValue(getValue().replace(/,/g, '\t'));
  },

  replaceSemicolonWithTab() {
    setValue(getValue().replace(/;/g, '\t'));
  },

  countCharacters() {
    const count = getValue().length;
    alertUser(`Количество символов: ${count}`);
  },

  generateQRCode() {
    const text = getValue().trim();
    if (!text) {
      alertUser("Введите текст для генерации QR-кода.");
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=400,height=450');
  },

  copyText() {
    const textarea = document.getElementById('textArea');
    if (!textarea || !getValue()) {
      alertUser("Нечего копировать.");
      return;
    }
    textarea.select();
    document.execCommand('copy');
    alertUser("✅ Текст скопирован!");
  }
};

// === Инициализация при загрузке DOM ===
document.addEventListener('DOMContentLoaded', () => {
  const textArea = document.getElementById('textArea');

  // Проверка существования основного поля
  if (!textArea) {
    console.error('❌ [TextMaster] <textarea id="textArea"> не найден в DOM.');
    return;
  }

  // Ручная привязка каждой кнопки
  document.getElementById('uppercaseText')?.addEventListener('click', () => TextActions.uppercaseText());
  document.getElementById('lowercaseText')?.addEventListener('click', () => TextActions.lowercaseText());
  document.getElementById('capitalizeText')?.addEventListener('click', () => TextActions.capitalizeText());
  document.getElementById('removeExtraSpaces')?.addEventListener('click', () => TextActions.removeExtraSpaces());
  document.getElementById('removeHtmlTags')?.addEventListener('click', () => TextActions.removeHtmlTags());
  document.getElementById('convertToTranslit')?.addEventListener('click', () => TextActions.convertToTranslit());
  document.getElementById('sortAlphabetically')?.addEventListener('click', () => TextActions.sortAlphabetically());
  document.getElementById('sortReverseAlphabetically')?.addEventListener('click', () => TextActions.sortReverseAlphabetically());
  document.getElementById('removeDuplicates')?.addEventListener('click', () => TextActions.removeDuplicates());
  document.getElementById('convertToJsonArray')?.addEventListener('click', () => TextActions.convertToJsonArray());
  document.getElementById('convertToJsonObject')?.addEventListener('click', () => TextActions.convertToJsonObject());
  document.getElementById('generateBase64')?.addEventListener('click', () => TextActions.generateBase64());
  document.getElementById('decodeBase64')?.addEventListener('click', () => TextActions.decodeBase64());
  document.getElementById('generateSlug')?.addEventListener('click', () => TextActions.generateSlug());
  document.getElementById('cleanPhoneNumbers')?.addEventListener('click', () => TextActions.cleanPhoneNumbers());
  document.getElementById('replaceNewLineWithTab')?.addEventListener('click', () => TextActions.replaceNewLineWithTab());
  document.getElementById('replaceCommaWithTab')?.addEventListener('click', () => TextActions.replaceCommaWithTab());
  document.getElementById('replaceSemicolonWithTab')?.addEventListener('click', () => TextActions.replaceSemicolonWithTab());
  document.getElementById('countCharacters')?.addEventListener('click', () => TextActions.countCharacters());
  document.getElementById('generateQRCode')?.addEventListener('click', () => TextActions.generateQRCode());
  document.getElementById('copyText')?.addEventListener('click', () => TextActions.copyText());

  console.log('✅ TextMaster успешно загружен и готов к работе.');
});