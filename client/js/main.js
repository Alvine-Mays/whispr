// Configuration API
const API_BASE = window.location.hostname === 'localhost' ? 
    'http://localhost:3000/api' : 
    '/api';

// Variables globales
let currentUser = null;
let currentLinkId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkExistingUser();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const usernameInput = document.getElementById('username');
    const usernameForm = document.getElementById('usernameForm');
    
    if (usernameInput) {
        usernameInput.addEventListener('input', handleUsernameInput);
        usernameInput.addEventListener('keypress', handleUsernameKeypress);
    }
    
    if (usernameForm) {
        usernameForm.addEventListener('submit', handleCreateUser);
    }
}

// Gestion de l'input du nom d'utilisateur
function handleUsernameInput(e) {
    const value = e.target.value;
    const charCount = document.getElementById('charCount');
    const errorMessage = document.getElementById('errorMessage');
    
    // Mettre à jour le compteur de caractères
    if (charCount) {
        charCount.textContent = `${value.length}/20 caractères`;
        charCount.className = `text-xs mt-1 ${
            value.length > 15 ? 'text-orange-500' : 
            value.length > 18 ? 'text-red-500' : 'text-gray-500'
        }`;
    }
    
    // Validation en temps réel
    if (value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value)) {
        showError('Seules les lettres, chiffres et underscore sont autorisés');
    } else {
        hideError();
    }
}

// Gestion des touches dans l'input
function handleUsernameKeypress(e) {
    // Empêcher les caractères non autorisés
    const char = String.fromCharCode(e.which);
    if (!/[a-zA-Z0-9_]/.test(char)) {
        e.preventDefault();
    }
}

// Créer un nouvel utilisateur
async function handleCreateUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const button = document.getElementById('createButton');
    const buttonText = button.querySelector('.button-text');
    const buttonLoading = button.querySelector('.button-loading');
    
    // Validation
    if (!validateUsername(username)) {
        return;
    }
    
    // État de chargement
    button.disabled = true;
    buttonText.classList.add('hidden');
    buttonLoading.classList.remove('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/users/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la création');
        }
        
        // Succès - sauvegarder les données utilisateur
        currentUser = data.user;
        currentLinkId = data.user.linkId;
        localStorage.setItem('whispr_user', JSON.stringify(currentUser));
        
        // Afficher la section de succès
        showSuccessSection();
        
        // Animation de confettis
        triggerConfetti();
        
    } catch (error) {
        console.error('Erreur création utilisateur:', error);
        showError(error.message || 'Une erreur est survenue');
    } finally {
        // Réinitialiser le bouton
        button.disabled = false;
        buttonText.classList.remove('hidden');
        buttonLoading.classList.add('hidden');
    }
}

// Validation du nom d'utilisateur
function validateUsername(username) {
    if (!username || username.length < 3) {
        showError('Le pseudo doit contenir au moins 3 caractères');
        return false;
    }
    
    if (username.length > 20) {
        showError('Le pseudo ne peut pas dépasser 20 caractères');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showError('Le pseudo ne peut contenir que des lettres, chiffres et underscore');
        return false;
    }
    
    return true;
}

// Afficher une erreur
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

// Masquer l'erreur
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// Afficher le formulaire de création
function showCreateForm() {
    const welcomeSection = document.getElementById('welcomeSection');
    const createForm = document.getElementById('createForm');
    
    welcomeSection.classList.add('hidden');
    createForm.classList.remove('hidden');
    createForm.classList.add('fade-in-up');
    
    // Focus sur l'input
    setTimeout(() => {
        const usernameInput = document.getElementById('username');
        if (usernameInput) usernameInput.focus();
    }, 100);
}

// Afficher la section d'accueil
function showWelcome() {
    const welcomeSection = document.getElementById('welcomeSection');
    const createForm = document.getElementById('createForm');
    
    createForm.classList.add('hidden');
    welcomeSection.classList.remove('hidden');
    welcomeSection.classList.add('fade-in-up');
    
    // Réinitialiser le formulaire
    const form = document.getElementById('usernameForm');
    if (form) form.reset();
    hideError();
}

// Afficher la section de succès
function showSuccessSection() {
    const createForm = document.getElementById('createForm');
    const successSection = document.getElementById('successSection');
    
    createForm.classList.add('hidden');
    successSection.classList.remove('hidden');
    successSection.classList.add('fade-in-up');
    
    // Mettre à jour les liens et informations
    updateSuccessSection();
}

// Mettre à jour la section de succès
function updateSuccessSection() {
    if (!currentUser || !currentLinkId) return;
    
    const baseUrl = window.location.origin;
    const userLink = `${baseUrl}/send.html?u=${currentLinkId}`;
    const dashboardLink = `${baseUrl}/dashboard.html?u=${currentLinkId}`;
    
    // Mettre à jour le lien généré
    const linkElement = document.getElementById('generatedLink');
    if (linkElement) {
        linkElement.textContent = userLink;
    }
    
    // Mettre à jour le lien du dashboard
    const dashboardLinkElement = document.getElementById('dashboardLink');
    if (dashboardLinkElement) {
        dashboardLinkElement.href = dashboardLink;
    }
}

// Vérifier s'il y a un utilisateur existant
function checkExistingUser() {
    const savedUser = localStorage.getItem('whispr_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            currentLinkId = currentUser.linkId;
            // Optionnel: rediriger vers le dashboard
        } catch (error) {
            console.error('Erreur parsing utilisateur sauvegardé:', error);
            localStorage.removeItem('whispr_user');
        }
    }
}

// Copier le lien
function copyLink() {
    if (!currentLinkId) return;
    
    const baseUrl = window.location.origin;
    const userLink = `${baseUrl}/send.html?u=${currentLinkId}`;
    
    navigator.clipboard.writeText(userLink).then(() => {
        showToast('Lien copié dans le presse-papiers !');
    }).catch(() => {
        // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
        const textArea = document.createElement('textarea');
        textArea.value = userLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Lien copié !');
    });
}

// Partage WhatsApp
function shareWhatsApp() {
    if (!currentLinkId) return;
    
    const baseUrl = window.location.origin;
    const userLink = `${baseUrl}/send.html?u=${currentLinkId}`;
    const message = encodeURIComponent(`Hey ! Envoie-moi un message anonyme sur Whispr : ${userLink}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
}

// Partage Instagram (copie le lien - Instagram ne permet pas le partage direct)
function shareInstagram() {
    copyLink();
    showToast('Lien copié ! Colle-le dans ta story Instagram');
}

// Partage Snapchat (copie le lien)
function shareSnapchat() {
    copyLink();
    showToast('Lien copié ! Colle-le dans ton Snap');
}

// Afficher un toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    
    // Changer la couleur selon le type
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    // Afficher le toast
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    
    // Masquer le toast après 3 secondes
    setTimeout(() => toast.classList.add('translate-x-full'), 3000);
}

// Animation de confettis
function triggerConfetti() {
    const canvas = document.getElementById('confetti');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiPieces = [];
    const colors = ['#6C63FF', '#FF6B9D', '#FFD93D', '#6BCF7F', '#FF6B6B'];
    
    // Créer les confettis
    for (let i = 0; i < 100; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
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
            piece.vy += 0.1; // Gravité
            piece.rotation += piece.rotationSpeed;
            
            // Dessiner le confetti
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.rotation * Math.PI / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
            ctx.restore();
            
            // Supprimer les confettis hors écran
            if (piece.y > canvas.height + 10) {
                confettiPieces.splice(i, 1);
            }
        }
        
        // Continuer l'animation s'il reste des confettis
        if (confettiPieces.length > 0) {
            requestAnimationFrame(animateConfetti);
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
});

// Service Worker pour PWA (optionnel)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker enregistré avec succès');
        }).catch(function(err) {
            console.log('ServiceWorker échec de l\'enregistrement');
        });
    });
}