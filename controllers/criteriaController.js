// controllers/criteriaController.js
const db = require('../models');
const Criteria = db.Criteria; // Ambil model Criteria
const { Op } = require('sequelize'); // Untuk operator Sequelize jika diperlukan

// Mendapatkan semua kriteria
exports.getAllCriteria = async (req, res) => {
  try {
    const criteria = await Criteria.findAll({
      order: [['id', 'ASC']] // Urutkan berdasarkan ID agar konsisten
    });
    res.status(200).json(criteria);
  } catch (error) {
    console.error('Error mengambil data kriteria:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil data kriteria.', error: error.message });
  }
};

// Mengupdate kriteria (khususnya bobot)
exports.updateCriteria = async (req, res) => {
  try {
    const criteriaId = req.params.id;
    const { weight } = req.body; // Untuk saat ini kita hanya fokus update bobot

    // Validasi input
    if (weight === undefined || weight === null) {
      return res.status(400).json({ message: 'Bobot kriteria tidak boleh kosong.' });
    }

    const newWeight = parseFloat(weight);
    if (isNaN(newWeight) || newWeight < 0 || newWeight > 100) {
      return res.status(400).json({ message: 'Bobot tidak valid. Harus berupa angka antara 0 dan 100.' });
    }

    // Cek apakah total bobot lain + bobot baru tidak melebihi 100%
    // Ini validasi tambahan yang penting untuk konsistensi bobot
    const otherCriteriaTotalWeight = await Criteria.sum('weight', {
      where: {
        id: { [Op.ne]: criteriaId } // [Op.ne] berarti "not equal" (tidak sama dengan)
      }
    });

    const totalWeightWithNew = (otherCriteriaTotalWeight || 0) + newWeight;

    if (totalWeightWithNew > 100.01) { // Beri sedikit toleransi untuk floating point
        return res.status(400).json({ 
            message: `Update gagal. Total bobot akan menjadi ${totalWeightWithNew.toFixed(1)}%, melebihi 100%. Harap sesuaikan bobot kriteria lain terlebih dahulu.`,
            currentTotalWeight: (otherCriteriaTotalWeight || 0),
            proposedNewWeight: newWeight
        });
    }


    const criterion = await Criteria.findByPk(criteriaId);
    if (!criterion) {
      return res.status(404).json({ message: 'Kriteria tidak ditemukan.' });
    }

    // Hanya update bobot jika kriteria tersebut editable
    if (!criterion.editable) {
        return res.status(403).json({ message: `Kriteria "${criterion.namaKriteria}" tidak dapat diubah bobotnya.` });
    }

    criterion.weight = newWeight;
    await criterion.save();

    res.status(200).json({ message: `Bobot kriteria "${criterion.namaKriteria}" berhasil diperbarui.`, criterion });

  } catch (error) {
    console.error('Error mengupdate kriteria:', error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengupdate kriteria.', error: error.message });
  }
};

// Fungsi untuk mendapatkan satu kriteria berdasarkan ID (opsional, jika diperlukan)
/*
exports.getCriteriaById = async (req, res) => {
  try {
    const criteriaId = req.params.id;
    const criterion = await Criteria.findByPk(criteriaId);
    if (!criterion) {
      return res.status(404).json({ message: 'Kriteria tidak ditemukan.' });
    }
    res.status(200).json(criterion);
  } catch (error) {
    console.error('Error mengambil data kriteria by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};
*/