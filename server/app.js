require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const app = express();

// Middleware de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes, réessayez plus tard'
  }
});
app.use(limiter);

// Rate limiting spécifique pour l'envoi de messages
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 messages par minute max
  message: {
    error: 'Trop de messages envoyés, attendez un peu'
  }
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static('client'));

// Routes API
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', messageLimiter, require('./routes/messages'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gestion des erreurs 404
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connecté à MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ Erreur connexion MongoDB:', error);
  process.exit(1);
});

// Nettoyage automatique des anciens messages (backup au TTL)
cron.schedule('0 0 * * *', async () => {
  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const result = await mongoose.model('Message').deleteMany({
      createdAt: { $lt: twoDaysAgo }
    });
    console.log(`🧹 Nettoyage: ${result.deletedCount} messages supprimés`);
  } catch (error) {
    console.error('Erreur nettoyage:', error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
});