document.addEventListener('DOMContentLoaded', function () {
    loadState();

    document.getElementById('process-btn').addEventListener('click', function () {
        const queryInput = document.getElementById('query-input').value;
        const queries = queryInput.split('\n').filter(query => query.trim() !== '');
        const uniqueWords = new Set();

        queries.forEach(query => {
            query.split(' ').forEach(word => {
                uniqueWords.add(word.trim().toLowerCase());
            });
        });

        renderUniqueWords(Array.from(uniqueWords));
        document.getElementById('result-btn').style.display = 'block';
        document.getElementById('sort-btn').style.display = 'block';
        saveState();
    });

    document.getElementById('result-btn').addEventListener('click', function () {
        const queryInput = document.getElementById('query-input').value;
        const queries = queryInput.split('\n').filter(query => query.trim() !== '');
        const inactiveWords = Array.from(document.querySelectorAll('#unique-words input:not(:checked)')).map(checkbox => checkbox.dataset.word);

        const filteredQueries = queries.filter(query => {
            const wordsInQuery = query.toLowerCase().split(' ').map(word => word.trim());
            return !inactiveWords.some(inactiveWord => wordsInQuery.includes(inactiveWord));
        });

        document.getElementById('result-output').value = filteredQueries.join('\n');
        saveState();
    });

    document.getElementById('clear-btn').addEventListener('click', function () {
        localStorage.removeItem('semanticKernelState');
        document.getElementById('query-input').value = '';
        document.getElementById('unique-words').innerHTML = '';
        document.getElementById('result-output').value = '';
        document.getElementById('result-btn').style.display = 'none';
        document.getElementById('sort-btn').style.display = 'none';
    });

    document.getElementById('sort-btn').addEventListener('click', function () {
        const uniqueWords = Array.from(document.querySelectorAll('#unique-words input')).map(checkbox => ({
            word: checkbox.dataset.word,
            checked: checkbox.checked
        }));

        uniqueWords.sort((a, b) => a.word.localeCompare(b.word));

        renderUniqueWords(uniqueWords.map(item => item.word), uniqueWords.map(item => item.checked));
        saveState();
    });

    function renderUniqueWords(words, checkedStates) {
        const uniqueWordsContainer = document.getElementById('unique-words');
        uniqueWordsContainer.innerHTML = '';

        words.forEach((word, index) => {
            const wordContainer = document.createElement('label');
            wordContainer.classList.add('unique-word');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = checkedStates ? checkedStates[index] : true;
            checkbox.dataset.word = word;
            checkbox.addEventListener('change', saveState);

            const labelText = document.createElement('span');
            labelText.textContent = word;

            wordContainer.appendChild(checkbox);
            wordContainer.appendChild(labelText);
            uniqueWordsContainer.appendChild(wordContainer);
        });
    }

    function saveState() {
        const queryInput = document.getElementById('query-input').value;
        const uniqueWords = Array.from(document.querySelectorAll('#unique-words input')).map(checkbox => ({
            word: checkbox.dataset.word,
            checked: checkbox.checked
        }));

        const state = {
            queryInput,
            uniqueWords
        };

        localStorage.setItem('semanticKernelState', JSON.stringify(state));
    }

    function loadState() {
        const state = JSON.parse(localStorage.getItem('semanticKernelState'));

        if (state) {
            document.getElementById('query-input').value = state.queryInput;

            if (state.uniqueWords && state.uniqueWords.length > 0) {
                const words = state.uniqueWords.map(item => item.word);
                const checkedStates = state.uniqueWords.map(item => item.checked);
                renderUniqueWords(words, checkedStates);

                document.getElementById('result-btn').style.display = 'block';
                document.getElementById('sort-btn').style.display = 'block';
            }
        }
    }
});
