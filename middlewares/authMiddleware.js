// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../models'); // Untuk mengambil data User jika diperlukan
const User = db.User;

const protect = async (req, res, next) => {
  let token;

  // 1. Cek apakah ada token di header Authorization dan formatnya benar (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Ambil token dari header (hilangkan "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Ambil data user dari token (tanpa password) dan sisipkan ke req object
      // Anda bisa memilih untuk mengambil ulang data user dari DB untuk data terbaru,
      // atau cukup gunakan data dari payload token jika sudah cukup.
      // Mengambil dari DB memastikan user masih ada dan datanya fresh.
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] } // Jangan sertakan password
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user tidak ditemukan (mungkin terhapus)' });
      }

      next(); // Lanjutkan ke controller/middleware berikutnya jika token valid

    } catch (error) {
      console.error('Error verifikasi token:', error.message);
      // Tangani error spesifik JWT (mis: token expired, token tidak valid)
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token kedaluwarsa' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Not authorized, token tidak valid' });
      }
      return res.status(401).json({ message: 'Not authorized, token gagal diverifikasi' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, tidak ada token' });
  }
};

// (Opsional) Middleware untuk otorisasi berdasarkan role, jika Anda punya role nanti
/*
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) { // Asumsi ada field 'role' di model User
      return res.status(403).json({ message: 'User role not authorized to access this route' });
    }
    next();
  };
};
*/

module.exports = { protect /*, authorize */ };