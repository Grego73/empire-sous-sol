/**
 * L'Empire du Sous-Sol - Logique d'authentification connectée à Supabase
 */

// Les clés restent accessibles globalement
const SUPABASE_URL = "https://bxgczdbsgqxykxycmwsn.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_MVfDOGWaMmpSVT7_POsSEw_Q9qmeDCR";

// On utilise directement la bibliothèque locale qui est déjà prête
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[SYSTEM] Logique connectée à Supabase en local.");
    switchTab('login');
    await checkCurrentUser();
});


/**
 * Gère le basculement entre les différents onglets de formulaires
 */
function switchTab(tabName) {
    const panels = document.querySelectorAll('.form-panel');
    panels.forEach(panel => panel.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${tabName}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    if (tabName === 'login' || tabName === 'register') {
        const index = tabName === 'login' ? 0 : 1;
        if (buttons[index]) {
            buttons[index].classList.add('active');
        }
    }
}

/**
 * Vérifie si une session utilisateur active existe déjà
 */
async function checkCurrentUser() {
    // SÉCURITÉ : Si supabase n'est pas encore prêt, on attend un instant
    if (!supabase) {
        console.warn("[AUTH] Supabase n'est pas encore prêt pour checkCurrentUser. Re-tentative...");
        return;
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
            console.log("[AUTH] Session existante détectée pour :", user.email);
            window.location.href = "jeu.html"; // Redirection automatique si déjà connecté
        }
    } catch (err) {
        console.error("[AUTH] Erreur lors de la vérification de session :", err.message);
    }
}

/**
 * Intercepte la soumission des formulaires et appelle l'API d'authentification Supabase
 */
async function handleSubmit(event, action) {
    event.preventDefault(); // Empêche le rechargement automatique de la page
    
    // SÉCURITÉ : Si le joueur clique trop vite avant l'initialisation
    if (!supabase) {
        alert("Le serveur de jeu est en cours de démarrage. Veuillez patienter une seconde.");
        return;
    }

    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const usernameInput = form.querySelector('input[type="text"]');

    const email = emailInput ? emailInput.value : null;
    const password = passwordInput ? passwordInput.value : null;
    const username = usernameInput ? usernameInput.value : null;

    try {
        if (action === 'inscription') {
            console.log("[AUTH] Tentative de création de compte pour :", email);
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { display_name: username } 
                }
            });

            if (error) throw error;

        if (data.user) {
            // Le message idéal pour guider votre joueur
            alert("✉️ Ordre d'inscription envoyé ! Un e-mail de confirmation vient de vous être expédié via Resend. Cliquez sur le lien à l'intérieur pour activer votre compte d'exploitant.");
            switchTab('login'); // On le redirige vers l'onglet de connexion en attendant
        }

        } else if (action === 'connexion') {
            console.log("[AUTH] Tentative de connexion pour :", email);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            console.log("[AUTH] Connexion réussie !");
            window.location.href = "jeu.html";

        } else if (action === 'recuperation') {
            console.log("[AUTH] Demande de réinitialisation pour :", email);
            
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            alert("Un lien de récupération vient de vous être envoyé par email.");
            switchTab('login');
        }

    } catch (err) {
        console.error("[AUTH ERROR] Échec :", err.message);
        alert(`Échec de l'opération : ${err.message}`);
    }
}
