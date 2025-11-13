const express = require('express');
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middlewares/auth');

// Toutes les routes sont protégées
router.use(protect);

router.get('/', getFavorites);
router.post('/:propertyId', addFavorite);
router.delete('/:propertyId', removeFavorite);
router.get('/check/:propertyId', checkFavorite);

module.exports = router;