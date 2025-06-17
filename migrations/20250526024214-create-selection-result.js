// migrations/YYYYMMDDHHMMSS-create-selection-result.js (sesuaikan nama file)
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SelectionResults', { // Nama tabel 'SelectionResults'
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      applicantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applicants', // Nama tabel target (plural)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Atau SET NULL jika Anda ingin hasil tetap ada tapi applicantId jadi null
      },
      namaPendaftar: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ipk: {
        type: Sequelize.FLOAT,
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
        type: Sequelize.STRING,
        allowNull: false
      },
      ikutUKM: {
        type: Sequelize.STRING,
        allowNull: false
      },
      statusKelulusan: {
        type: Sequelize.STRING,
        allowNull: false
      },
      skorPrediksi: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      tanggalSeleksi: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('SelectionResults');
  }
};