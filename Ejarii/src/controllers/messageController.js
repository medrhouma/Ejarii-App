const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Envoyer un message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text, propertyId } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Destinataire et message requis',
      });
    }

    // Vérifier que le destinataire existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Destinataire non trouvé',
      });
    }

    // Créer le message
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
      property: propertyId || null,
    });

    // Peupler le sender
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');
    if (propertyId) {
      await message.populate('property', 'title images');
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer les conversations de l'utilisateur
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Récupérer tous les messages où l'utilisateur est sender ou receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: -1 });

    // Créer une liste de conversations uniques
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const otherUserId =
        message.sender._id.toString() === userId.toString()
          ? message.receiver._id.toString()
          : message.sender._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user:
            message.sender._id.toString() === userId.toString()
              ? message.receiver
              : message.sender,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Compter les messages non lus
      if (
        message.receiver._id.toString() === userId.toString() &&
        !message.read
      ) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer les messages d'une conversation
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('property', 'title images')
      .sort({ createdAt: 1 });

    // Marquer les messages comme lus
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Marquer un message comme lu
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé',
      });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    message.read = true;
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};