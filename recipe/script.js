// Функция для загрузки рецептов из localStorage
function loadRecipes() {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    const recipeList = document.getElementById('recipe-list');

    recipeList.innerHTML = '';  // Очистка списка перед загрузкой

    savedRecipes.forEach((recipe, index) => {
        const recipeItem = document.createElement('li');
        recipeItem.className = 'recipe-item';
        recipeItem.innerHTML = `
            <span>${recipe.name}: ${recipe.ingredients.map(ing => `${ing.name} (${ing.quantity} ${ing.unit})`).join(', ')}</span>
            <div class="recipe-actions">
                <button class="edit-recipe" data-index="${index}">Редактировать</button>
                <button class="delete-recipe" data-index="${index}">Удалить</button>
            </div>
        `;
        recipeList.appendChild(recipeItem);
    });

    // Привязка обработчиков событий к кнопкам редактирования и удаления
    document.querySelectorAll('.edit-recipe').forEach(button => {
        button.addEventListener('click', editRecipe);
    });
    document.querySelectorAll('.delete-recipe').forEach(button => {
        button.addEventListener('click', deleteRecipe);
    });
}

// Функция для сохранения рецептов в localStorage
function saveRecipes(recipes) {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Функция для добавления рецепта
function saveRecipe(recipe) {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    savedRecipes.push(recipe);
    saveRecipes(savedRecipes);
    loadRecipes(); // Обновление списка рецептов
}

// Обработчик добавления ингредиента
document.getElementById('add-ingredient').addEventListener('click', function() {
    const ingredientList = document.getElementById('ingredient-list');
    const ingredientCount = ingredientList.children.length + 1;

    const ingredientEntry = document.createElement('div');
    ingredientEntry.className = 'ingredient-entry w-full';

    const newIngredientName = document.createElement('input');
    newIngredientName.type = 'text';
    newIngredientName.className = 'ingredient-name w-full';
    newIngredientName.placeholder = `Ингредиент ${ingredientCount}`;
    newIngredientName.required = true;

    const newIngredientQuantity = document.createElement('input');
    newIngredientQuantity.type = 'number';
    newIngredientQuantity.step = '0.1';
    newIngredientQuantity.className = 'ingredient-quantity w-full';
    newIngredientQuantity.placeholder = 'Количество';
    newIngredientQuantity.required = true;

    const newIngredientUnit = document.createElement('input');
    newIngredientUnit.type = 'text';
    newIngredientUnit.className = 'ingredient-unit w-full';
    newIngredientUnit.placeholder = 'Единица измерения';
    newIngredientUnit.required = true;

    ingredientEntry.appendChild(newIngredientName);
    ingredientEntry.appendChild(newIngredientQuantity);
    ingredientEntry.appendChild(newIngredientUnit);
    ingredientList.appendChild(ingredientEntry);
});

// Обработчик сохранения рецепта
document.getElementById('recipe-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const recipeName = document.getElementById('recipe-name').value;
    const ingredients = Array.from(document.getElementsByClassName('ingredient-entry')).map(entry => {
        return {
            name: entry.querySelector('.ingredient-name').value,
            quantity: entry.querySelector('.ingredient-quantity').value,
            unit: entry.querySelector('.ingredient-unit').value
        };
    }).filter(ing => ing.name.trim() !== '' && ing.quantity.trim() !== '' && ing.unit.trim() !== '');

    const recipe = {
        name: recipeName,
        ingredients: ingredients
    };

    // Добавление рецепта в список и сохранение его в localStorage
    saveRecipe(recipe);

    // Сброс формы
    document.getElementById('recipe-name').value = '';
    document.getElementById('ingredient-list').innerHTML = '';
    const initialIngredientEntry = document.createElement('div');
    initialIngredientEntry.className = 'ingredient-entry';

    const initialIngredientName = document.createElement('input');
    initialIngredientName.type = 'text';
    initialIngredientName.className = 'ingredient-name';
    initialIngredientName.placeholder = 'Ингредиент 1';
    initialIngredientName.required = true;

    const initialIngredientQuantity = document.createElement('input');
    initialIngredientQuantity.type = 'text';
    initialIngredientQuantity.className = 'ingredient-quantity';
    initialIngredientQuantity.placeholder = 'Количество';
    initialIngredientQuantity.required = true;

    const initialIngredientUnit = document.createElement('input');
    initialIngredientUnit.type = 'text';
    initialIngredientUnit.className = 'ingredient-unit';
    initialIngredientUnit.placeholder = 'Единица измерения';
    initialIngredientUnit.required = true;

    initialIngredientEntry.appendChild(initialIngredientName);
    initialIngredientEntry.appendChild(initialIngredientQuantity);
    initialIngredientEntry.appendChild(initialIngredientUnit);
    document.getElementById('ingredient-list').appendChild(initialIngredientEntry);
});

// Обработчик редактирования рецепта
function editRecipe(event) {
    const index = event.target.dataset.index;
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    const recipe = savedRecipes[index];

    document.getElementById('recipe-name').value = recipe.name;
    const ingredientList = document.getElementById('ingredient-list');
    ingredientList.innerHTML = ''; // Очистка текущих ингредиентов

    recipe.ingredients.forEach((ingredient, idx) => {
        const ingredientEntry = document.createElement('div');
        ingredientEntry.className = 'ingredient-entry';

        const ingredientName = document.createElement('input');
        ingredientName.type = 'text';
        ingredientName.className = 'ingredient-name w-full';
        ingredientName.placeholder = `Ингредиент ${idx + 1}`;
        ingredientName.value = ingredient.name;
        ingredientName.required = true;

        const ingredientQuantity = document.createElement('input');
        ingredientQuantity.type = 'number';
        ingredientQuantity.step = '0.1';
        ingredientQuantity.className = 'ingredient-quantity w-full';
        ingredientQuantity.placeholder = 'Количество';
        ingredientQuantity.value = ingredient.quantity;
        ingredientQuantity.required = true;

        const ingredientUnit = document.createElement('input');
        ingredientUnit.type = 'text';
        ingredientUnit.className = 'ingredient-unit w-full';
        ingredientUnit.placeholder = 'Единица измерения';
        ingredientUnit.value = ingredient.unit;
        ingredientUnit.required = true;

        ingredientEntry.appendChild(ingredientName);
        ingredientEntry.appendChild(ingredientQuantity);
        ingredientEntry.appendChild(ingredientUnit);
        ingredientList.appendChild(ingredientEntry);
    });

    // Удаление редактируемого рецепта из списка
    savedRecipes.splice(index, 1);
    saveRecipes(savedRecipes);
    loadRecipes();
}

// Обработчик удаления рецепта
function deleteRecipe(event) {
    const index = event.target.dataset.index;
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    savedRecipes.splice(index, 1); // Удаление рецепта по индексу
    saveRecipes(savedRecipes);
    loadRecipes();
}

// Обработчик удаления всех рецептов
document.getElementById('delete-all-recipes').addEventListener('click', function() {
    if (confirm('Вы уверены, что хотите удалить все рецепты?')) {
        localStorage.removeItem('recipes');
        loadRecipes();
    }
});

// Обработчик импорта рецептов
document.getElementById('import-recipes').addEventListener('click', function() {
    const importArea = document.getElementById('import-area').value.trim();
    if (!importArea) return;

    const lines = importArea.split('\n');
    const recipes = [];

    lines.forEach(line => {
        const [recipeName, ingredientsPart] = line.split(':');
        const ingredientsArray = ingredientsPart.split(';').map(ing => {
            const [name, quantity, unit] = ing.trim().split(', ');
            return { name: name.trim(), quantity: quantity.trim(), unit: unit.trim() };
        });

        recipes.push({ name: recipeName.trim(), ingredients: ingredientsArray });
    });

    recipes.forEach(recipe => saveRecipe(recipe));
    loadRecipes();

    // Очистка поля импорта после завершения
    document.getElementById('import-area').value = '';
});

// Обработчик экспорта рецептов
document.getElementById('export-recipes').addEventListener('click', function() {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    const exportArea = document.getElementById('export-area');

    const exportLines = savedRecipes.map(recipe => {
        const ingredients = recipe.ingredients.map(ing => `${ing.name}, ${ing.quantity}, ${ing.unit}`).join('; ');
        return `${recipe.name}: ${ingredients}`;
    }).join('\n');

    exportArea.value = exportLines;
});

// Загрузка рецептов при загрузке страницы
window.addEventListener('load', loadRecipes);


// При нажатие <button id="export-recipes-url">Экспортировать рецепты в URL</button>
// Сжимать данные рецептов и формировать url для импорта в браузере
// LZW-compress a string
function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i=1; i<data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
           phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}

document.getElementById('export-recipes-url').addEventListener('click', function() {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    const exportUrl = `${window.location.href}`+'?data=' + encodeURIComponent(lzw_encode(JSON.stringify(savedRecipes)));

    // Скопировать URL в буфер обмена
    navigator.clipboard.writeText(exportUrl);
    document.getElementById('export-recipes-url').setAttribute('href', exportUrl);
});