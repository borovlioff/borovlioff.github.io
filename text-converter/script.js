function capitalizeText() {
    const text = document.getElementById('textArea').value;

    // Регулярное выражение для поиска начала строки или символа после точки,
    // а также начало строки после переноса (\n)
    const result = text.replace(/(^|\.\s*|\n)([a-zа-я])/gi, (_, p1, p2) => p1 + p2.toUpperCase());

    document.getElementById('textArea').value = result;
  }
  
  function uppercaseText() {
    const text = document.getElementById('textArea').value;
    document.getElementById('textArea').value = text.toUpperCase();
  }
  
  function lowercaseText() {
    const text = document.getElementById('textArea').value;
    document.getElementById('textArea').value = text.toLowerCase();
  }
  
  function cleanPhoneNumbers() {
    const text = document.getElementById('textArea').value;
    const result = text.replace(/\D/g, '');
    document.getElementById('textArea').value = result;
  }
  
  function convertToJsonArray() {
    const text = document.getElementById('textArea').value;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    document.getElementById('textArea').value = JSON.stringify(lines, null, 2);
  }
  
  function convertToJsonObject() {
    const text = document.getElementById('textArea').value;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const obj = {};
    lines.forEach((line, index) => {
      obj[transliterate(line)] = line;
    });
    document.getElementById('textArea').value = JSON.stringify(obj, null, 2);
  }
  
  function sortAlphabetically() {
    const text = document.getElementById('textArea').value;
    const lines = text.split('\n').filter(line => line.trim() !== '').sort();
    document.getElementById('textArea').value = lines.join('\n');
  }
  
  function sortReverseAlphabetically() {
    const text = document.getElementById('textArea').value;
    const lines = text.split('\n').filter(line => line.trim() !== '').sort().reverse();
    document.getElementById('textArea').value = lines.join('\n');
  }
  
  function generateQRCode() {
    const text = document.getElementById('textArea').value;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    window.open(qrCodeUrl, '_blank');
  }
  
  function removeExtraSpaces() {
    const text = document.getElementById('textArea').value;
    const result = text.trim() // Убираем пробелы в начале и конце всей строки
    .replace(/ +/g, ' ') // Заменяем все последовательности пробелов на один пробел
    .replace(/^\s+|\s+$/gm, '');
    document.getElementById('textArea').value = result;
  }
  
  function countCharacters() {
    const text = document.getElementById('textArea').value;
    alert(`Количество символов: ${text.length}`);
  }
  
  function generateBase64() {
    const text = document.getElementById('textArea').value;
    const result = btoa(text);
    document.getElementById('textArea').value = result;
  }
  
  function decodeBase64() {
    const text = document.getElementById('textArea').value;
    try {
      const result = atob(text);
      document.getElementById('textArea').value = result;
    } catch (e) {
      alert('Неверный формат Base64');
    }
  }
  
  function generateSlug() {
    const text = document.getElementById('textArea').value;
    const result = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    document.getElementById('textArea').value = result;
  }
  
  function removeHtmlTags() {
    const text = document.getElementById('textArea').value;
    const result = text.replace(/<[^>]*>/g, '');
    document.getElementById('textArea').value = result;
  }
  
  function transliterate(text) {
    const cyrillicToLatin = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
        и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
        с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
        ъ: '', ь: '', ы: 'y', э: 'e', ю: 'yu', я: 'ya'
    };

    // Функция для преобразования одного символа
    function convertChar(char) {
        const lowerChar = char.toLowerCase();
        const transliterated = cyrillicToLatin[lowerChar] || char; // Если символ не найден, оставляем его как есть

        // Удаляем мягкий знак (большой или маленький)
        if (lowerChar === 'ь' || lowerChar === 'ъ') {
            return '';
        }

        // Возвращаем результат с учетом регистра
        return char === char.toUpperCase() ? transliterated.toUpperCase() : transliterated;
    }

    // Преобразуем весь текст
    return text.split('').map(convertChar).join('');
}
  
  function convertToTranslit() {
    const text = document.getElementById('textArea').value;
    document.getElementById('textArea').value = transliterate(text);
  }
  
  function removeDuplicates() {
    const text = document.getElementById('textArea').value;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const uniqueLines = [...new Set(lines)];
    document.getElementById('textArea').value = uniqueLines.join('\n');
  }
  
  function replaceNewLineWithTab() {
    const text = document.getElementById('textArea').value;
    document.getElementById('textArea').value = text.replace(/\n/g, '\t');
  }
  
  function replaceCommaWithTab() {
    const text = document.getElementById('textArea').value;
    document.getElementById('textArea').value = text.replace(/,/g, '\t');
  }
  
  function replaceSemicolonWithTab() {
    const text = document.getElementById('textArea').value;
    document.getElementById('textArea').value = text.replace(/;/g, '\t');
  }
  
  function randomizeText() {
    const text = document.getElementById('textArea').value;
    const result = text.replace(/([а-яА-Я])/g, match => String.fromCharCode(match.charCodeAt(0) ^ 0x40));
    document.getElementById('textArea').value = result;
  }
  
  function copyText() {
    const textArea = document.getElementById('textArea');
    textArea.select();
    document.execCommand('copy');
    alert('Текст скопирован!');
  }