// migrations/YYYYMMDDHHMMSS-create-user.js (sesuaikan nama file)
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', { // Nama tabel default adalah bentuk jamak dari nama model
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false, // Tidak boleh kosong
        unique: true      // Harus unik
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false // Tidak boleh kosong
      },
      namaLengkap: { // namaLengkap dari --attributes sebelumnya
        type: Sequelize.STRING,
        allowNull: true // Bisa kosong
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Default value
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Default value
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};