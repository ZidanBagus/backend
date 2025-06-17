// migrations/YYYYMMDDHHMMSS-create-criteria.js (sesuaikan nama file)
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Criterias', { // Menggunakan nama tabel 'Criterias' (plural)
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      namaKriteria: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true // Pastikan unik
      },
      deskripsi: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bobot: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      tipeData: {
        type: Sequelize.STRING,
        allowNull: false
      },
      editable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Criterias'); // Sesuaikan dengan nama tabel di atas
  }
};