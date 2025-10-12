let recipes = [];
let currentRecipe = null;
let selectedIngredients = [];

// Функция для загрузки рецептов из localStorage
function loadRecipes() {
    recipes = JSON.parse(localStorage.getItem('recipes')) || [];
}

// Получение случайного рецепта
function getRandomRecipe() {
    return recipes[Math.floor(Math.random() * recipes.length)];
}

// Получение случайных ингредиентов для отвлечения
function getRandomIngredients(correctIngredients, count = 12) {
    let allIngredients = recipes.flatMap(recipe => recipe.ingredients);
    let randomIngredients = [];

    // Отбираем ингредиенты, не входящие в текущий рецепт
    let filteredIngredients = allIngredients.filter(ing => !correctIngredients.some(corr => corr.name === ing.name));

    // Случайные ингредиенты
    while (randomIngredients.length < count - correctIngredients.length) {
        const randomIng = filteredIngredients[Math.floor(Math.random() * filteredIngredients.length)];
        if (!randomIngredients.includes(randomIng)) {
            randomIngredients.push(randomIng);
        }
    }

    // Возвращаем случайные + правильные ингредиенты и перемешиваем их
    return shuffleArray([...correctIngredients, ...randomIngredients]);
}

// Перемешивание массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Отображение списка ингредиентов для выбора
function displayIngredientOptions(ingredients) {
    const ingredientButtonsElement = document.getElementById('ingredient-buttons');
    ingredientButtonsElement.innerHTML = ''; // Очистка кнопок

    ingredients.forEach(ingredient => {
        const button = document.createElement('button');
        button.textContent = ingredient.name;
        button.classList.add('ingredient-button','w-auto');
        button.addEventListener('click', function() {
            addIngredient(ingredient);
        });
        ingredientButtonsElement.appendChild(button);
    });
}

// Добавление выбранного ингредиента
function addIngredient(ingredient) {
    if (selectedIngredients.some(ing => ing.name === ingredient.name)) {
        return; // Предотвращение дублирования
    }

    selectedIngredients.push(ingredient);

    const selectedIngredientsDiv = document.getElementById('selected-ingredients');
    const ingredientDiv = document.createElement('div');
    ingredientDiv.dataset.name = ingredient.name;
    ingredientDiv.classList.add('selected-ingredient', 'flex', 'gap-10', 'items-center');
    const span = document.createElement('span');
    span.textContent = `${ingredient.name}`;
    const input = document.createElement('input');
    input.placeholder = `Введите количество (${ingredient.unit})`;
    input.type = 'number';
    input.step = "0.1";
    input.dataset.name = ingredient.name;
    input.required = true;
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-ingredient', 'bg-red', 'w-auto');
    removeButton.textContent = 'X';
    removeButton.addEventListener('click', function() {
        removeIngredient(ingredient);
    });
    ingredientDiv.appendChild(span);
    ingredientDiv.appendChild(input);
    ingredientDiv.appendChild(removeButton);
    selectedIngredientsDiv.appendChild(ingredientDiv);
}

// Удаление выбранного ингредиента
function removeIngredient(ingredient) {
    selectedIngredients = selectedIngredients.filter(ing => ing.name !== ingredient.name);
    const selectedIngredientsDiv = document.getElementById('selected-ingredients');
    selectedIngredientsDiv.removeChild(document.querySelector(`[data-name="${ingredient.name}"]`));
}

// Проверка ответов
function checkAnswers() {
    let correct = true;
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = ''; // Очистка предыдущего сообщения

    

    // Проверить нет ли выбранных ингредиентов, которых нет в рецепте
    const missingIngredients = selectedIngredients.filter(ing => !currentRecipe.ingredients.some(corr => corr.name === ing.name));
    if (missingIngredients.length > 0) {
        correct = false;
        missingIngredients.forEach(ing => feedbackElement.innerHTML += `${ing.name}: Нет в рецепте.<br>`);
    }

    // Проверить есть ли все ингридиенты из рецепта, если нет то вывести недостающие ингредиенты
    const extraIngredients = currentRecipe.ingredients.filter(ing => !selectedIngredients.some(corr => corr.name === ing.name));
    if (extraIngredients.length > 0) {
        correct = false;
        extraIngredients.forEach(ing => feedbackElement.innerHTML += `${ing.name}: Не хватает ${ing.quantity} ${ing.unit}.<br>`);
    }

    currentRecipe.ingredients.forEach(ing => {
        const selected = selectedIngredients.find(sel => sel.name === ing.name);
        if (selected) {
            const input = document.querySelector(`input[data-name="${selected.name}"]`);
            const userQuantity = parseFloat(input.value.trim());
            const correctQuantity = parseFloat(ing.quantity);

            // Проверяем, если введенное количество не совпадает с правильным
            if (isNaN(userQuantity) || userQuantity !== correctQuantity) {
                correct = false;
                feedbackElement.innerHTML += `${selected.name}: Неправильное количество. Правильное: ${correctQuantity} ${ing.unit}.<br>`;
            }
        }
    });

    //Проверить есть ли выбранные ингредиенты
    if (selectedIngredients.length === 0) {
        correct = false;

        // Вывести все не хватающие ингредиенты и их количество 
        feedbackElement.innerHTML = currentRecipe.ingredients.map(ingredient => `${ingredient.name}: Не хватает ${ingredient.quantity} ${ingredient.unit}.`).join('<br>');
    }

    if (correct) {
        feedbackElement.textContent = 'Все правильно! Отлично!';
        loadNextRecipe(); // Переход к следующему рецепту
    }

    feedbackElement.classList.remove('hidden');
}

// Загрузка следующего рецепта
function loadNextRecipe() {
    currentRecipe = getRandomRecipe();
    selectedIngredients = []; // Сброс выбранных ингредиентов
    document.getElementById('selected-ingredients').innerHTML = ''; // Очистка выбранных ингредиентов
    document.getElementById('recipe-name').textContent = `Рецепт: ${currentRecipe.name}`;

    // Генерация списка с правильными и случайными ингредиентами
    const ingredientOptions = getRandomIngredients(currentRecipe.ingredients);
    displayIngredientOptions(ingredientOptions);

    document.getElementById('feedback').classList.add('hidden'); // Скрытие предыдущего сообщения
}

// Обработчик формы
document.getElementById('test-form').addEventListener('submit', function(event) {
    event.preventDefault();
    checkAnswers();
});

// Загрузка рецептов при загрузке страницы
window.addEventListener('load', function() {
    loadRecipes();
    if (recipes.length === 0) {
        alert('Нет доступных рецептов для тестирования. Пожалуйста, добавьте несколько рецептов сначала.');
        return;
    }
    loadNextRecipe(); // Загрузка первого рецепта
});
