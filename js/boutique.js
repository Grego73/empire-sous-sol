/**
 * L'Empire du Sous-Sol - Logique Transactionnelle de la Boutique
 */

let playerMoney = 0;
let playerUid = null;

document.addEventListener("DOMContentLoaded", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        playerUid = user.id;
        // Charger la trésorerie du joueur au lancement
        const { data } = await supabase.from('profiles').select('money').eq('id', playerUid).single();
        playerMoney = data.money;
        document.getElementById("playerMoneyBoutique").innerText = `${playerMoney.toLocaleString()} $`;
    }
});

/**
 * Traite l'achat ou la location d'un actif foncier
 */
async function acheterAsset(category, name, resourceType, status, efficiency, cost, resources, hoursDuration = 0) {
    if (playerMoney < cost) {
        alert("🚨 TRANSACTION REFUSÉE : Fonds d'investissement insuffisants.");
        return;
    }

    if (!playerUid) return;

    // Calcul de la date de fin si c'est une location
    let rentEndTime = null;
    if (status === 'rented' && hoursDuration > 0) {
        let date = new Date();
        date.setHours(date.getHours() + hoursDuration);
        rentEndTime = date.toISOString();
    }

    try {
        // 1. Débiter l'argent du compte du joueur
        playerMoney -= cost;
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ money: playerMoney })
            .eq('id', playerUid);

        if (profileError) throw profileError;

        // 2. Ajouter la nouvelle mine dans la table 'player_mines'
        const { error: mineError } = await supabase
            .from('player_mines')
            .insert([{
                user_id: playerUid,
                mine_name: name,
                resource_type: resourceType,
                status: status,
                efficiency: efficiency,
                resource_left: resources,
                rent_end_time: rentEndTime
            }]);

        if (mineError) throw mineError;

        // 3. Rafraîchir l'affichage
        document.getElementById("playerMoneyBoutique").innerText = `${playerMoney.toLocaleString()} $`;
        alert(`✅ CONTRAT SCELLÉ : ${name} ajouté à vos actifs industriels !`);

    } catch (err) {
        console.error("[TRANSACTION ERROR] Échec de l'achat :", err.message);
        alert("Une erreur serveur est survenue durant la transaction foncière.");
    }
}
