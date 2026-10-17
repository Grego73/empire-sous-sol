/**
 * L'Empire du Sous-Sol - Logique d'authentification connectée à Supabase
 */

// 1. Initialisation du client Supabase
// Remplacer ces chaînes par vos identifiants uniques disponibles sur votre dashboard Supabase
const SUPABASE_URL = "VOTRE_URL_SUPABASE"; 
const SUPABASE_ANON_KEY = "VOTRE_CLE_ANON_PUBLIQUE";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    console.log("[SYSTEM] Logique de L'Empire du Sous-Sol connectée à Supabase.");
    
    // Optionnel : Vérifier si un utilisateur est déjà connecté à l'ouverture de la page
    checkCurrentUser();
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
 * Intercepte la soumission des formulaires et appelle l'API d'authentification Supabase
 */
async function handleSubmit(event, action) {
    event.preventDefault(); // Empêche le rechargement automatique de la page
    
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
            
            // Étape A : Création de l'utilisateur dans l'authentification Supabase
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    // Sauvegarde du pseudo dans les métadonnées de l'utilisateur
                    data: { display_name: username } 
                }
            });

            if (error) throw error;

            // Étape B : Si la BDD demande une confirmation par email (paramètre par défaut de Supabase)
            if (data.user && data.session === null) {
                alert("Compte créé avec succès ! Veuillez vérifier votre boîte de réception pour confirmer votre email avant de vous connecter.");
                switchTab('login');
                return;
            }

            // Étape C : Création automatique de son profil d'exploitant minier
            if (data.user) {
                await createPlayerProfile(data.user.id, username);
                alert("Bienvenue Commandant ! Votre empire minier est initialisé.");
                window.location.href = "jeu.html"; // Redirection vers l'interface de jeu
            }

        } else if (action === 'connexion') {
            console.log("[AUTH] Tentative de connexion pour :", email);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            console.log("[AUTH] Connexion réussie ! Utilisateur unique ID :", data.user.id);
            window.location.href = "jeu.html"; // Redirection vers l'interface de jeu

        } else if (action === 'recuperation') {
            console.log("[AUTH] Demande de réinitialisation pour :", email);
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reinitialisation.html',
            });

            if (error) throw error;
            alert("Un lien de récupération sécurisé vient de vous être envoyé par email.");
            switchTab('login');
        }

    } catch (err) {
        console.error("[AUTH ERROR] Erreur d'authentification :", err.message);
        alert(`Échec de l'opération : ${err.message}`);
    }
}

/**
 * Fonction utilitaire pour initialiser le profil du joueur dans la table 'profiles' après inscription
 */
async function createPlayerProfile(userId, username) {
    const { error } = await supabase
        .from('profiles')
        .insert([
            { id: userId, username: username, money: 5000 } // Donne les 5000\$ de départ
        ]);
        
    if (error) {
        console.error("[DATABASE ERROR] Impossible de créer le profil joueur :", error.message);
    }
}

/**
 * Vérifie si une session utilisateur active existe déjà
 */
async function checkCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        console.log("[AUTH] Session existante détectée pour :", user.email);
        // Optionnel : décommentez la ligne du dessous pour rediriger automatiquement un joueur déjà connecté
        // window.location.href = "jeu.html";
    }
}
