const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Envoyer un message anonyme
router.post('/send', async (req, res) => {
  try {
    const { linkId, content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Le message ne peut pas être vide' 
      });
    }

    if (content.length > 500) {
      return res.status(400).json({ 
        error: 'Le message ne peut pas dépasser 500 caractères' 
      });
    }

    // Vérifier que le destinataire existe
    const user = await User.findOne({ linkId });
    if (!user) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Créer le message
    const message = new Message({
      recipientLinkId: linkId,
      content: content.trim()
    });

    await message.save();

    // Incrémenter le compteur de messages de l'utilisateur
    await User.findOneAndUpdate(
      { linkId },
      { $inc: { messageCount: 1 } }
    );

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;