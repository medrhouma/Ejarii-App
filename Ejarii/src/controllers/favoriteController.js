const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc    Ajouter un bien aux favoris
// @route   POST /api/favorites/:propertyId
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    // Vérifier que le bien existe
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien non trouvé',
      });
    }

    // Vérifier si déjà en favori
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Déjà dans les favoris',
      });
    }

    // Créer le favori
    const favorite = await Favorite.create({
      user: req.user._id,
      property: propertyId,
    });

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retirer un bien des favoris
// @route   DELETE /api/favorites/:propertyId
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      property: propertyId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favori non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Retiré des favoris',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer tous les favoris de l'utilisateur
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'property',
        populate: {
          path: 'owner',
          select: 'name email phone avatar',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vérifier si un bien est dans les favoris
// @route   GET /api/favorites/check/:propertyId
// @access  Private
exports.checkFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    next(error);
  }
};