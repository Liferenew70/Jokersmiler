/* =================================================================== */
/*                          HELPERS.JS COMPLET                         */
/*       FONCTIONS UTILITAIRES POUR L'ENSEMBLE DU SITE FORMATIONPRO    */
/* =================================================================== */


/**
 * Affiche une alerte stylisée non bloquante en haut de l'écran.
 * @param {string} message Le message à afficher.
 * @param {string} type Le type d'alerte ('success', 'danger', 'info').
 * @param {number} duration La durée d'affichage en millisecondes.
 */
function showAlert(message, type = 'success', duration = 4000) {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    // Définition des icônes correspondantes
    const icons = {
        success: 'fa-check-circle',
        danger: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    const iconClass = icons[type] || 'fa-bell';

    alertDiv.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
    container.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.5s forwards';
        alertDiv.addEventListener('animationend', () => alertDiv.remove());
    }, duration - 500);
}

/**
 * Affiche une boîte de dialogue de confirmation (modale) qui retourne une Promise.
 * @param {string} title Le titre de la modale.
 * @param {string} text Le message de confirmation.
 * @param {object} options Options pour customiser les boutons.
 * @returns {Promise<boolean>} Résout à `true` si confirmé, `false` sinon.
 */
function showConfirmation(title, text, options = {}) {
    const config = {
        confirmText: options.confirmText || 'Confirmer',
        cancelText: options.cancelText || 'Annuler',
        confirmClass: options.confirmClass || 'btn-danger',
        cancelClass: options.cancelClass || 'btn-secondary',
    };

    return new Promise(resolve => {
        // Empêche l'ouverture de multiples modales
        if (document.querySelector('.confirmation-overlay')) {
            resolve(false);
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
            <h3>${title}</h3>
            <p>${text}</p>
            <div class="confirmation-actions">
                <button class="btn ${config.cancelClass}" id="confirm-cancel-btn">${config.cancelText}</button>
                <button class="btn ${config.confirmClass}" id="confirm-ok-btn">${config.confirmText}</button>
            </div>`;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const closeDialog = (result) => {
            overlay.style.opacity = '0';
            overlay.addEventListener('transitionend', () => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            });
            resolve(result);
        };

        document.getElementById('confirm-ok-btn').addEventListener('click', () => closeDialog(true));
        document.getElementById('confirm-cancel-btn').addEventListener('click', () => closeDialog(false));
        overlay.addEventListener('click', (e) => { 
            if (e.target === overlay) closeDialog(false); 
        });
    });
}

/**
 * Génère ou récupère un ID client unique et le stocke dans localStorage.
 * @returns {string} L'ID de l'utilisateur.
 */
function getOrGenerateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

/**
 * Formate un nombre en devise (FCFA).
 * @param {number} number Le nombre à formater.
 * @returns {string} Le prix formaté.
 */
function formatPrice(number) {
    if (typeof number !== 'number') {
        number = 0;
    }
    return new Intl.NumberFormat('fr-FR').format(number) + ' FCFA';
}

/**
 * Copie un texte dans le presse-papiers et affiche une alerte.
 * @param {string} text Le texte à copier.
 * @param {string} successMessage Le message à afficher en cas de succès.
 */
async function copyToClipboard(text, successMessage) {
    try {
        await navigator.clipboard.writeText(text);
        showAlert(successMessage, 'success');
    } catch (err) {
        console.error('Erreur de copie:', err);
        showAlert('Erreur lors de la copie.', 'danger');
    }
}