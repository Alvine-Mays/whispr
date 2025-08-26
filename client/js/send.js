// Configuration API
const API_BASE = window.location.hostname === 'localhost' ? 
    'http://localhost:3000/api' : 
    'https://whispr-backend.herokuapp.com/api';

// Variables globales
let targetLinkId = null;
let targetUser = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeSendPage();
});

// Initialiser la page d'envoi
function initializeSendPage() {
    // Récupérer le linkId depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    targetLinkId = urlParams.get('u');
    
    if (!targetLinkId) {
        showError('Lien invalide ou manquant');
        return;
    }
    
    // Vérifier que l'utilisateur existe
    checkUser();
    
    // Configuration des écouteurs d'événements
    setupEventListeners();
}

// Vérifier que l'utilisateur existe
async function checkUser() {
    try {
        showLoadingState();
        
        const response = await fetch(`${API_BASE}/users/check/${targetLinkId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Utilisateur non trouvé');
        }
        
        targetUser = { username: data.username, linkId: targetLinkId };
        showSendForm();
        
    } catch (error) {
        console.error('Erreur vérification utilisateur:', error);
        showError(error.message || 'Erreur lors de la vérification');
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const messageForm = document.getElementById('messageForm');
    const messageContent = document.getElementById('messageContent');
    
    if (messageForm) {
        messageForm.addEventListener('submit', handleSendMessage);
    }
    
    if (messageContent) {
        messageContent.addEventListener('input', handleMessageInput);
        messageContent.addEventListener('paste', handleMessagePaste);
    }
}

// Gestion de l'input du message
function handleMessageInput(e) {
    const value = e.target.value;
    const charCount = document.getElementById('charCount');
    
    // Mettre à jour le compteur
    if (charCount) {
        const count = value.length;
        charCount.textContent = `${count}/500 caractères`;
        
        // Changer la couleur selon la limite
        if (count > 450) {
            charCount.className = 'text-xs text-red-500';
        } else if (count > 400) {
            charCount.className = 'text-xs text-orange-500';
        } else {
            charCount.className = 'text-xs text-gray-500';
        }
    }
    
    // Validation en temps réel
    validateMessage(value);
}

// Gestion du collage
function handleMessagePaste(e) {
    setTimeout(() => {
        handleMessageInput(e);
    }, 10);
}

// Envoyer le message
async function handleSendMessage(e) {
    e.preventDefault();
    
    const messageContent = document.getElementById('messageContent').value.trim();
    const button = document.getElementById('sendButton');
    const buttonText = button.querySelector('.button-text');
    const buttonLoading = button.querySelector('.button-loading');
    
    // Validation
    if (!validateMessage(messageContent)) {
        return;
    }
    
    // État de chargement
    button.disabled = true;
    buttonText.classList.add('hidden');
    buttonLoading.classList.remove('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/messages/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                linkId: targetLinkId,
                content: messageContent
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de l\'envoi');
        }
        
        // Succès
        showSuccessState();
        triggerConfetti();
        
        // Vibration sur mobile (si supportée)
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        
    } catch (error) {
        console.error('Erreur envoi message:', error);
        showFormError(error.message || 'Une erreur est survenue');
    } finally {
        // Réinitialiser le bouton
        button.disabled = false;
        buttonText.classList.remove('hidden');
        buttonLoading.classList.add('hidden');
    }
}

// Validation du message
function validateMessage(content) {
    const errorDiv = document.getElementById('formErrorMessage');
    
    if (!content || content.length === 0) {
        showFormError('Le message ne peut pas être vide');
        return false;
    }
    
    if (content.length > 500) {
        showFormError('Le message ne peut pas dépasser 500 caractères');
        return false;
    }
    
    // Masquer l'erreur si tout est correct
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
    
    return true;
}

// Afficher une erreur dans le formulaire
function showFormError(message) {
    const errorDiv = document.getElementById('formErrorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // Scroll vers l'erreur
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Envoyer un autre message
function sendAnother() {
    // Réinitialiser le formulaire
    const form = document.getElementById('messageForm');
    if (form) {
        form.reset();
    }
    
    // Réinitialiser le compteur
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = '0/500 caractères';
        charCount.className = 'text-xs text-gray-500';
    }
    
    // Masquer l'erreur
    const errorDiv = document.getElementById('formErrorMessage');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
    
    // Retourner au formulaire
    showSendForm();
    
    // Focus sur la textarea
    setTimeout(() => {
        const textarea = document.getElementById('messageContent');
        if (textarea) {
            textarea.focus();
        }
    }, 100);
}

// États d'affichage
function showLoadingState() {
    document.getElementById('loadingState')?.classList.remove('hidden');
    document.getElementById('errorState')?.classList.add('hidden');
    document.getElementById('sendForm')?.classList.add('hidden');
    document.getElementById('successState')?.classList.add('hidden');
}

function showError(message) {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorState) errorState.classList.remove('hidden');
    if (errorMessage) errorMessage.textContent = message;
    
    document.getElementById('loadingState')?.classList.add('hidden');
    document.getElementById('sendForm')?.classList.add('hidden');
    document.getElementById('successState')?.classList.add('hidden');
}

function showSendForm() {
    document.getElementById('sendForm')?.classList.remove('hidden');
    document.getElementById('sendForm')?.classList.add('fade-in-up');
    
    document.getElementById('loadingState')?.classList.add('hidden');
    document.getElementById('errorState')?.classList.add('hidden');
    document.getElementById('successState')?.classList.add('hidden');
    
    // Mettre à jour le nom du destinataire
    const recipientName = document.getElementById('recipientName');
    if (recipientName && targetUser) {
        recipientName.textContent = `@${targetUser.username}`;
    }
    
    // Focus sur la textarea
    setTimeout(() => {
        const textarea = document.getElementById('messageContent');
        if (textarea) {
            textarea.focus();
        }
    }, 300);
}

function showSuccessState() {
    document.getElementById('successState')?.classList.remove('hidden');
    document.getElementById('successState')?.classList.add('fade-in-up');
    
    document.getElementById('loadingState')?.classList.add('hidden');
    document.getElementById('errorState')?.classList.add('hidden');
    document.getElementById('sendForm')?.classList.add('hidden');
}

// Animation de confettis
function triggerConfetti() {
    const canvas = document.getElementById('confetti');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiPieces = [];
    const colors = ['#6C63FF', '#FF6B9D', '#FFD93D', '#6BCF7F', '#FF6B6B', '#4ECDC4'];
    
    // Créer les confettis
    for (let i = 0; i < 150; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            shape: Math.random() > 0.5 ? 'square' : 'circle'
        });
    }
    
    // Animation
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = confettiPieces.length - 1; i >= 0; i--) {
            const piece = confettiPieces[i];
            
            // Mise à jour de la position
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.vy += 0.15; // Gravité
            piece.vx *= 0.99; // Résistance de l'air
            piece.rotation += piece.rotationSpeed;
            
            // Dessiner le confetti
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.rotation * Math.PI / 180);
            ctx.fillStyle = piece.color;
            
            if (piece.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
            }
            
            ctx.restore();
            
            // Supprimer les confettis hors écran
            if (piece.y > canvas.height + 50 || piece.x < -50 || piece.x > canvas.width + 50) {
                confettiPieces.splice(i, 1);
            }
        }
        
        // Continuer l'animation s'il reste des confettis
        if (confettiPieces.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            // Nettoyer le canvas une fois terminé
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animateConfetti();
}

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', function() {
    const canvas = document.getElementById('confetti');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
    showFormError('Une erreur technique est survenue');
});

// Prévention du spam - limitation des soumissions
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 3000; // 3 secondes

document.getElementById('messageForm')?.addEventListener('submit', function(e) {
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
        e.preventDefault();
        showFormError('Veuillez attendre quelques secondes avant d\'envoyer un autre message');
        return false;
    }
    lastSubmitTime = now;
});

// Raccourcis clavier
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter pour envoyer
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('messageForm');
        const sendForm = document.getElementById('sendForm');
        
        if (form && sendForm && !sendForm.classList.contains('hidden')) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    }
    
    // Escape pour annuler
    if (e.key === 'Escape') {
        const successState = document.getElementById('successState');
        if (successState && !successState.classList.contains('hidden')) {
            sendAnother();
        }
    }
});

// Auto-resize de la textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('messageContent');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
}

// Écouter les changements dans la textarea pour l'auto-resize
document.getElementById('messageContent')?.addEventListener('input', autoResizeTextarea);

// Détection de copier-coller pour des liens malveillants (sécurité basique)
document.getElementById('messageContent')?.addEventListener('paste', function(e) {
    setTimeout(() => {
        const content = e.target.value;
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlPattern);
        
        if (urls && urls.length > 3) {
            showFormError('Trop de liens détectés. Veuillez réduire le nombre de liens dans votre message.');
        }
    }, 100);
});

// Fonction utilitaire pour détecter si on est sur mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Ajustements pour mobile
if (isMobile()) {
    // Ajuster la hauteur de la viewport sur mobile
    function setVH() {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
}

// Performance: Debounce pour l'input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Appliquer le debounce à la validation du message
const debouncedValidation = debounce(function(content) {
    validateMessage(content);
}, 300);

// Remplacer la validation directe par la version debounced
document.getElementById('messageContent')?.addEventListener('input', function(e) {
    handleMessageInput(e);
    debouncedValidation(e.target.value.trim());
});

// Statistiques d'usage (anonymes) - optionnel
function trackEvent(eventName, properties = {}) {
    // Ici vous pourriez ajouter un service d'analytics anonyme
    console.log('Event:', eventName, properties);
}

// Tracker des événements importants
document.getElementById('messageForm')?.addEventListener('submit', () => {
    trackEvent('message_sent', { target_user: targetUser?.username });
});

window.addEventListener('load', () => {
    trackEvent('send_page_loaded', { has_target: !!targetLinkId });
});