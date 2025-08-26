// Middleware d'authentification simplifié
// Dans cette application, nous n'avons pas de système d'authentification traditionnel
// Les utilisateurs sont identifiés par leur ID stocké dans le localStorage

const User = require('../models/User');

// Vérifier que l'utilisateur existe via son ID
const validateUser = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ message: 'ID utilisateur requis' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Erreur de validation utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Vérifier que le pseudo est disponible
const checkUsernameAvailability = async (req, res, next) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ message: 'Pseudo requis' });
        }
        
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Ce pseudo est déjà utilisé' });
        }
        
        next();
    } catch (error) {
        console.error('Erreur de vérification du pseudo:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    validateUser,
    checkUsernameAvailability
};