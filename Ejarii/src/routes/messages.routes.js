const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middlewares/auth');

// Toutes les routes sont protégées
router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.put('/:id/read', markAsRead);

module.exports = router;