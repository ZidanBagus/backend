// routes/selectionRoutes.js
const express = require('express');
const router = express.Router();
const selectionController = require('../controllers/selectionController'); // Pastikan path ini benar
const { protect } = require('../middlewares/authMiddleware'); // Pastikan path ini benar

// POST /api/selection/start - Memulai proses seleksi
router.post('/start', protect, selectionController.startSelectionProcess);

module.exports = router;