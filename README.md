# 🔮 Whispr - Messages Anonymes

Whispr est une application web moderne permettant de recevoir des messages anonymes via un lien unique, similaire à NGL. L'application privilégie la confidentialité et l'anonymat complet.

## 🚀 Fonctionnalités

### ✨ Fonctionnalités Principales
- **Création de liens anonymes** : Chaque utilisateur obtient un lien unique (ex: `whispr.app/u/abc123`)
- **Messages anonymes** : Envoi de messages sans inscription ni traçage
- **Dashboard intuitif** : Interface responsive pour consulter ses messages
- **Suppression automatique** : Messages supprimés après 48h automatiquement
- **100% Anonyme** : Aucun traçage IP, aucune donnée personnelle stockée

### 🎨 Interface & Design
- **Design Flat moderne** : Palette violet (#6C63FF), rose (#FF6B9D), accents colorés
- **Mobile-First** : Optimisé prioritairement pour mobile
- **Animations fluides** : Transitions et effets visuels (confettis, etc.)
- **Dark mode ready** : Support des préférences système

### 🔒 Sécurité & Confidentialité
- **Anonymat total** : Aucune collecte d'emails ou données personnelles
- **Pas de traçage IP** : Aucun log des adresses IP
- **Auto-suppression** : TTL MongoDB + tâche cron de nettoyage
- **Rate limiting** : Protection contre le spam
- **Validation stricte** : Sanitisation des inputs

### 📱 Fonctionnalités Sociales
- **Partage multi-plateformes** : WhatsApp, Instagram, Snapchat
- **Copie de lien en un clic** : Bouton de partage intégré
- **Compteur de messages** : Statistiques en temps réel
- **Messages lus/non lus** : Système de suivi de lecture

## 🛠️ Technologies

### Frontend
- **HTML5** : Structure sémantique
- **TailwindCSS** : Framework CSS utility-first
- **Vanilla JavaScript** : Pas de framework lourd, optimisé
- **Font Awesome** : Icônes modernes
- **Canvas API** : Animations de confettis

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web minimaliste
- **MongoDB Atlas** : Base de données cloud
- **Mongoose** : ODM MongoDB

### Outils & Sécurité
- **Helmet** : Sécurisation des headers HTTP
- **CORS** : Gestion des origines cross-domain
- **Rate Limiting** : Protection contre les abus
- **Node-cron** : Tâches automatisées
- **TTL Index** : Expiration automatique MongoDB

## 📂 Structure du Projet

```
whispr/
├── client/                 # Frontend
│   ├── index.html         # Page d'accueil
│   ├── dashboard.html     # Dashboard utilisateur
│   ├── send.html          # Page d'envoi de messages
│   ├── css/
│   │   └── style.css      # Styles personnalisés
│   └── js/
│       ├── main.js        # Script principal
│       ├── dashboard.js   # Logic dashboard
│       └── send.js        # Logic envoi messages
├── server/                # Backend
│   ├── app.js            # Serveur Express principal
│   ├── models/
│   │   ├── User.js       # Modèle utilisateur
│   │   └── Message.js    # Modèle message
│   └── routes/
│       ├── users.js      # Routes utilisateurs
│       └── messages.js   # Routes messages
├── package.json          # Dépendances npm
├── .env.example          # Variables d'environnement
├── Procfile             # Configuration Heroku
└── README.md            # Documentation
```

## ⚡ Installation & Déploiement

### 1. Configuration locale

```bash
# Cloner le projet
git clone <votre-repo>
cd whispr

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations
```

### 2. Configuration MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un nouveau cluster (gratuit)
3. Configurer un utilisateur avec droits lecture/écriture
4. Obtenir la connection string
5. Ajouter votre IP aux accès autorisés
6. Mettre à jour `MONGODB_URI` dans `.env`

### 3. Développement

```bash
# Lancer en mode développement
npm run dev

# Ou en mode production
npm start
```

### 4. Déploiement

#### Heroku (Backend)
```bash
# Installer Heroku CLI
heroku create whispr-backend

# Variables d'environnement
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set NODE_ENV=production

# Déployer
git push heroku main
```

#### Netlify (Frontend)
1. Build le dossier `client/`
2. Déployer sur Netlify
3. Configurer l'URL du backend dans les scripts

## 🔧 Configuration

### Variables d'environnement (.env)

```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/whispr
NODE_ENV=production
CLIENT_URL=https://votre-frontend.netlify.app
```

### Configuration MongoDB

L'application utilise MongoDB Atlas avec :
- **TTL automatique** : Messages supprimés après 48h
- **Index optimisés** : Performance des requêtes
- **Connection pooling** : Gestion efficace des connexions

### Sécurité

- **Rate limiting** : 100 requêtes/15min global, 5 messages/min
- **Headers sécurisés** : Helmet.js
- **Validation stricte** : Sanitisation des inputs
- **CORS configuré** : Origines autorisées uniquement

## 📱 Utilisation

### Pour les utilisateurs

1. **Créer un lien** : Aller sur la page d'accueil, choisir un pseudo
2. **Partager** : Copier le lien généré et le partager
3. **Recevoir des messages** : Les messages arrivent sur votre dashboard
4. **Consulter** : Cliquer sur un message pour le lire en entier

### Pour envoyer un message

1. **Cliquer sur un lien** : Format `domain.com/send.html?u=linkId`
2. **Écrire** : Taper votre message anonyme (max 500 caractères)
3. **Envoyer** : Le message arrive instantanément au destinataire

## 🎯 Roadmap

### Version 1.1
- [ ] Notifications push
- [ ] Thèmes personnalisables
- [ ] Export des messages
- [ ] Statistiques avancées

### Version 1.2
- [ ] Messages avec médias (images)
- [ ] Réactions aux messages
- [ ] Liens personnalisés
- [ ] API publique

### Version 2.0
- [ ] Application mobile (React Native)
- [ ] Messages temporaires (auto-destruction)
- [ ] Salons de discussion anonymes
- [ ] Modération automatique

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code

- **ESLint** : Respect des conventions JavaScript
- **Prettier** : Formatage automatique
- **Commits conventionnels** : `feat:`, `fix:`, `docs:`, etc.

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/Alvine-Mays/whispr.git)
- **Documentation** : Ce README + commentaires dans le code
- **Email** : votre-email@domain.com

## 🎉 Remerciements

- **TailwindCSS** : Framework CSS fantastique
- **MongoDB** : Base de données fiable
- **Font Awesome** : Icônes magnifiques
- **Heroku** : Hébergement simple

---

**Fait avec ❤️ par Alvine Mays**

> Whispr - Parce que parfois, l'anonymat libère la parole