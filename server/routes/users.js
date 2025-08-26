const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');

// Générer un ID unique
function generateLinkId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Créer un nouvel utilisateur
router.post('/create', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 3 || username.length > 20) {
      return res.status(400).json({ 
        error: 'Le pseudo doit contenir entre 3 et 20 caractères' 
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ 
        error: 'Le pseudo ne peut contenir que des lettres, chiffres et underscore' 
      });
    }

    // Vérifier si le pseudo existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Ce pseudo est déjà pris' 
      });
    }

    const linkId = generateLinkId();
    const user = new User({ username, linkId });
    await user.save();

    res.status(201).json({
      success: true,
      user: {
        username: user.username,
        linkId: user.linkId
      }
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Vérifier si un utilisateur existe
router.get('/check/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const user = await User.findOne({ linkId });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      exists: true,
      username: user.username
    });
  } catch (error) {
    console.error('Erreur vérification utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les messages d'un utilisateur
router.get('/messages/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const user = await User.findOne({ linkId });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const messages = await Message.find({ recipientLinkId: linkId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg._id,
        content: msg.content,
        createdAt: msg.createdAt,
        isRead: msg.isRead
      })),
      messageCount: messages.length,
      username: user.username
    });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Marquer un message comme lu
router.patch('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur marquage lecture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;