/* =================================================================== */
/*           APP.JS - VERSION FINALE, COMPLÈTE ET OPÉRATIONNELLE        */
/*         (AVEC PRIX TOTAL PAR ARTICLE DANS LE PANNEAU ADMIN)         */
/* =================================================================== */


// ========================================
//          1. DONNÉES GLOBALES
// ========================================

const PRODUCTS = {
    capcut: {
        id: 'capcut',
        title: "Formation CapCut Pro mobile",
        price: 18000,
        prixPromo: 7500,
        fees: 1000,
        image: "../img/capcut.jpeg",
        description: "Maîtrisez le montage vidéo professionnel sur mobile.",
        fullDescription: `<h3>Description complète :</h3><p>Cette formation intensive vous transformera en expert du montage vidéo sur mobile avec CapCut.</p><h3>Contenu de la formation :</h3><ul><li>Interface et fonctionnalités avancées</li><li>Techniques de montage professionnel</li><li>Montage vidéo avec IA</li><li>Effets spéciaux et transitions</li><li>Optimisation pour les réseaux sociaux</li></ul>`,
        duration: "6h de formation",
        instructor: "Jadsmith, Monteur pro",
        level: "Débutant à Intermédiaire",
        categories: ["infographie", "android", "iphone"],
        isFeatured: true,
        cloudGoogledrive: "https://www.siteclouddrive.com/capcut",
        cloudTerabox: "https://www.cloudterabox.com/capcut"
    },
    iaprompt: {
        id: 'iaprompt',
        title: "Maîtrise des Prompts IA",
        price: 12000,
        prixPromo: 4000,
        fees: 0,
        image: "../img/iaprompt.jpg",
        description: "Communiquez efficacement avec les intelligences artificielles.",
        fullDescription: `<h3>Description complète :</h3><p>Formation complète pour maîtriser l'art du prompt engineering avec les IA modernes.</p><h3>Vous apprendrez :</h3><ul><li>Les principes fondamentaux des prompts</li><li>Techniques avancées pour des résultats précis</li><li>Création de site avec IA</li><li>Création de logo avec IA</li></ul>`,
        duration: "8h de formation",
        instructor: "Marie Martin, Experte IA",
        level: "Tous niveaux",
        categories: ["hacking", "pc", "devWeb"],
        isFeatured: true,
        cloudGoogledrive: "https://www.siteclouddrive.com/iaprompt",
        cloudTerabox: "https://www.cloudterabox.com/iaprompt"
    }
};

const PROMO_CODES = {
    "FIRST_PROMO": { type: "percent", value: 25, conditions: { firstPurchaseOnly: true } },
    "MONDAY_PROMO": { type: "percent", value: 10, conditions: { onlyOnDay: "monday" } },
    "MONTH_PROMO": { type: "percent", value: 15, conditions: { onlyOnDay: "firstOfMonth" } },
    "THREE_ITEMS_PROMO": { type: "fixed", value: 500, conditions: { minItems: 3 } }
};

const WHATSAPP_NUMBER = "+2250595762779";
const PRODUCTS_PER_PAGE = 12;
const ADMIN_PASSWORD = "admin";


// ========================================
//          2. INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initGlobalScripts();

    if (document.getElementById('product-grid')) {
        initIndexPage();
    }
    if (document.body.id === 'admin-page') {
        initAdminPage();
    }
});


// ========================================
//     3. SCRIPTS GLOBAUX (Toutes les pages)
// ========================================

function initGlobalScripts() {
    // Thème
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
        themeSwitcher.addEventListener('click', toggleTheme);
    }

    // Flèche de remontée
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
        });
        scrollToTopBtn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // ID Client & Parrainage
    const userId = getOrGenerateUserId();
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const referralLink = `${window.location.origin}${basePath}/index.html?ref=${userId}`;
    
    const userIdDisplay = document.getElementById('user-id-display');
    if (userIdDisplay) userIdDisplay.textContent = `${userId.substring(0, 8)}...`;
    
    const copyUserIdBtn = document.getElementById('copy-user-id-btn');
    if (copyUserIdBtn) copyUserIdBtn.addEventListener('click', () => copyToClipboard(userId, 'ID Client copié !'));

    const referralLinkInput = document.getElementById('referral-link-input');
    if (referralLinkInput) referralLinkInput.value = referralLink;
    
    const copyReferralBtn = document.getElementById('copy-referral-link-btn');
    if (copyReferralBtn) copyReferralBtn.addEventListener('click', () => copyToClipboard(referralLink, 'Lien de parrainage copié !'));

    // Export/Import de données
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    
    const importBtn = document.getElementById('import-file');
    if (importBtn) importBtn.addEventListener('change', importData);

    // Icônes Panier & Notifications
    updateCartIcon(); 
    updateNotificationBadge();
}

function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher && themeSwitcher.querySelector('i')) {
        const iconClass = { dark: 'fa-moon', light: 'fa-sun', hacker: 'fa-terminal' }[themeName] || 'fa-moon';
        themeSwitcher.querySelector('i').className = `fas ${iconClass}`;
    }
}

function toggleTheme() {
    const themes = ['dark', 'light', 'hacker'];
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const currentIndex = themes.indexOf(currentTheme);
    const newTheme = themes[(currentIndex + 1) % themes.length];
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}


// ========================================
//   4. LOGIQUE PAGE D'ACCUEIL (Version stable et complète)
// ========================================

function initIndexPage() {
    const state = { allProducts: Object.values(PRODUCTS).filter(p => p.isFeatured), filteredProducts: [], currentPage: 1, filters: { search: '', minPrice: '', maxPrice: '', categories: new Set() } };
    const productGrid = document.getElementById('product-grid');
    const paginationControls = document.getElementById('pagination-controls');
    const searchInput = document.getElementById('search-input');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const categoryFiltersContainer = document.getElementById('category-filters');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    function renderProductCards(products) {
        productGrid.innerHTML = '';
        if (products.length === 0) { productGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères.</p>'; return; }
        products.forEach(product => {
            const discount = Math.round(((product.price - product.prixPromo) / product.price) * 100);
            productGrid.innerHTML += `
                <div class="product-card" data-id="${product.id}">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.title}" class="product-image">
                        <span class="discount-badge">-${discount}%</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-description-mince">${product.description}</p>
                        <div class="product-pricing">
                            <span class="price-original">${formatPrice(product.price)}</span>
                            <span class="price-promo">${formatPrice(product.prixPromo)}</span>
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-secondary btn-details">Détails</button>
                            <button class="btn btn-primary btn-add-cart">Ajouter</button>
                        </div>
                        <button class="btn btn-whatsapp btn-whatsapp-pay"><i class="fab fa-whatsapp"></i> Payer via WhatsApp</button>
                    </div>
                </div>`;
        });
    }

    function renderPagination() {
        if(!paginationControls) return;
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(state.filteredProducts.length / PRODUCTS_PER_PAGE);
        if (totalPages <= 1) return;
        paginationControls.innerHTML = `<button class="btn btn-secondary" ${state.currentPage === 1 ? 'disabled' : ''} data-page="prev">Précédent</button><span class="page-info">Page ${state.currentPage} sur ${totalPages}</span><button class="btn btn-secondary" ${state.currentPage === totalPages ? 'disabled' : ''} data-page="next">Suivant</button>`;
    }

    function renderCategoryFilters() {
        if(!categoryFiltersContainer) return;
        const allCategories = new Set(state.allProducts.flatMap(p => p.categories));
        categoryFiltersContainer.innerHTML = '';
        allCategories.forEach(category => {
            const displayName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            categoryFiltersContainer.innerHTML += `<button class="category-btn" data-category="${category}">${displayName}</button>`;
        });
    }

    function applyFiltersAndRender() {
        let products = [...state.allProducts];
        const { search, minPrice, maxPrice, categories } = state.filters;
        if (search) { const s = search.toLowerCase(); products = products.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)); }
        if (minPrice) products = products.filter(p => p.prixPromo >= parseFloat(minPrice));
        if (maxPrice) products = products.filter(p => p.prixPromo <= parseFloat(maxPrice));
        if (categories.size > 0) products = products.filter(p => p.categories.some(cat => categories.has(cat)));
        state.filteredProducts = products;
        const paginatedProducts = state.filteredProducts.slice((state.currentPage - 1) * PRODUCTS_PER_PAGE, state.currentPage * PRODUCTS_PER_PAGE);
        renderProductCards(paginatedProducts);
        renderPagination();
        saveStateToSession();
    }

    function saveStateToSession() { const stateToSave = { currentPage: state.currentPage, filters: { search: state.filters.search, minPrice: state.filters.minPrice, maxPrice: state.filters.maxPrice, categories: Array.from(state.filters.categories) } }; sessionStorage.setItem('shopState', JSON.stringify(stateToSave)); }
    function loadStateFromSession() { const savedState = sessionStorage.getItem('shopState'); if (savedState) { const parsedState = JSON.parse(savedState); state.currentPage = parsedState.currentPage || 1; if (parsedState.filters) { state.filters = { ...state.filters, ...parsedState.filters, categories: new Set(parsedState.filters.categories || []) }; } if(searchInput) searchInput.value = state.filters.search; if(minPriceInput) minPriceInput.value = state.filters.minPrice; if(maxPriceInput) maxPriceInput.value = state.filters.maxPrice; } }

    loadStateFromSession();
    renderCategoryFilters();
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.toggle('active', state.filters.categories.has(btn.dataset.category)));
    applyFiltersAndRender();

    if(searchInput) searchInput.addEventListener('input', () => { state.filters.search = searchInput.value; state.currentPage = 1; applyFiltersAndRender(); });
    if(minPriceInput) minPriceInput.addEventListener('input', () => { state.filters.minPrice = minPriceInput.value; state.currentPage = 1; applyFiltersAndRender(); });
    if(maxPriceInput) maxPriceInput.addEventListener('input', () => { state.filters.maxPrice = maxPriceInput.value; state.currentPage = 1; applyFiltersAndRender(); });
    if(resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => { state.filters = { search: '', minPrice: '', maxPrice: '', categories: new Set() }; state.currentPage = 1; if(searchInput) searchInput.value = ''; if(minPriceInput) minPriceInput.value = ''; if(maxPriceInput) maxPriceInput.value = ''; document.querySelectorAll('.category-btn.active').forEach(btn => btn.classList.remove('active')); applyFiltersAndRender(); });
    if(categoryFiltersContainer) categoryFiltersContainer.addEventListener('click', (e) => { if (e.target.matches('.category-btn')) { const category = e.target.dataset.category; e.target.classList.toggle('active'); if (state.filters.categories.has(category)) state.filters.categories.delete(category); else state.filters.categories.add(category); state.currentPage = 1; applyFiltersAndRender(); } });
    
    productGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        const productId = card.dataset.id;
        if (e.target.matches('.btn-details')) window.location.href = `produit.html?id=${productId}`;
        if (e.target.matches('.btn-add-cart')) addToCart(productId);
        if (e.target.closest('.btn-whatsapp-pay')) {
            const product = PRODUCTS[productId];
            const message = `Bonjour, je suis intéressé par la formation "${product.title}" au prix de ${formatPrice(product.prixPromo)}.`;
            showConfirmation('Redirection vers WhatsApp', message, { confirmText: 'Continuer', confirmClass: 'btn-success' }).then(confirmed => { if (confirmed) window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank'); });
        }
    });

    if(paginationControls) paginationControls.addEventListener('click', (e) => { const pageAction = e.target.dataset.page; if (pageAction === 'prev') state.currentPage--; if (pageAction === 'next') state.currentPage++; applyFiltersAndRender(); window.scrollTo({top: productGrid.offsetTop - 100, behavior: 'smooth'}); });
}


// ========================================
//        5. GESTION DU PANIER
// ========================================

function getCart() { return JSON.parse(localStorage.getItem('userCart')) || []; }
function saveCart(cart) { localStorage.setItem('userCart', JSON.stringify(cart)); }
function addToCart(productId) { const cart = getCart(); const p = cart.find(item => item.id === productId); if(p) p.quantity++; else cart.push({ id: productId, quantity: 1, selected: true }); saveCart(cart); showAlert(`${PRODUCTS[productId].title} a été ajouté au panier !`, 'success'); updateCartIcon(); }
function updateQuantity(productId, newQuantity) { let cart = getCart(); const product = cart.find(item => item.id === productId); if(product){ if(newQuantity > 0) product.quantity = newQuantity; else cart = cart.filter(i => i.id !== productId); saveCart(cart); updateCartIcon(); } }
function removeFromCart(productId) { let cart = getCart(); cart = cart.filter(item => item.id !== productId); saveCart(cart); showAlert('Produit retiré du panier.', 'info'); updateCartIcon(); }
function emptyCart() { saveCart([]); localStorage.removeItem('appliedPromoCode'); updateCartIcon(); }
function toggleItemSelected(productId, isSelected) { const cart = getCart(); const product = cart.find(item => item.id === productId); if (product) { product.selected = isSelected; saveCart(cart); } }
function updateCartIcon() { const totalItems = getCart().reduce((sum, item) => sum + item.quantity, 0); const cartCount = document.getElementById('cart-item-count'); if (cartCount) { cartCount.textContent = totalItems; cartCount.style.display = totalItems > 0 ? 'flex' : 'none'; } }
function getCartDetails() { const cart = getCart(); const appliedPromoCode = localStorage.getItem('appliedPromoCode'); let subtotal = 0, totalFees = 0, selectedItemCount = 0; const selectedItems = cart.filter(item => item.selected); selectedItemCount = selectedItems.length; for (const item of selectedItems) { const productInfo = PRODUCTS[item.id]; if (productInfo) { subtotal += productInfo.prixPromo * item.quantity; totalFees += (productInfo.fees || 0); } } let discount = 0, promoMessage = null; if (appliedPromoCode && PROMO_CODES[appliedPromoCode]) { const promo = PROMO_CODES[appliedPromoCode]; let isValid = true; if(promo.conditions.minItems && selectedItems.length < promo.conditions.minItems) isValid = false; if(isValid){ if (promo.type === 'percent') { discount = (subtotal * promo.value) / 100; promoMessage = `Réduction (${promo.value}%)`; } else if (promo.type === 'fixed') { discount = promo.value; promoMessage = `Réduction`; } } else { localStorage.removeItem('appliedPromoCode'); } } const grandTotal = subtotal + totalFees - discount; return { items: cart.map(item => ({ ...PRODUCTS[item.id], ...item })), subtotal, totalFees, discount, promoMessage, grandTotal: grandTotal < 0 ? 0 : grandTotal, selectedItemCount }; }


// ========================================
//     6. LOGIQUE PAGE D'ADMINISTRATION
// ========================================

function initAdminPage() {
    const loginContainer = document.getElementById('admin-login-container');
    const dashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');

    if (sessionStorage.getItem('isAdminAuthenticated') === 'true') { showDashboard(); }

    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (loginForm.password.value === ADMIN_PASSWORD) {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                showDashboard();
            } else {
                showAlert('Mot de passe incorrect.', 'danger');
            }
        });
    }

    function showDashboard() {
        if(loginContainer) loginContainer.style.display = 'none';
        if(dashboard) dashboard.style.display = 'block';
        loadAdminDashboard();
    }
}

function loadAdminDashboard() {
    const tabs = document.querySelectorAll('.admin-tab-button');
    const contents = document.querySelectorAll('.admin-tab-content');
    const pendingContainer = document.getElementById('pending-orders-container');
    const historyContainer = document.getElementById('history-list-container');
    const searchInput = document.getElementById('history-search');

    const getDb = () => JSON.parse(localStorage.getItem('adminDatabase')) || { pending: [], history: [] };
    const saveDb = (db) => localStorage.setItem('adminDatabase', JSON.stringify(db));

    function orderToHtml(order) {
        const orderDate = new Date(order.date).toLocaleString('fr-FR');
        
        // --- CORRECTION --- //
        // On calcule le prix total pour chaque produit et on l'affiche.
        const productsHTML = order.products.map(p => 
            `<li>${p.name} (x${p.quantity}) - <strong>${formatPrice(p.price * p.quantity)}</strong></li>`
        ).join('');
        // --- FIN DE LA CORRECTION --- //

        const deliveryHTML = Object.entries(order.deliveryInfo).filter(([, val]) => val).map(([key, val]) => `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${val}</li>`).join('');
        const isPending = order.status === 'pending';
        
        return `
            <div class="order-accordion ${order.status || 'pending'}" data-id="${order.id}">
                <div class="order-header">
                    <div class="order-client-info">
                        <strong>Client:</strong> ${order.clientName} (<span>${order.idClient.substring(0, 8)}...</span>)
                        <br><small>${orderDate}</small>
                    </div>
                    <div class="order-total">${formatPrice(order.totalPrice)}</div>
                </div>
                <div class="order-details">
                    <h4>Informations de contact</h4><ul>${deliveryHTML}</ul>
                    <h4>Détail des produits</h4><ul class="order-product-list">${productsHTML}</ul>
                    ${isPending ? `
                    <div class="order-actions">
                        <button class="btn btn-success" data-action="validated"><i class="fas fa-check"></i> Valider</button>
                        <button class="btn btn-danger" data-action="refused"><i class="fas fa-times"></i> Refuser</button>
                    </div>` : `<p><strong>Statut : </strong> ${order.status === 'validated' ? 'Validé le ' + new Date(order.processedDate).toLocaleDateString('fr-FR') : 'Refusé le ' + new Date(order.processedDate).toLocaleDateString('fr-FR')}</p>`}
                </div>
            </div>`;
    }

    function renderPendingOrders() {
        const db = getDb();
        if(pendingContainer) pendingContainer.innerHTML = db.pending.length === 0 ? '<p class="no-pending-orders">Aucune commande en attente.</p>' : db.pending.map(orderToHtml).join('');
        const pendingBadge = document.getElementById('pending-count-badge');
        if(pendingBadge) pendingBadge.textContent = db.pending.length;
    }

    function renderHistory(filter = '') {
        const db = getDb();
        const keyword = filter.toLowerCase();
        const filteredHistory = db.history.filter(order => JSON.stringify(order).toLowerCase().includes(keyword)).sort((a,b) => new Date(b.processedDate) - new Date(a.processedDate));
        if(historyContainer) historyContainer.innerHTML = filteredHistory.length === 0 ? '<p class="no-pending-orders">Aucun historique trouvé.</p>' : filteredHistory.map(orderToHtml).join('');
    }

    function renderStats() {
        const db = getDb();
        const validatedOrders = db.history.filter(o => o.status === 'validated');
        if(document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = db.pending.length;
        if(document.getElementById('stat-validated')) document.getElementById('stat-validated').textContent = validatedOrders.length;
        if(document.getElementById('stat-refused')) document.getElementById('stat-refused').textContent = db.history.filter(o => o.status === 'refused').length;
        const totalRevenue = validatedOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        if(document.getElementById('stat-revenue')) document.getElementById('stat-revenue').textContent = formatPrice(totalRevenue);
    }

    function processOrder(orderId, newStatus) {
        let db = getDb();
        const orderIndex = db.pending.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = db.pending.splice(orderIndex, 1)[0];
        order.status = newStatus;
        order.processedDate = new Date().toISOString();
        db.history.unshift(order);
        saveDb(db);
        
        const notifType = newStatus === 'validated' ? 'success' : 'danger';
        const notifMessage = newStatus === 'validated' ? 'Votre paiement a été validé ! Vos formations sont disponibles.' : 'Votre paiement a été refusé. Veuillez contacter le support.';
        createNotification(order.idClient, notifType, notifMessage);

        if (newStatus === 'validated') {
            addProductsToLibrary(order.idClient, order.products);
        }

        showAlert(`Commande marquée comme "${newStatus}".`, 'success');
        refreshAll();
    }

    function refreshAll() {
        renderPendingOrders();
        renderHistory(searchInput ? searchInput.value : '');
        renderStats();
    }

    tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const targetContent = document.getElementById(tab.dataset.target);
        if(targetContent) targetContent.classList.add('active');
    }));

    document.getElementById('admin-dashboard').addEventListener('click', (e) => {
        const header = e.target.closest('.order-header');
        if(header) {
            header.classList.toggle('open');
            const details = header.nextElementSibling;
            if(details) details.style.display = details.style.display === 'block' ? 'none' : 'block';
        }

        const actionBtn = e.target.closest('.order-actions button');
        if (actionBtn) {
            const orderId = actionBtn.closest('.order-accordion').dataset.id;
            const action = actionBtn.dataset.action;
            processOrder(orderId, action);
        }
    });

    if(searchInput) searchInput.addEventListener('input', () => renderHistory(searchInput.value));

    const exportAdminBtn = document.getElementById('export-admin-data-btn');
    if(exportAdminBtn) exportAdminBtn.addEventListener('click', () => { const db = getDb(); const dataStr = JSON.stringify(db, null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `admin_data_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); showAlert('Données admin exportées.', 'success'); });
    
    const importAdminFile = document.getElementById('import-admin-data-file');
    if(importAdminFile) importAdminFile.addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; const confirmed = await showConfirmation('Importer et ÉCRASER les données admin ?', 'Cette action est irréversible.', { confirmClass: 'btn-danger' }); if(confirmed) { const reader = new FileReader(); reader.onload = e => { try { const importedDb = JSON.parse(e.target.result); if (importedDb.pending && importedDb.history) { saveDb(importedDb); refreshAll(); showAlert('Données importées !', 'success'); } else { showAlert('Fichier invalide.', 'danger'); } } catch { showAlert('Erreur de lecture.', 'danger'); } }; reader.readAsText(file); } event.target.value = ''; });

    refreshAll();
}


// ========================================
//      7. BIBLIOTHÈQUE, NOTIFS & DONNÉES UTILISATEUR
// ========================================

function addProductsToLibrary(userId, products) {
    let allLibraries = JSON.parse(localStorage.getItem('userValidatedLibrary')) || {};
    if (!allLibraries[userId]) allLibraries[userId] = [];
    products.forEach(productToAdd => { if (!allLibraries[userId].some(p => p.id === productToAdd.id)) { allLibraries[userId].push(productToAdd); } });
    localStorage.setItem('userValidatedLibrary', JSON.stringify(allLibraries));
}

function createNotification(targetUserId, type, message) {
    let allNotifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
    if (!allNotifications[targetUserId]) allNotifications[targetUserId] = [];
    const newNotification = { id: crypto.randomUUID(), type, message, date: new Date().toISOString(), read: false };
    allNotifications[targetUserId].unshift(newNotification);
    localStorage.setItem('userNotifications', JSON.stringify(allNotifications));
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const userId = getOrGenerateUserId();
    if(!userId) return;
    const allNotifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
    const userNotifications = allNotifications[userId] || [];
    const unreadCount = userNotifications.filter(n => !n.read).length;
    const notifCountBadge = document.getElementById('notif-count');
    if (notifCountBadge) { notifCountBadge.textContent = unreadCount; notifCountBadge.style.display = unreadCount > 0 ? 'flex' : 'none'; }
}

function exportData() {
    const userId = getOrGenerateUserId();
    const allUserLibraries = JSON.parse(localStorage.getItem('userValidatedLibrary')) || {};
    const allNotifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
    const allReferralData = JSON.parse(localStorage.getItem('referralData')) || {};
    const dataToExport = {
        userId,
        preferences: { theme: localStorage.getItem('theme') || 'dark' },
        cart: getCart(),
        library: allUserLibraries[userId] || [],
        notifications: allNotifications[userId] || [],
        referralData: allReferralData[userId] || {}
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data_${userId.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Données utilisateur exportées.', 'success');
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const confirmed = await showConfirmation('Importer vos données ?', 'Ceci remplacera vos données actuelles. Utilisez cette fonction pour restaurer une sauvegarde.', { confirmClass: 'btn-danger' });
    if(!confirmed) { event.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.userId) throw new Error('ID utilisateur manquant');
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('theme', data.preferences?.theme || 'dark');
            saveCart(data.cart || []);
            const update = (key, userKey, importedData) => {
                let store = JSON.parse(localStorage.getItem(key)) || {};
                store[userKey] = importedData;
                localStorage.setItem(key, JSON.stringify(store));
            };
            update('userValidatedLibrary', data.userId, data.library || []);
            update('userNotifications', data.userId, data.notifications || []);
            update('referralData', data.userId, data.referralData || {});
            showAlert('Données importées ! Rechargement...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            showAlert(`Erreur: ${error.message}`, 'danger');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function handleReferralOnPurchase(purchasedProducts, totalAmount) {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerId = urlParams.get('ref');
    if (!referrerId || referrerId === getOrGenerateUserId()) return;
    if (purchasedProducts.length >= 3) {
        const bonusAmount = totalAmount * 0.03;
        let referralData = JSON.parse(localStorage.getItem('referralData')) || {};
        if (!referralData[referrerId]) {
            referralData[referrerId] = { referrals: 0, totalBonus: 0, transactions: [] };
        }
        const referrer = referralData[referrerId];
        referrer.referrals += 1;
        referrer.totalBonus += bonusAmount;
        referrer.transactions.push({ date: new Date().toISOString(), bonus: bonusAmount, fromUserId: getOrGenerateUserId() });
        localStorage.setItem('referralData', JSON.stringify(referralData));
        createNotification(referrerId, 'success', `Vous avez reçu un bonus de ${formatPrice(bonusAmount)} grâce à un de vos filleuls !`);
    }
}


// ========================================
//      8. FONCTIONS UTILITAIRES GLOBALES
// ========================================

function getOrGenerateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

function formatPrice(number) {
    return new Intl.NumberFormat('fr-FR').format(number || 0) + ' FCFA';
}

async function copyToClipboard(text, successMessage) {
    try {
        await navigator.clipboard.writeText(text);
        showAlert(successMessage, 'success');
    } catch (err) {
        showAlert('Erreur lors de la copie.', 'danger');
    }
}