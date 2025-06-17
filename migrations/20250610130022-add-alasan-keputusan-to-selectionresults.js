// migrations/...-add-alasan-keputusan-to-selectionresults.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Pertama, hapus kolom skorPrediksi
    await queryInterface.removeColumn('SelectionResults', 'skorPrediksi');
    
    // Kemudian, tambahkan kolom alasanKeputusan
    await queryInterface.addColumn('SelectionResults', 'alasanKeputusan', {
      type: Sequelize.TEXT, // Gunakan TEXT agar bisa menampung teks yang panjang
      allowNull: true, // Bisa null jika ada kasus yang tidak terduga
    });
  },

  async down(queryInterface, Sequelize) {
    // Jika di-rollback, hapus kolom alasanKeputusan
    await queryInterface.removeColumn('SelectionResults', 'alasanKeputusan');
    
    // Dan tambahkan kembali kolom skorPrediksi
    await queryInterface.addColumn('SelectionResults', 'skorPrediksi', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  }
};