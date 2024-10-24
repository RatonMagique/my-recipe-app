// Enregistre les recettes dans localStorage
function saveRecipesToLocalStorage() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Liste des recettes stockée en mémoire (sera chargée depuis localStorage si disponible)
let recipes = [];

// Vérifie si des recettes sont déjà présentes dans localStorage
function loadRecipesFromLocalStorage() {
    const storedRecipes = localStorage.getItem('recipes');
    if (storedRecipes) {
        recipes = JSON.parse(storedRecipes);
        displayCompleteRecipeList();  // Afficher les recettes stockées lors du chargement
    }
}

// Charger les recettes depuis localStorage au chargement de la page
window.onload = function() {
    loadRecipesFromLocalStorage();
};

// Ajout d'une nouvelle recette
document.getElementById('recipe-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const recipeName = document.getElementById('recipe-name').value;
    const recipeTag = document.getElementById('recipe-tag').value;
    
    // Vérifier les doublons
    const recipeExists = recipes.some(recipe => recipe.name.toLowerCase() === recipeName.toLowerCase());
    if (recipeExists) {
        alert("Cette recette existe déjà !");
        return; // Sortir de la fonction si la recette existe
    }
    
    recipes.push({ name: recipeName, tag: recipeTag });
    saveRecipesToLocalStorage();
    
    // Afficher un message de succès
    document.getElementById('success-message').textContent = "Recette ajoutée avec succès !";
    
    // Vider le formulaire
    document.getElementById('recipe-form').reset();
    
    // Mettre à jour la liste des recettes affichées
    displayCompleteRecipeList();
});

// Fonction pour supprimer une recette
function deleteRecipe(index) {
    recipes.splice(index, 1); // Supprime la recette à l'index spécifié
    saveRecipesToLocalStorage(); // Sauvegarde les changements dans localStorage
    displayCompleteRecipeList(); // Met à jour l'affichage de la liste complète
}

// Fonction pour afficher/masquer la liste complète des recettes
const completeRecipeList = document.getElementById('complete-recipe-list');
const showAllRecipesButton = document.getElementById('show-all-recipes-btn');

showAllRecipesButton.addEventListener('click', function() {
    const isDisplayed = completeRecipeList.style.display === 'block';
    completeRecipeList.style.display = isDisplayed ? 'none' : 'block';
    showAllRecipesButton.textContent = isDisplayed ? 'Afficher la liste complète des recettes' : 'Masquer la liste complète des recettes';

    // Afficher les recettes si on ouvre la liste
    if (!isDisplayed) {
        displayCompleteRecipeList();
    }
});

// Fonction pour afficher toutes les recettes dans la liste complète
function displayCompleteRecipeList() {
    completeRecipeList.innerHTML = ''; // Vider la liste existante

    recipes.forEach((recipe, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${recipe.name} - ${recipe.tag}`;

        // Création d'un bouton de suppression pour la liste complète
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', function() {
            deleteRecipe(index);
        });

        listItem.appendChild(deleteButton);
        completeRecipeList.appendChild(listItem);
    });
}

// Tirer des recettes au sort
document.getElementById('draw-recipes-btn').addEventListener('click', function() {
    const numberOfRecipes = parseInt(document.getElementById('number-of-recipes').value);
    const filterTag = document.getElementById('filter-tag').value;
    
    // Filtrer les recettes si un filtre est choisi
    let filteredRecipes = recipes;
    if (filterTag !== 'all') {
        filteredRecipes = recipes.filter(recipe => recipe.tag === filterTag);
    }
    
    // Tirer au sort les recettes sans doublons
    const randomRecipes = [];
    const uniqueIndices = new Set(); // Pour stocker les indices déjà tirés
    while (randomRecipes.length < numberOfRecipes && randomRecipes.length < filteredRecipes.length) {
        const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
        if (!uniqueIndices.has(randomIndex)) {
            randomRecipes.push(filteredRecipes[randomIndex]);
            uniqueIndices.add(randomIndex); // Ajoute l'index pour éviter les doublons
        }
    }

    // Afficher les recettes tirées au sort
    const randomRecipesList = document.getElementById('random-recipes-list');
    randomRecipesList.innerHTML = ''; // Vider la liste existante
    randomRecipes.forEach(recipe => {
        const listItem = document.createElement('li');
        listItem.textContent = `${recipe.name} - ${recipe.tag}`;
        randomRecipesList.appendChild(listItem);
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js').then(function(registration) {
            console.log('Service Worker enregistré avec succès :', registration);
        }, function(err) {
            console.log('Erreur lors de l\'enregistrement du Service Worker :', err);
        });
    });
}
