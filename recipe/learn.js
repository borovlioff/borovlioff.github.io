let recipes = [];
let currentRecipeIndex = 0;

function loadRecipes() {
    recipes = JSON.parse(localStorage.getItem('recipes')) || [];
}

function getRandomRecipe() {
    return recipes[Math.floor(Math.random() * recipes.length)];
}

function displayRecipeQuiz(recipe) {
    const recipeNameElement = document.getElementById('recipe-name');
    const ingredientQuizElement = document.getElementById('ingredient-quiz');
    recipeNameElement.textContent = recipe.name;

    ingredientQuizElement.innerHTML = '';
    recipe.ingredients.forEach((ingredient, index) => {
        const ingredientDiv = document.createElement('div');
        ingredientDiv.className = 'ingredient-entry';

        const ingredientLabel = document.createElement('label');
        ingredientLabel.textContent = `${ingredient.name} (${ingredient.unit}): `;
        ingredientDiv.appendChild(ingredientLabel);

        const ingredientInput = document.createElement('input');
        ingredientInput.type = 'text';
        //ingredientInput.setAttribute("step", 0.1);
        ingredientInput.className = 'ingredient-quiz-input';
        ingredientInput.dataset.index = index;
        ingredientInput.required = true;
        ingredientDiv.appendChild(ingredientInput);

        ingredientQuizElement.appendChild(ingredientDiv);
    });
}

function checkAnswers(recipe) {
    const inputs = document.querySelectorAll('.ingredient-quiz-input');
    let correct = true;
    let incorrectIngredients = [];

    inputs.forEach(input => {
        const index = input.dataset.index;
        const userAnswer = input.value.trim();
        const correctAnswer = recipe.ingredients[index].quantity;

        if (userAnswer !== correctAnswer) {
            correct = false;
            incorrectIngredients.push({
                name: recipe.ingredients[index].name,
                correctQuantity: correctAnswer,
                unit: recipe.ingredients[index].unit
            });
        }
    });

    return { correct, incorrectIngredients };
}

function loadNextRecipe() {
    const recipe = getRandomRecipe();
    currentRecipeIndex = recipes.indexOf(recipe);
    displayRecipeQuiz(recipe);
    document.getElementById('learn-form').reset(); // Сброс формы для новых ответов
    document.getElementById('feedback').classList.add('hidden');
}

document.getElementById('learn-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const recipe = recipes[currentRecipeIndex];
    const { correct, incorrectIngredients } = checkAnswers(recipe);

    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = ''; // Очистка предыдущего сообщения

    if (correct) {
        loadNextRecipe(); // Автоматически загрузить следующий рецепт
    } else {
        feedbackElement.textContent = 'Неправильно. Проверьте следующие ингредиенты:';
        incorrectIngredients.forEach(ingredient => {
            const hint = document.createElement('div');
            hint.textContent = `${ingredient.name}: правильное количество — ${ingredient.correctQuantity} ${ingredient.unit}.`;
            feedbackElement.appendChild(hint);
        });
        feedbackElement.classList.remove('hidden');
    }
});

// Загрузка рецептов и первого рецепта при загрузке страницы
window.addEventListener('load', function() {
    loadRecipes();
    if (recipes.length === 0) {
        alert('Нет доступных рецептов для изучения. Пожалуйста, добавьте несколько рецептов сначала.');
        return;
    }
    loadNextRecipe(); // Загружаем первый рецепт
});
