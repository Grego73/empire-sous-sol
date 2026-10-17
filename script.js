/**
 * L'Empire du Sous-Sol - Logique d'authentification et de navigation
 */

// Attendre que le document HTML soit complètement chargé avant d'exécuter le script
document.addEventListener("DOMContentLoaded", () => {
    console.log("[SYSTEM] Logique de L'Empire du Sous-Sol initialisée.");
});

/**
 * Gère le basculement entre les différents onglets de formulaires
 * @param {string} tabName - Le nom du panneau à afficher ('login', 'register', 'forgot')
 */
function switchTab(tabName) {
    // 1. Cacher tous les panneaux de formulaires
    const panels = document.querySelectorAll('.form-panel');
    panels.forEach(panel => panel.classList.remove('active'));

    // 2. Désactiver le style visuel de tous les boutons d'onglets
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 3. Afficher le panneau ciblé
    const targetPanel = document.getElementById(`panel-${tabName}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    // 4. Mettre à jour l'état actif sur l'onglet correspondant (si applicable)
    if (tabName === 'login' || tabName === 'register') {
        const index = tabName === 'login' ? 0 : 1;
        if (buttons[index]) {
            buttons[index].classList.add('active');
        }
    }
}

/**
 * Intercepte la soumission des formulaires pour traitement futur avec Supabase
 * @param {Event} event - L'événement de soumission natif du formulaire
 * @param {string} action - L'action demandée ('connexion', 'inscription', 'recuperation')
 */
function handleSubmit(event, action) {
    event.preventDefault(); // Empêche la page de se recharger
    
    // Exemple de récupération des données selon l'action (Utile pour la future liaison API)
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const usernameInput = form.querySelector('input[type="text"]');

    const data = {
        email: emailInput ? emailInput.value : null,
        password: passwordInput ? passwordInput.value : null,
        username: usernameInput ? usernameInput.value : null
    };

    console.log(`[AUTH] Tentative de ${action} détectée :`, data.email);

    // Message temporaire avant l'intégration du SDK Supabase
    alert(`Action d'administration validée : ${action.toUpperCase()}.\nLa structure des données est prête pour la connexion à Supabase !`);
}
