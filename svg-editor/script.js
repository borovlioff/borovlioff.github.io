document.addEventListener("DOMContentLoaded", () => {
    const uploadInput = document.getElementById("upload");
    const svgText = document.getElementById("svg-text");
    const previewBtn = document.getElementById("preview-btn");
    const convertBtn = document.getElementById("convert-btn");
    const colorPicker = document.getElementById("color-picker");
    const scaleInput = document.getElementById("scale-input");
    const svgPreview = document.getElementById("svg-preview");
    const base64Output = document.getElementById("base64-output");
  
    // Функция для обновления предпросмотра SVG
    function updatePreview(svgContent) {
      svgPreview.innerHTML = ""; // Очистка предыдущего содержимого
      if (!svgContent.trim()) return;
  
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = doc.querySelector("svg");
  
      if (svgElement) {
        svgPreview.appendChild(svgElement);
  
        // Добавление обработчиков для изменения цвета и размера
        colorPicker.addEventListener("input", () => {
          const color = colorPicker.value;
          svgElement.style.fill = color;
          svgElement.style.stroke = color;
        });
  
        scaleInput.addEventListener("input", () => {
          const scale = parseFloat(scaleInput.value);
          svgElement.style.transform = `scale(${scale})`;
        });
      }
    }
  
    // Обработка загрузки файла
    uploadInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          svgText.value = event.target.result;
          updatePreview(event.target.result);
        };
        reader.readAsText(file);
      }
    });
  
    // Обработка кнопки "Предпросмотр"
    previewBtn.addEventListener("click", () => {
      const svgContent = svgText.value;
      updatePreview(svgContent);
    });
  
    // Конвертация SVG в Base64
    convertBtn.addEventListener("click", () => {
      const svgContent = svgText.value;
      if (!svgContent.trim()) {
        alert("SVG не найден!");
        return;
      }
  
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          base64Output.value = `data:image/svg+xml;base64,${base64}`;
        })
        .catch((error) => console.error("Ошибка конвертации:", error));
    });
  });