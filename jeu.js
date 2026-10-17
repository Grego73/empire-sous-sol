/**
 * L'Empire du Sous-Sol - Logique Centrale du Tableau de Bord de Gestion
 */

// L'instance 'supabase' est déjà initialisée globalement grâce à security.js
let currentPlayerData = null;
let playerMinesList = [];

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[SYSTEM] Console de gestion en cours de synchronisation...");
    
    // 1. Récupérer les données de la session de l'exploitant
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // 2. Charger le profil financier et les concessions du joueur
        await loadPlayerProfile(user.id);
        await loadPlayerMines(user.id);
        
        // 3. Lancer la boucle de simulation en direct (Toutes les secondes)
        startEconomicLoop();
    }
});

/**
 * Récupère l'argent et le pseudo du joueur dans la table 'profiles'
 */
async function loadPlayerProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("[DB ERROR] Impossible de charger le profil :", error.message);
        return;
    }

    currentPlayerData = data;
    
    // Mise à jour de l'interface
    document.getElementById("playerUsername").innerText = currentPlayerData.username;
    document.getElementById("playerMoney").innerText = `${currentPlayerData.money.toLocaleString()} $`;
}

/**
 * Récupère la liste des concessions minières de l'exploitant
 */
async function loadPlayerMines(userId) {
    const { data, error } = await supabase
        .from('player_mines')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error("[DB ERROR] Impossible de charger les mines :", error.message);
        return;
    }

    playerMinesList = data;
    renderMinesTable();
    recalculateGlobalIncome();
}

/**
 * Calcule et affiche le rendement total par seconde généré par les filons
 */
function recalculateGlobalIncome() {
    let totalIncomePerSecond = 0;

    playerMinesList.forEach(mine => {
        // Simulation de calcul de rendement de base (Modifiable selon l'équilibrage de votre boutique)
        let baseYield = mine.resource_type === 'gravier' ? 2 : mine.resource_type === 'charbon' ? 8 : 25;
        
        // Prise en compte du niveau de l'infrastructure et de l'usure (efficacité)
        let mineYield = baseYield * mine.current_level * mine.efficiency;
        
        totalIncomePerSecond += mineYield;
    });

    // Affichage sur l'interface
    document.getElementById("playerIncome").innerText = `+${totalIncomePerSecond.toFixed(1)} $/s`;
    return totalIncomePerSecond;
}

/**
 * Génère dynamiquement les lignes du tableau HTML des mines
 */
function renderMinesTable() {
    const tbody = document.querySelector("#minesTable tbody");
    tbody.innerHTML = ""; // Vide le message de chargement

    if (playerMinesList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-muted);">Aucune concession active. Visitez la boutique pour acquérir votre premier filon.</td></tr>`;
        return;
    }

    playerMinesList.forEach(mine => {
        const tr = document.createElement("tr");
        
        // Badge de statut stylisé selon le type de contrat (Achat, occasion, location)
        let statusBadge = `<span style="color: var(--success-color)">Acheté</span>`;
        if (mine.status === 'rented') statusBadge = `<span style="color: var(--accent-color)">Bail Locatif</span>`;
        if (mine.status === 'used') statusBadge = `<span style="color: #f1c40f">Occasion</span>`;

        tr.innerHTML = `
            <td style="padding: 12px 10px; font-weight: 600;">${getMineEmoji(mine.resource_type)} ${mine.mine_name}</td>
            <td>Niv. ${mine.current_level}</td>
            <td>${mine.resource_left.toLocaleString()} unités</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

function getMineEmoji(type) {
    if (type === 'gravier') return '🪨';
    if (type === 'charbon') return '🪵';
    if (type === 'fer') return '⛓️';
    return '🥇';
}

/**
 * Boucle économique qui distribue l'argent en temps réel chaque seconde
 */
function startEconomicLoop() {
    setInterval(async () => {
        if (!currentPlayerData) return;

        const income = recalculateGlobalIncome();
        
        if (income > 0) {
            // 1. Ajouter l'argent localement pour une réactivité fluide à l'écran
            currentPlayerData.money += income;
            document.getElementById("playerMoney").innerText = `${Math.floor(currentPlayerData.money).toLocaleString()} $`;
            
            // 2. Sauvegarde périodique en BDD (Optionnel : Pour ne pas surcharger Supabase, 
            // vous pourrez par la suite mettre un compteur pour n'envoyer le 'UPDATE' que toutes les 10 secondes)
            await supabase
                .from('profiles')
                .update({ money: Math.floor(currentPlayerData.money), last_login: new Date().toISOString() })
                .eq('id', currentPlayerData.id);
        }
    }, 1000);
}
