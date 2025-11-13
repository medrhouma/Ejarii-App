const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');

// @desc    Récupérer tous les biens (avec filtres)
// @route   GET /api/properties
// @access  Public
exports.getAllProperties = async (req, res, next) => {
  try {
    const {
      type,
      transactionType,
      city,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      bedrooms,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    // Construire le filtre
    const filter = {};

    if (type) filter.type = type;
    if (transactionType) filter.transactionType = transactionType;
    if (city) filter['location.city'] = new RegExp(city, 'i'); // Recherche insensible à la casse
    if (status) filter.status = status;
    else filter.status = 'disponible'; // Par défaut, afficher seulement les biens disponibles

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minSurface || maxSurface) {
      filter['features.surface'] = {};
      if (minSurface) filter['features.surface'].$gte = Number(minSurface);
      if (maxSurface) filter['features.surface'].$lte = Number(maxSurface);
    }

    if (bedrooms) filter['features.bedrooms'] = Number(bedrooms);

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Récupérer les biens
    const properties = await Property.find(filter)
      .populate('owner', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Compter le total
    const total = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer un bien par ID
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'owner',
      'name email phone avatar'
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien non trouvé',
      });
    }

    // Incrémenter les vues
    property.views += 1;
    await property.save();

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer un bien
// @route   POST /api/properties
// @access  Private
exports.createProperty = async (req, res, next) => {
  try {
    // Ajouter l'owner (utilisateur connecté)
    req.body.owner = req.user._id;

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un bien
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien non trouvé',
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce bien',
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un bien
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien non trouvé',
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce bien',
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bien supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload images pour un bien
// @route   POST /api/properties/:id/images
// @access  Private
exports.uploadPropertyImages = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien non trouvé',
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image téléchargée',
      });
    }

    // Upload vers Cloudinary
    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: 'real-estate/properties',
      });
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    // Ajouter les URLs aux images du bien
    property.images.push(...imageUrls);
    await property.save();

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer les biens de l'utilisateur connecté
// @route   GET /api/properties/my-properties
// @access  Private
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};