// models/selectionresult.js
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SelectionResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Definisikan asosiasi: Satu SelectionResult milik (belongsTo) satu Applicant.
      // Ini berarti di tabel SelectionResults akan ada foreign key `applicantId`.
      SelectionResult.belongsTo(models.Applicant, {
        foreignKey: 'applicantId', // Kolom di tabel SelectionResults yang merujuk ke Applicants
        as: 'applicant',        // Alias yang bisa digunakan saat query, e.g., include: 'applicant'
        onDelete: 'CASCADE',    // Jika Applicant dihapus, hasil seleksinya juga ikut terhapus.
        onUpdate: 'CASCADE'     // Jika ID di Applicant berubah, ID di sini juga ikut berubah.
      });
    }
  }
  SelectionResult.init({
    // id, createdAt, updatedAt akan dibuat otomatis oleh Sequelize
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Applicants', // Nama tabel target (plural)
        key: 'id'
      }
    },
    namaPendaftar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ipk: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    penghasilanOrtu: {
      type: DataTypes.STRING,
      allowNull: false
    },
    jmlTanggungan: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ikutOrganisasi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ikutUKM: {
      type: DataTypes.STRING,
      allowNull: false
    },
    statusKelulusan: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['Direkomendasikan', 'Tidak Direkomendasikan']],
          msg: "Status kelulusan tidak valid. Harus 'Direkomendasikan' atau 'Tidak Direkomendasikan'."
        }
      }
    },
    // Kolom skorPrediksi dihapus
    // skorPrediksi: {
    //   type: DataTypes.FLOAT,
    //   allowNull: true 
    // },
    // Kolom baru untuk alasan keputusan ditambahkan
    alasanKeputusan: {
      type: DataTypes.TEXT, // Menggunakan TEXT agar bisa menampung teks alasan yang panjang
      allowNull: true // Bisa null jika tidak ada alasan spesifik
    },
    tanggalSeleksi: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'SelectionResult',
    // Sequelize akan otomatis menamai tabel menjadi 'SelectionResults' (plural)
    // Jika Anda ingin nama tabelnya sama persis dengan modelName, tambahkan: freezeTableName: true
    tableName: 'SelectionResults' // Eksplisit menentukan nama tabel untuk menghindari kebingungan
  });
  return SelectionResult;
};