const express = require('express');
const router = express.Router();
const {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  getMyProperties,
} = require('../controllers/propertyController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Routes publiques
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Routes protégées
router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post(
  '/:id/images',
  protect,
  upload.array('images', 10), // Max 10 images
  uploadPropertyImages
);
router.get('/user/my-properties', protect, getMyProperties);

module.exports = router;