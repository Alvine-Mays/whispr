// Configuration API
const API_BASE = window.location.hostname === 'localhost' ? 
    'http://localhost:3000/api' : 
    '/api';

// Variables globales
let currentLinkId = null;
let currentUser = null;
let messages = [];
let currentMessageId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Initialiser le dashboard
function initializeDashboard() {
    // Récupérer le linkId depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    currentLinkId = urlParams.get('u');
    
    if (!currentLinkId) {
        // Essayer de récupérer depuis localStorage
        const savedUser = localStorage.getItem('whispr_user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                currentLinkId = user.linkId;
                window.history.replaceState({}, '', `?u=${currentLinkId}`);
            } catch (error) {
                console.error('Erreur parsing utilisateur:', error);
            }
        }
    }
    
    if (!currentLinkId) {
        showError('Lien invalide ou manquant');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Charger les messages
    loadMessages();
    
    // Actualiser automatiquement toutes les 30 secondes
    setInterval(loadMessages, 30000);
}

// Charger les messages
async function loadMessages() {
    try {
        showLoadingState();
        
        const response = await fetch(`${API_BASE}/users/messages/${currentLinkId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors du chargement');
        }
        
        currentUser = { username: data.username, linkId: currentLinkId };
        messages = data.messages || [];
        
        updateUI();
        hideLoadingState();
        
    } catch (error) {
        console.error('Erreur chargement messages:', error);
        showError(error.message || 'Erreur de chargement');
    }
}

// Mettre à jour l'interface utilisateur
function updateUI() {
    updateUserDisplay();
    updateStats();
    updateShareLink();
    updateMessagesList();
    showMainContent();
}

// Mettre à jour l'affichage utilisateur
function updateUserDisplay() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay && currentUser) {
        usernameDisplay.textContent = `@${currentUser.username}`;
    }
}

// Mettre à jour les statistiques
function updateStats() {
    const totalMessages = messages.length;
    const readMessages = messages.filter(m => m.isRead).length;
    const unreadMessages = totalMessages - readMessages;
    
    const totalElement = document.getElementById('totalMessages');
    const readElement = document.getElementById('readMessages');
    const unreadElement = document.getElementById('unreadMessages');
    
    if (totalElement) {
        totalElement.textContent = totalMessages;
        animateCounter(totalElement, totalMessages);
    }
    
    if (readElement) {
        readElement.textContent = readMessages;
        animateCounter(readElement, readMessages);
    }
    
    if (unreadElement) {
        unreadElement.textContent = unreadMessages;
        animateCounter(unreadElement, unreadMessages);
    }
}

// Animation du compteur
function animateCounter(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000; // 1 seconde
    const startTime = Date.now();
    
    function updateCounter() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    updateCounter();
}

// Mettre à jour le lien de partage
function updateShareLink() {
    if (!currentLinkId) return;
    
    const baseUrl = window.location.origin;
    const shareLink = `${baseUrl}/send.html?u=${currentLinkId}`;
    
    const shareLinkElement = document.getElementById('shareLink');
    if (shareLinkElement) {
        shareLinkElement.textContent = shareLink;
    }
}

// Mettre à jour la liste des messages
function updateMessagesList() {
    const messagesList = document.getElementById('messagesList');
    const emptyState = document.getElementById('emptyState');
    
    if (!messagesList || !emptyState) return;
    
    // Vider la liste actuelle
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Ajouter chaque message
    messages.forEach((message, index) => {
        const messageElement = createMessageElement(message, index);
        messagesList.appendChild(messageElement);
    });
}

// Créer un élément de message
function createMessageElement(message, index) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-card bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md ${
        !message.isRead ? 'message-unread' : ''
    }`;
    
    const date = new Date(message.createdAt);
    const timeAgo = getTimeAgo(date);
    const preview = message.content.length > 100 ? 
        message.content.substring(0, 100) + '...' : 
        message.content;
    
    messageDiv.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                    <div class="bg-gradient-to-r from-primary to-purple-600 rounded-full w-8 h-8 flex items-center justify-center">
                        <i class="fas fa-user-secret text-white text-sm"></i>
                    </div>
                    <span class="text-gray-600 text-sm font-medium">Message anonyme</span>
                    ${!message.isRead ? '<div class="bg-primary rounded-full w-2 h-2"></div>' : ''}
                </div>
                <p class="text-gray-800 mb-2">${escapeHtml(preview)}</p>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500 text-sm">
                        <i class="fas fa-clock mr-1"></i>
                        ${timeAgo}
                    </span>
                    <span class="text-primary text-sm font-medium">
                        Cliquer pour lire
                        <i class="fas fa-arrow-right ml-1"></i>
                    </span>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter l'événement de clic
    messageDiv.addEventListener('click', () => openMessageModal(message));
    
    // Animation d'apparition
    setTimeout(() => {
        messageDiv.classList.add('fade-in-up');
    }, index * 100);
    
    return messageDiv;
}

// Ouvrir le modal de message
function openMessageModal(message) {
    currentMessageId = message.id;
    
    const modal = document.getElementById('messageModal');
    const content = document.getElementById('modalMessageContent');
    const dateElement = document.getElementById('modalMessageDate');
    
    if (!modal || !content || !dateElement) return;
    
    // Remplir le contenu
    content.textContent = message.content;
    
    const date = new Date(message.createdAt);
    dateElement.innerHTML = `
        <i class="fas fa-clock mr-1"></i>
        Reçu ${getTimeAgo(date)} • ${formatDate(date)}
    `;
    
    // Afficher le modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Marquer comme lu si non lu
    if (!message.isRead) {
        markAsRead(message.id);
    }
}

// Fermer le modal
function closeMessageModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Marquer un message comme lu
async function markAsRead(messageId) {
    try {
        const response = await fetch(`${API_BASE}/users/messages/${messageId}/read`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            // Mettre à jour localement
            const message = messages.find(m => m.id === messageId);
            if (message) {
                message.isRead = true;
                updateStats();
                updateMessagesList();
            }
        }
    } catch (error) {
        console.error('Erreur marquage lecture:', error);
    }
}

// Partager un message
function shareMessage() {
    if (!currentMessageId) return;
    
    const message = messages.find(m => m.id === currentMessageId);
    if (!message) return;
    
    const text = `"${message.content}" - Message anonyme reçu sur Whispr`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Message Whispr',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Message copié dans le presse-papiers !');
            closeMessageModal();
        });
    }
}

// Copier le lien du dashboard
function copyDashboardLink() {
    if (!currentLinkId) return;
    
    const baseUrl = window.location.origin;
    const shareLink = `${baseUrl}/send.html?u=${currentLinkId}`;
    
    navigator.clipboard.writeText(shareLink).then(() => {
        showToast('Lien copié dans le presse-papiers !');
    }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = shareLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Lien copié !');
    });
}

// États d'affichage
function showLoadingState() {
    document.getElementById('loadingState')?.classList.remove('hidden');
    document.getElementById('errorState')?.classList.add('hidden');
    document.getElementById('statsSection')?.classList.add('hidden');
    document.getElementById('shareLinkSection')?.classList.add('hidden');
    document.getElementById('messagesSection')?.classList.add('hidden');
}

function hideLoadingState() {
    document.getElementById('loadingState')?.classList.add('hidden');
}

function showError(message) {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorState) errorState.classList.remove('hidden');
    if (errorMessage) errorMessage.textContent = message;
    
    hideLoadingState();
}

function showMainContent() {
    document.getElementById('statsSection')?.classList.remove('hidden');
    document.getElementById('shareLinkSection')?.classList.remove('hidden');
    document.getElementById('messagesSection')?.classList.remove('hidden');
}

// Fonctions utilitaires
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) return 'à l\'instant';
    if (diffMinutes < 60) return `il y a ${diffMinutes}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return formatDate(date);
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Gestion des événements clavier pour le modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMessageModal();
    }
});

// Fermer le modal en cliquant sur l'overlay
document.getElementById('messageModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeMessageModal();
    }
});