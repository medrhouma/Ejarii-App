const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protéger les routes (vérifier si l'utilisateur est connecté)
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token existe dans les headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Si pas de token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, token manquant',
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur (sans le password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
    });
  }
};

// Vérifier si l'utilisateur est admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Administrateur requis.',
    });
  }
};