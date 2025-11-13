const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewares/errorHandler');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialiser Express
const app = express();

// ⚠️ IMPORTANT : Ces middlewares DOIVENT être AVANT les routes
app.use(cors());
app.use(express.json()); // ← CETTE LIGNE EST ESSENTIELLE
app.use(express.urlencoded({ extended: true })); // ← CETTE LIGNE AUSSI

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Routes (APRÈS les middlewares)
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/properties', require('./src/routes/properties.routes'));
app.use('/api/messages', require('./src/routes/messages.routes'));
app.use('/api/favorites', require('./src/routes/favorites.routes'));

// Route de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏠 API Immobilière - Serveur opérationnel',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      messages: '/api/messages',
      favorites: '/api/favorites',
    },
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

// Gestionnaire d'erreurs
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  🚀 Serveur démarré avec succès              ║
║  📡 Mode: ${process.env.NODE_ENV || 'development'}                    ║
║  🌐 Port: ${PORT}                              ║
║  📍 URL: http://localhost:${PORT}             ║
╚══════════════════════════════════════════════╝
  `);
});

// Gérer les erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error(`❌ Erreur non gérée: ${err.message}`);
  server.close(() => process.exit(1));
});