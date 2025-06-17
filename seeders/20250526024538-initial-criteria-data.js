// seeders/YYYYMMDDHHMMSS-initial-criteria-data.js (sesuaikan nama file)
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const initialCriteria = [
      { id: 1, namaKriteria: 'IPK', deskripsi: 'Indeks Prestasi Kumulatif Mahasiswa', bobot: 35, tipeData: 'number', editable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, namaKriteria: 'Penghasilan Orang Tua', deskripsi: 'Kategori penghasilan orang tua (Rendah, Sedang, Tinggi)', bobot: 30, tipeData: 'string_categorical', editable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, namaKriteria: 'Jumlah Tanggungan', deskripsi: 'Jumlah tanggungan orang tua saat ini', bobot: 20, tipeData: 'number', editable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, namaKriteria: 'Keikutsertaan Organisasi', deskripsi: 'Status keaktifan dalam organisasi kampus', bobot: 7.5, tipeData: 'booleanString', editable: true, createdAt: new Date(), updatedAt: new Date() }, // tipeData disesuaikan jika perlu
      { id: 5, namaKriteria: 'Keikutsertaan UKM', deskripsi: 'Status keaktifan dalam Unit Kegiatan Mahasiswa', bobot: 7.5, tipeData: 'booleanString', editable: true, createdAt: new Date(), updatedAt: new Date() } // tipeData disesuaikan jika perlu
    ];

    // Hapus ID agar auto-increment yang bekerja, kecuali jika Anda ingin ID spesifik
    const criteriaToSeed = initialCriteria.map(({ id, ...rest }) => rest);


    await queryInterface.bulkInsert('Criterias', criteriaToSeed, {}); // Nama tabel adalah 'Criterias' (plural)
  },

  async down (queryInterface, Sequelize) {
    // Hapus semua data kriteria jika di-undo
    // Atau bisa lebih spesifik jika perlu
    await queryInterface.bulkDelete('Criterias', null, {});
  }
};