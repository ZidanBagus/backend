// migrations/YYYYMMDDHHMMSS-create-applicant.js (sesuaikan nama file)
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Applicants', { // Nama tabel default 'Applicants'
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ipk: {
        type: Sequelize.FLOAT, // Menggunakan FLOAT
        allowNull: false
      },
      penghasilanOrtu: {
        type: Sequelize.STRING,
        allowNull: false
      },
      jmlTanggungan: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ikutOrganisasi: {
        type: Sequelize.STRING, // "Ya" atau "Tidak"
        allowNull: false
      },
      ikutUKM: {
        type: Sequelize.STRING, // "Ya" atau "Tidak"
        allowNull: false
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
    await queryInterface.dropTable('Applicants');
  }
};