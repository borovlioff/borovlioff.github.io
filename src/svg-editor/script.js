import './styles.css';

document.addEventListener("DOMContentLoaded", () => {
    const uploadInput = document.getElementById("upload");
    const svgText = document.getElementById("svg-text");
    const previewBtn = document.getElementById("preview-btn");
    const convertBtn = document.getElementById("convert-btn");
    const colorPicker = document.getElementById("color-picker");
    const scaleInput = document.getElementById("scale-input");
    const scaleValue = document.getElementById("scale-value");
    const svgPreview = document.getElementById("svg-preview");
    const base64Output = document.getElementById("base64-output");
    const copyResultBtn = document.getElementById("copy-result");

    let currentSvgElement = null;

    // Обновление предпросмотра
    function updatePreview(svgContent) {
        svgPreview.innerHTML = "";
        if (!svgContent || !svgContent.trim()) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");
        const svgElement = doc.querySelector("svg");

        if (svgElement) {
            svgElement.style.maxWidth = "100%";
            svgElement.style.maxHeight = "100%";
            svgElement.style.transformOrigin = "center";
            svgElement.style.fill = colorPicker.value;
            svgElement.style.stroke = colorPicker.value;
            svgElement.style.transform = `scale(${scaleInput.value})`;

            svgPreview.appendChild(svgElement);
            currentSvgElement = svgElement;
        } else {
            const error = document.createElement("p");
            error.className = "text-red-400 text-sm";
            error.textContent = "Ошибка: Некорректный SVG.";
            svgPreview.appendChild(error);
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

    // Предпросмотр по кнопке
    previewBtn.addEventListener("click", () => {
        updatePreview(svgText.value);
    });

    // Изменение цвета
    colorPicker.addEventListener("input", () => {
        if (currentSvgElement) {
            currentSvgElement.style.fill = colorPicker.value;
            currentSvgElement.style.stroke = colorPicker.value;
        }
    });

    // Изменение масштаба
    scaleInput.addEventListener("input", () => {
        scaleValue.textContent = `${parseFloat(scaleInput.value).toFixed(1)}x`;
        if (currentSvgElement) {
            currentSvgElement.style.transform = `scale(${scaleInput.value})`;
        }
    });

    // Конвертация в Base64
    convertBtn.addEventListener("click", () => {
        const svgContent = svgText.value.trim();
        if (!svgContent) {
            alert("Введите или загрузите SVG.");
            return;
        }

        try {
            const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);

            fetch(url)
                .then(res => res.arrayBuffer())
                .then(buffer => {
                    const bytes = new Uint8Array(buffer);
                    let binary = '';
                    for (let i = 0; i < bytes.length; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    const base64 = btoa(binary);
                    base64Output.value = `data:image/svg+xml;base64,${base64}`;
                })
                .catch(err => {
                    console.error("Ошибка конвертации:", err);
                    alert("Ошибка при создании Base64.");
                })
                .finally(() => {
                    URL.revokeObjectURL(url);
                });
        } catch (err) {
            console.error("Ошибка обработки SVG:", err);
            alert("Не удалось обработать SVG.");
        }
    });

    // Копирование результата
    copyResultBtn.addEventListener("click", () => {
        if (base64Output.value) {
            base64Output.select();
            document.execCommand("copy"); // Для старых браузеров
            copyResultBtn.textContent = "✅ Скопировано!";
            setTimeout(() => {
                copyResultBtn.textContent = "📋 Копировать";
            }, 2000);
        }
    });
});