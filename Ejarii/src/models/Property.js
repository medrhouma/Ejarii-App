const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
  },
  type: {
    type: String,
    enum: ['appartement', 'maison', 'villa', 'terrain', 'local'],
    required: [true, 'Le type de bien est obligatoire'],
  },
  transactionType: {
    type: String,
    enum: ['vente', 'location'],
    required: [true, 'Le type de transaction est obligatoire'],
  },
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: 0,
  },
  location: {
    address: {
      type: String,
      required: [true, 'L\'adresse est obligatoire'],
    },
    city: {
      type: String,
      required: [true, 'La ville est obligatoire'],
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
  },
  features: {
    surface: {
      type: Number,
      required: true,
      min: 0,
    },
    rooms: {
      type: Number,
      default: 0,
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    hasParking: {
      type: Boolean,
      default: false,
    },
    hasGarden: {
      type: Boolean,
      default: false,
    },
    hasPool: {
      type: Boolean,
      default: false,
    },
  },
  images: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ['disponible', 'vendu', 'loué'],
    default: 'disponible',
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true, // createdAt, updatedAt automatiques
});

// Index pour améliorer les recherches
propertySchema.index({ type: 1, transactionType: 1, status: 1 });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ price: 1 });

module.exports = mongoose.model('Property', propertySchema);