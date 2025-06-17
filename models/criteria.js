// models/criteria.js (atau sesuaikan nama filenya jika berbeda, misal criterion.js)
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Criteria extends Model { // Pastikan nama class adalah Criteria
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Criteria.init({ // Pastikan ini memanggil init pada Criteria
    namaKriteria: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Nama kriteria tidak boleh kosong" }
      }
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Menggunakan 'weight' sebagai nama properti di model JavaScript,
    // dan memetakannya ke kolom 'bobot' di database.
    weight: {                   // <-- NAMA PROPERTI DI MODEL JAVASCRIPT
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'bobot',           // <-- NAMA KOLOM DI DATABASE POSTGRESQL
      validate: {
        isFloat: { msg: "Bobot harus berupa angka desimal" },
        min: { args: [0], msg: "Bobot minimal 0" },
        max: { args: [100], msg: "Bobot maksimal 100" }
      }
    },
    tipeData: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Tipe data kriteria tidak boleh kosong" }
      }
    },
    editable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Criteria',    // Nama model singular, diawali huruf besar
    tableName: 'Criteria'    // Nama tabel di database (plural, sesuai migrasi kita)
                              // Jika nama tabel Anda 'Criteria' (singular), ubah ini dan pastikan migrasi juga 'Criteria'
  });
  return Criteria;
};