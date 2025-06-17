// controllers/authController.js
const db = require('../models'); // Mengarah ke models/index.js
const User = db.User; // Ambil model User
const jwt = require('jsonwebtoken');
// bcryptjs sudah diimpor dan digunakan di model User untuk hashing,
// tapi kita butuh .compare di sini atau method instance di model

// Fungsi Login Admin
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validasi input dasar
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password tidak boleh kosong.' });
    }

    // 2. Cari user berdasarkan username
    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      return res.status(401).json({ message: 'Autentikasi gagal. User tidak ditemukan.' });
    }

    // 3. Validasi password
    // Kita menggunakan method instance validatePassword yang sudah kita buat di model User
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Autentikasi gagal. Password salah.' });
    }

    // 4. Jika username dan password valid, buat token JWT
    const payload = {
      id: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap
      // Anda bisa tambahkan role atau data lain di payload jika perlu
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // Rahasia dari .env
      { expiresIn: '1h' } // Token berlaku selama 1 jam (bisa disesuaikan)
    );

    // 5. Kirim token dan data user (tanpa password) ke klien
    res.status(200).json({
      message: 'Login berhasil!',
      user: {
        id: user.id,
        username: user.username,
        namaLengkap: user.namaLengkap
      },
      token: token
    });

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mencoba login.', error: error.message });
  }
};

// (Opsional) Fungsi Registrasi Admin Baru - Hati-hati dengan siapa yang bisa akses ini
// Untuk saat ini, kita fokus pada login karena admin sudah ada via seeder.
/*
exports.register = async (req, res) => {
  try {
    const { username, password, namaLengkap } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password dibutuhkan." });
    }

    // Cek jika username sudah ada (opsional, karena model sudah ada validasi unique)
    // const existingUser = await User.findOne({ where: { username } });
    // if (existingUser) {
    //   return res.status(409).json({ message: "Username sudah digunakan." });
    // }

    // Password akan di-hash otomatis oleh hook beforeCreate di model User
    const newUser = await User.create({
      username,
      password, // Kirim password mentah, model akan hash
      namaLengkap
    });

    res.status(201).json({
      message: "User admin berhasil diregistrasi.",
      user: {
        id: newUser.id,
        username: newUser.username,
        namaLengkap: newUser.namaLengkap
      }
      // Jangan kirim password kembali
    });

  } catch (error) {
    // Tangani error validasi dari Sequelize (misalnya username unik)
    if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    console.error('Error saat registrasi:', error);
    res.status(500).json({ message: "Terjadi kesalahan pada server.", error: error.message });
  }
};
*/