const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Un utilisateur ne peut ajouter un bien qu'une seule fois en favori
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);