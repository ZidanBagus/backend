// seeders/YYYYMMDDHHMMSS-initial-admin-user.js (sesuaikan nama file)
'use strict';
const bcrypt = require('bcryptjs'); // Impor bcryptjs

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds); // Ganti 'admin123' dengan password default yang Anda inginkan

    await queryInterface.bulkInsert('Users', [{ // Nama tabel adalah 'Users' (plural)
      username: 'admin',
      password: hashedPassword,
      namaLengkap: 'Administrator Sistem',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    // Perintah untuk mengembalikan (undo) seeder
    await queryInterface.bulkDelete('Users', { username: 'admin' }, {});
  }
};