// models/user.js
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs'); // Impor bcryptjs

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Contoh: Jika User memiliki banyak Pendaftar yang diinput olehnya
      // User.hasMany(models.Applicant, { foreignKey: 'userId' });
    }

    // Method untuk membandingkan password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false, // Tidak boleh kosong
      unique: true,     // Harus unik
      validate: {
        notEmpty: { msg: "Username tidak boleh kosong" },
        isAlphanumeric: { msg: "Username hanya boleh berisi huruf dan angka" } // Opsional: validasi format username
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Password tidak boleh kosong" },
        // len: { args: [6, 100], msg: "Password minimal 6 karakter" } // Opsional: validasi panjang password
      }
    },
    namaLengkap: { // namaLengkap dari --attributes sebelumnya
      type: DataTypes.STRING,
      allowNull: true // Bisa kosong jika tidak wajib
    }
  }, {
    sequelize,
    modelName: 'User',
    // Tambahkan hooks untuk hashing password sebelum disimpan
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        // Hanya hash password jika field password diubah
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};