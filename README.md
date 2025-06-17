---
## 2. `README.md` untuk Proyek Backend (Node.js/Express.js)

File ini akan menjelaskan cara menjalankan API backend, endpoint yang tersedia, dan teknologi yang digunakan.

```markdown
# SPK Beasiswa - Backend

Ini adalah bagian backend dari aplikasi web Sistem Pendukung Keputusan (SPK) untuk seleksi penerimaan beasiswa mahasiswa. Backend ini dibangun di atas platform Node.js dengan framework Express.js dan berfungsi sebagai RESTful API untuk melayani permintaan dari aplikasi frontend.

Backend bertanggung jawab untuk:
-   Autentikasi dan otorisasi pengguna (Admin).
-   Manajemen data CRUD (Create, Read, Update, Delete) untuk Pendaftar dan Kriteria.
-   Menerima dan mem-parsing unggahan file Excel.
-   Menjalankan logika inti dari algoritma C4.5 untuk proses seleksi.
-   Menyimpan dan menyajikan data hasil seleksi.
-   Menyediakan data agregat untuk ditampilkan di dashboard frontend.

---

## Teknologi yang Digunakan

- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM (Object-Relational Mapper):** [Sequelize](https://sequelize.org/)
- **Autentikasi:** [JSON Web Tokens (JWT)](https://jwt.io/)
- **Password Hashing:** [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- **File Upload:** [Multer](https://github.com/expressjs/multer)
- **Excel Parsing:** [XLSX (SheetJS)](https://sheetjs.com/)
- **CORS Handling:** [cors](https://github.com/expressjs/cors)
- **Environment Variables:** [dotenv](https://github.com/motdotla/dotenv)

---

## Persiapan dan Instalasi

Pastikan Anda memiliki [Node.js](https://nodejs.org/) (versi 18 atau lebih baru), npm, dan server **PostgreSQL** yang sudah terinstal dan berjalan.

1.  **Clone repositori ini (jika sudah di GitHub):**
    ```bash
    git clone [https://github.com/NAMA_USER_ANDA/spk-beasiswa-backend.git](https://github.com/NAMA_USER_ANDA/spk-beasiswa-backend.git)
    cd spk-beasiswa-backend
    ```

2.  **Instal semua dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Database:**
    * Buat database PostgreSQL baru (misalnya, `spk_beasiswa_dev`).
    * Salin file `.env.example` (jika ada) menjadi `.env` atau buat file `.env` baru di root folder.
    * Isi file `.env` dengan kredensial database Anda dan JWT secret:
        ```env
        PORT=5001
        DATABASE_URL=postgresql://USERNAME_DB:PASSWORD_DB@localhost:5432/spk_beasiswa_dev
        JWT_SECRET=INI_ADALAH_KUNCI_RAHASIA_YANG_SANGAT_AMAN_DAN_PANJANG
        BCRYPT_SALT_ROUNDS=10
        ```
    * Sesuaikan juga file `config/config.json` jika diperlukan (meskipun `DATABASE_URL` lebih diutamakan untuk production).

4.  **Jalankan Migrasi Database:**
    Perintah ini akan membuat semua tabel yang diperlukan di database Anda.
    ```bash
    npx sequelize-cli db:migrate
    ```

5.  **Jalankan Seeder (Data Awal):**
    Perintah ini akan mengisi tabel dengan data awal (seperti user admin default dan kriteria).
    ```bash
    npx sequelize-cli db:seed:all
    ```
    *User default yang dibuat adalah: `username: admin`, `password: password_anda_di_seeder`.*

---

## Menjalankan API Server

Untuk menjalankan server di mode development (dengan auto-reload menggunakan `nodemon`):
```bash
npm run dev
