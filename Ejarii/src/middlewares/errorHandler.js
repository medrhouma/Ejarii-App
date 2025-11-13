const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreur Mongoose - ID invalide
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Ressource non trouvée (ID invalide)',
    });
  }

  // Erreur Mongoose - Doublon (clé unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} existe déjà`,
    });
  }

  // Erreur Mongoose - Validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // Erreur JWT - Token invalide
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }

  // Erreur JWT - Token expiré
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré',
    });
  }

  // Erreur générique
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
  });
};

module.exports = errorHandler;