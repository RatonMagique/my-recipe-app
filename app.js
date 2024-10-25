// Récupérer les éléments DOM
const recipeForm = document.getElementById('recipe-form');
const recipeNameInput = document.getElementById('recipe-name');
const recipeTagSelect = document.getElementById('recipe-tag');
const drawRecipesBtn = document.getElementById('draw-recipes-btn');
const randomRecipesList = document.getElementById('random-recipes-list');
const numberOfRecipes = parseInt(document.getElementById('number-of-recipes').value);
const filterTag = document.getElementById('filter-tag').value;
const showAllRecipesBtn = document.getElementById('show-all-recipes-btn');
const completeRecipeList = document.getElementById('complete-recipe-list');
const importRecipesBtn = document.getElementById('import-recipes-btn');
const exportRecipesBtn = document.getElementById('export-recipes-btn');
const importRecipesInput = document.getElementById('import-recipes-input');
const successMessage = document.getElementById('success-message');

// Liste des recettes stockée en mémoire (sera chargée depuis localStorage si disponible)
let recipes = [];

// Enregistre les recettes dans localStorage
function saveRecipesToLocalStorage() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

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
recipeForm.addEventListener('submit', function(event) {
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
    successMessage.textContent = `Recette "${recipeName}" ajoutée avec succès!`;
    
    // Vider le formulaire
    recipeForm.reset();
    
    // Mettre à jour la liste des recettes affichées
    displayCompleteRecipeList();
});

// Fonction pour supprimer une recette
function deleteRecipe(index) {
    recipes.splice(index, 1); // Supprime la recette à l'index spécifié
    saveRecipesToLocalStorage(); // Sauvegarde les changements dans localStorage
    displayCompleteRecipeList(); // Met à jour l'affichage de la liste complète
}

showAllRecipesBtn.addEventListener('click', function() {
    const isDisplayed = completeRecipeList.style.display === 'block';
    completeRecipeList.style.display = isDisplayed ? 'none' : 'block';
    showAllRecipesBtn.textContent = isDisplayed ? 'Afficher la liste complète des recettes' : 'Masquer la liste complète des recettes';

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
drawRecipesBtn.addEventListener('click', function() {
	
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
    randomRecipesList.innerHTML = ''; // Vider la liste existante
    randomRecipes.forEach(recipe => {
        const listItem = document.createElement('li');
        listItem.textContent = `${recipe.name} - ${recipe.tag}`;
        randomRecipesList.appendChild(listItem);
    });
});

// Fonction d'export des recettes en fichier JSON
function exportRecipes() {
    const json = JSON.stringify(recipes, null, 2); // Convertir les recettes en JSON avec une indentation
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'recettes.json'; // Nom du fichier exporté
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Libérer l'URL de l'objet après l'export
}

// Fonction d'import des recettes depuis un fichier JSON
// Ajout des recettes importées à la liste existante, en gérant les doublons
function importRecipes(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const json = e.target.result;
        try {
            let importedRecipes = JSON.parse(json);

            // Vérification du format des données importées
            if (!Array.isArray(importedRecipes) || !importedRecipes.every(recipe => recipe.name && recipe.tag)) {
                console.error("Format JSON invalide : doit être un tableau d'objets avec 'name' et 'tag'.");
                alert("Format JSON invalide : chaque recette doit avoir un 'name' et un 'tag'.");
                return;
            }

            // Étape 1 : Éliminer les doublons dans le fichier importé
            const uniqueImportedRecipes = [];
            const duplicateNamesInFile = new Set();

            importedRecipes.forEach((recipe) => {
                if (!uniqueImportedRecipes.some(r => r.name.toLowerCase() === recipe.name.toLowerCase())) {
                    uniqueImportedRecipes.push(recipe);
                } else {
                    duplicateNamesInFile.add(recipe.name);
                }
            });

            // Avertir l'utilisateur des doublons dans le fichier
            if (duplicateNamesInFile.size > 0) {
                alert("Doublons détectés dans le fichier importé pour les recettes : " + Array.from(duplicateNamesInFile).join(", ") + ". Une seule version de chaque recette a été ajoutée.");
            }

            // Étape 2 : Ajouter uniquement les recettes uniques qui n'existent pas encore dans la liste `recipes`
            const newRecipes = uniqueImportedRecipes.filter(recipe =>
                !recipes.some(existingRecipe => existingRecipe.name.toLowerCase() === recipe.name.toLowerCase())
            );

            // Avertir l'utilisateur des recettes déjà présentes dans `recipes`
            if (newRecipes.length < uniqueImportedRecipes.length) {
                const existingRecipeNames = uniqueImportedRecipes
                    .filter(recipe => !newRecipes.includes(recipe))
                    .map(recipe => recipe.name);
                
                alert("Certaines recettes importées existent déjà dans la liste actuelle : " + existingRecipeNames.join(", ") + ". Elles n'ont pas été ajoutées.");
            }

            // Ajouter les nouvelles recettes à `recipes` et sauvegarder
            recipes.push(...newRecipes);
            saveRecipesToLocalStorage();
            displayCompleteRecipeList(); // Mettre à jour l'affichage

            // Afficher un message de succès
            successMessage.textContent = "Recettes importées avec succès :" + newRecipes;
            console.log("Recettes importées avec succès :", newRecipes);

            // Réinitialiser le champ de saisie après importation
            importRecipesInput.value = '';
            setTimeout(() => {
                successMessage.textContent = '';
            }, 3000);

        } catch (err) {
            alert("Erreur lors de l'importation des recettes, vérifiez votre fichier");
            console.error("Erreur lors de l'importation :", err);
        }
    };
    reader.readAsText(file);
}


// Associer le bouton d'exportation à la fonction exportRecipes
exportRecipesBtn.addEventListener('click', exportRecipes);

// Associer le bouton d'importation à la fonction importRecipes
importRecipesBtn.addEventListener("click", function() {
    importRecipesInput.click();
});

// Ajoutez ici l'événement pour traiter l'importation
importRecipesInput.addEventListener('change', importRecipes);

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js').then(function(registration) {
            console.log('Service Worker enregistré avec succès :', registration);
        }, function(err) {
            console.log('Erreur lors de l\'enregistrement du Service Worker :', err);
        });
    });
}
