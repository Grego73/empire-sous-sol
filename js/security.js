/**
 * L'Empire du Sous-Sol - Module de Sécurité et Protection des Pages
 */

// 1. Initialisation du client Supabase (doit correspondre à vos identifiants)
const SUPABASE_URL = "https://bxgczdbsgqxykxycmwsn.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_MVfDOGWaMmpSVT7_POsSEw_Q9qmeDCR";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Exécution automatique de la vérification de sécurité au chargement
document.addEventListener("DOMContentLoaded", async () => {
    await checkAuthAndProtect();
    
    // Associer automatiquement la fonction de déconnexion au bouton s'il existe
    const logoutBtn = document.getElementById("btnLogout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }
});

/**
 * Vérifie si l'utilisateur est connecté. 
 * Si non, il est immédiatement expulsé vers la page d'accueil.
 */
async function checkAuthAndProtect() {
    // Récupère l'utilisateur actuellement connecté via la session Supabase
    const { data: { user }, error } = await supabase.auth.getUser();

    // Si aucun utilisateur n'est trouvé, redirection immédiate vers l'accueil
    if (error || !user) {
        console.warn("[SECURITY] Accès refusé : Session invalide ou expirée. Redirection...");
        window.location.href = "index.html";
        return;
    }

    console.log(`[SECURITY] Session validée pour l'exploitant : ${user.email}`);
    
    // Optionnel : Si vous êtes sur la page admin, on vérifie un critère supplémentaire ici
    if (window.location.pathname.includes("admin.html")) {
        // Exemple : Vérifier si l'email ou un attribut metadata correspond à l'admin
        if (user.email !== "votre_email_admin@domaine.com") {
            alert("Accès Admin Interdit : Vos droits d'accès sont insuffisants.");
            window.location.href = "jeu.html";
        }
    }
}

/**
 * Gère la fermeture sécurisée de la session de jeu
 */
async function handleLogout() {
    try {
        console.log("[AUTH] Fermeture de la session en cours...");
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;

        alert("Session clôturée avec succès. À bientôt sur l'Empire du Sous-Sol !");
        window.location.href = "index.html";

    } catch (err) {
        console.error("[SECURITY ERROR] Échec de la déconnexion :", err.message);
        alert(`Erreur lors de la déconnexion : ${err.message}`);
    }
}
