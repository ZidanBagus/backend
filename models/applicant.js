// models/applicant.js
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Applicant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Misalnya, jika hasil seleksi merujuk ke pendaftar:
      // Applicant.hasOne(models.SelectionResult, { foreignKey: 'applicantId', as: 'result' });
    }
  }
  Applicant.init({
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nama pendaftar tidak boleh kosong" }
      }
    },
    ipk: {
      type: DataTypes.FLOAT, // Kita simpan sebagai FLOAT di database
      allowNull: false,
      validate: {
        isFloat: { msg: "IPK harus berupa angka desimal" },
        min: { args: [0], msg: "IPK minimal 0" },
        max: { args: [4], msg: "IPK maksimal 4" }
      }
    },
    penghasilanOrtu: { // Sesuai data Excel Anda yang kategorikal
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Kategori penghasilan orang tua tidak boleh kosong" }
        // Anda bisa menambahkan validasi isIn: [['Rendah', 'Sedang', 'Tinggi', 'Tidak Diketahui']] jika perlu
      }
    },
    jmlTanggungan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "Jumlah tanggungan harus berupa angka bulat" },
        min: { args: [0], msg: "Jumlah tanggungan minimal 0" }
      }
    },
    ikutOrganisasi: {
      type: DataTypes.STRING, // Akan berisi "Ya" atau "Tidak"
      allowNull: false,
      validate: {
        isIn: {
          args: [['Ya', 'Tidak']],
          msg: "Status keikutsertaan organisasi harus 'Ya' atau 'Tidak'"
        }
      }
    },
    ikutUKM: {
      type: DataTypes.STRING, // Akan berisi "Ya" atau "Tidak"
      allowNull: false,
      validate: {
        isIn: {
          args: [['Ya', 'Tidak']],
          msg: "Status keikutsertaan UKM harus 'Ya' atau 'Tidak'"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Applicant',
    // Sequelize akan otomatis menamai tabel menjadi 'Applicants'
  });
  return Applicant;
};