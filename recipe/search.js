// Получаем список рецептов из localStorage
function getRecipesFromLocalStorage() {
    const recipes = localStorage.getItem('recipes');
    return recipes ? JSON.parse(recipes) : [];
}

// Функция для поиска рецепта
function searchRecipe(query) {
    const recipes = getRecipesFromLocalStorage();
    const lowerCaseQuery = query.toLowerCase();
    const results = recipes.filter(recipe => {
        // Проверяем, содержится ли название или какой-либо ингредиент в запросе
        return recipe.name.toLowerCase().includes(lowerCaseQuery) ||
            recipe.ingredients.some(ingredient => 
                ingredient.name.toLowerCase().includes(lowerCaseQuery)
            );
    });
    return results;
}

// Отображение результатов поиска
function displayResults(results) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = ''; // Очистка предыдущих результатов

    if (results.length === 0) {
        resultContainer.innerHTML = '<p>Рецепты не найдены.</p>';
        return;
    }

    results.forEach(recipe => {
        const recipeItem = document.createElement('div');
        recipeItem.classList.add('recipe-item');
        recipeItem.innerHTML = `
            <h3>${recipe.name}</h3>
            <ul>
                ${recipe.ingredients.map(ingredient => `
                    <li>${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}</li>
                `).join('')}
            </ul>
        `;
        resultContainer.appendChild(recipeItem);
    });
}

// Обработчик события для формы поиска
document.getElementById('search-input').addEventListener('input', function() {
    const query = this.value;
    const results = searchRecipe(query);
    displayResults(results);
});
