// controllers/applicantController.js
const db = require('../models');
const Applicant = db.Applicant;
const { Op, Sequelize } = require('sequelize'); // Pastikan Sequelize diimpor untuk Op.gte
const XLSX = require('xlsx');

// Konfigurasi mapping field internal ke header Excel dan tipe data
// Ini adalah konfigurasi yang Anda berikan sebagai yang "lama" dan "sudah benar untuk upload"
const fieldConfig = {
  nama: { excelKeys: ['nama lengkap', 'nama'], type: 'string', default: 'Tanpa Nama' },
  ipk: { excelKeys: ['ipk', 'nilai ipk'], type: 'float', default: 0.0 },
  penghasilanOrtu: { excelKeys: ['penghasilan'], type: 'string', default: 'Tidak Diketahui' },
  jmlTanggungan: { excelKeys: ['tanggungan', 'jumlah tanggungan orang tua', 'jumlah tanggungan'], type: 'integer', default: 0 },
  ikutOrganisasi: { excelKeys: ['ikut organisasi'], type: 'customBoolean', default: 'Tidak' },
  ikutUKM: { excelKeys: ['ikut ukm'], type: 'customBoolean', default: 'Tidak' }
};

// Fungsi parseExcelData dari kode Anda yang "sudah benar untuk upload"
const parseExcelData = (buffer) => {
    console.log("Memulai parseExcelData (menggunakan versi yang Anda berikan)...");
    const workbook = XLSX.read(buffer, { type: 'buffer' }); // Opsi cellFormula, dll. bisa ditambahkan jika perlu
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    console.log(`Jumlah baris mentah dari Excel (setelah header): ${jsonData.length}`);
    if (jsonData.length > 0) {
        console.log("Contoh baris mentah pertama dari Excel (objek JSON):", JSON.stringify(jsonData[0]));
    }

    if (jsonData.length === 0) {
        console.warn("parseExcelData: File Excel kosong atau tidak ada data setelah header.");
        throw new Error('File Excel kosong atau tidak ada data yang dapat dibaca setelah header.');
    }

    const parsedApplicants = jsonData.map((row, index) => {
        const newApp = {};
        const rowKeysOriginal = Object.keys(row);
        const headerMap = {};
        rowKeysOriginal.forEach(key => {
            headerMap[String(key).toLowerCase().trim()] = key;
        });

        for (const internalKey in fieldConfig) {
            const config = fieldConfig[internalKey];
            let actualExcelValue = undefined;
            let valueFound = false;

            // Inisialisasi dengan default (penting!)
            newApp[internalKey] = config.default;


            for (const excelKeyOption of config.excelKeys) {
                const normalizedKey = excelKeyOption.toLowerCase().trim();
                if (headerMap.hasOwnProperty(normalizedKey)) {
                    const originalHeader = headerMap[normalizedKey];
                    actualExcelValue = row[originalHeader];
                    valueFound = true;
                    break;
                }
            }

            if (valueFound && actualExcelValue !== null && actualExcelValue !== undefined) {
                const valStr = String(actualExcelValue).trim();
                if (valStr !== "") {
                    switch (config.type) {
                        case 'string':
                            newApp[internalKey] = valStr;
                            break;
                        case 'float':
                            const floatVal = parseFloat(valStr.replace(',', '.'));
                            newApp[internalKey] = isNaN(floatVal) ? config.default : floatVal;
                            break;
                        case 'integer':
                            // Menggunakan regex Anda: valStr.replace(/[^0-9]/g, '')
                            const intVal = parseInt(valStr.replace(/[^0-9]/g, ''), 10);
                            newApp[internalKey] = isNaN(intVal) ? config.default : intVal;
                            break;
                        case 'customBoolean':
                            newApp[internalKey] = ['ikut', 'ya', 'iya', 'yes', 'true', '1'].includes(valStr.toLowerCase()) ? 'Ya' : 'Tidak';
                            break;
                        // Tidak ada default case di switch, karena newApp[internalKey] sudah diinisialisasi config.default
                    }
                }
                // Jika valStr kosong setelah trim, newApp[internalKey] akan tetap config.default.
            }
            // Jika !valueFound atau actualExcelValue null/undefined, newApp[internalKey] akan tetap config.default.
        }

        // Jaring pengaman untuk field 'nama' dari kode Anda
        if (!newApp.nama || String(newApp.nama).trim() === "") {
            // console.warn(`Peringatan di baris data Excel ke-${index + 1}: Field 'nama' kosong atau tidak valid, di-set ke default '${fieldConfig.name.default}'. Data baris asli:`, row);
            newApp.nama = fieldConfig.name.default;
        }
        
        if (index < 1) { // Log untuk baris pertama saja agar tidak terlalu banyak
            console.log(`  Data baris Excel ke-${index + 1} SETELAH SEMUA PARSING:`, JSON.stringify(newApp));
        }
        return newApp;
    });

    if (parsedApplicants.length > 0) {
        console.log("Contoh data FINAL siap untuk bulkCreate (1 baris pertama):", JSON.stringify(parsedApplicants.slice(0, 1), null, 2));
    }
    return parsedApplicants;
};

// Fungsi createApplicant (dari kode Anda)
exports.createApplicant = async (req, res) => {
  try {
    const { nama, ipk, penghasilanOrtu, jmlTanggungan, ikutOrganisasi, ikutUKM } = req.body;
    if (!nama || String(nama).trim() === "" || ipk === undefined || !penghasilanOrtu || jmlTanggungan === undefined || !ikutOrganisasi || !ikutUKM) {
      return res.status(400).json({ message: "Semua field wajib diisi dan nama tidak boleh kosong." });
    }
    const newApplicant = await Applicant.create({
      nama: String(nama).trim(), 
      ipk: parseFloat(ipk), 
      penghasilanOrtu, 
      jmlTanggungan: parseInt(jmlTanggungan), 
      ikutOrganisasi, 
      ikutUKM
    });
    res.status(201).json({ message: 'Data pendaftar berhasil ditambahkan.', applicant: newApplicant });
  } catch (error) {
    console.error('Error menambah pendaftar (createApplicant):', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: "Data tidak valid: " + error.errors.map(e => e.message).join(', '), details: error.errors });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menambah pendaftar.', error: error.message || 'Error tidak diketahui' });
  }
};

// Fungsi uploadApplicants (dari kode Anda)
exports.uploadApplicants = async (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "Tidak ada file yang diunggah atau buffer file kosong." });
    }
    console.log(`Menerima file: ${req.file.originalname}, ukuran: ${req.file.size} bytes`);

    try {
        const applicantsData = parseExcelData(req.file.buffer);

        if (!applicantsData || applicantsData.length === 0) {
             console.warn("uploadApplicants: Tidak ada data valid setelah parsing.");
             return res.status(400).json({ message: "Tidak ada data valid yang bisa diproses dari file Excel." });
        }

        // Hapus filter 'invalidNameEntries' yang mungkin menyebabkan masalah sebelumnya
        // Kita mengandalkan validasi di model dan jaring pengaman di parseExcelData

        const createdApplicants = await Applicant.bulkCreate(applicantsData, {
            validate: true,
        });

        res.status(201).json({ 
            message: `Berhasil mengimpor dan menyimpan ${createdApplicants.length} data pendaftar.`,
            importedCount: createdApplicants.length,
        });
    } catch (error) {
        console.error('Error KRUSIAL di endpoint uploadApplicants:', error);
        if (error.name === 'SequelizeBulkRecordError' && error.errors && error.errors.length > 0 && error.errors[0] && error.errors[0].errors) {
            const firstRecordError = error.errors[0];
            const firstValidationError = firstRecordError.errors[0];
            const specificMessage = `Validasi gagal pada '${firstValidationError.path}': ${firstValidationError.message}. Nilai yang bermasalah: '${firstValidationError.value}'.`;
            return res.status(400).json({ message: specificMessage });
        }
        if (error.name === 'SequelizeValidationError') { 
            return res.status(400).json({ 
                message: "Data tidak valid: " + error.errors.map(e => e.message).join(', '),
                details: error.errors 
            });
        }
        res.status(500).json({ 
            message: 'Terjadi kesalahan pada server saat mengimpor data.', 
            error: error.message || 'Error tidak diketahui (cek log server)' 
        });
    }
};

// Fungsi getAllApplicants (dari kode Anda)
exports.getAllApplicants = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    if (search) {
      const searchNum = parseFloat(search);
      const searchClauses = [
        { nama: { [Op.iLike]: `%${search}%` } },
        { penghasilanOrtu: { [Op.iLike]: `%${search}%` } },
      ];
      if (!isNaN(searchNum)) {
        searchClauses.push({ ipk: searchNum });
        const searchInt = parseInt(search);
        if(!isNaN(searchInt)) searchClauses.push({ jmlTanggungan: searchInt });
      }
      whereClause = { [Op.or]: searchClauses };
    }

    const { count, rows } = await Applicant.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']] // Diubah order by id untuk konsistensi data masuk
    });

    res.status(200).json({
      totalItems: count,
      applicants: rows,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error mengambil data pendaftar (getAllApplicants):', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message || 'Error tidak diketahui' });
  }
};

// Fungsi getApplicantById (dari kode Anda)
exports.getApplicantById = async (req, res) => {
  try {
    const applicantId = req.params.id;
    const applicant = await Applicant.findByPk(applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Data pendaftar tidak ditemukan.' });
    }
    res.status(200).json(applicant);
  } catch (error) {
    console.error('Error mengambil detail pendaftar (getApplicantById):', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message || 'Error tidak diketahui' });
  }
};

// Fungsi updateApplicant (dari kode Anda)
exports.updateApplicant = async (req, res) => {
  try {
    const applicantId = req.params.id;
    const { nama, ipk, penghasilanOrtu, jmlTanggungan, ikutOrganisasi, ikutUKM } = req.body;
    const applicant = await Applicant.findByPk(applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Data pendaftar tidak ditemukan.' });
    }
    if (nama !== undefined) applicant.nama = String(nama).trim();
    if (ipk !== undefined) applicant.ipk = parseFloat(ipk);
    if (penghasilanOrtu !== undefined) applicant.penghasilanOrtu = penghasilanOrtu;
    if (jmlTanggungan !== undefined) applicant.jmlTanggungan = parseInt(jmlTanggungan);
    if (ikutOrganisasi !== undefined) applicant.ikutOrganisasi = ikutOrganisasi;
    if (ikutUKM !== undefined) applicant.ikutUKM = ikutUKM;
    await applicant.save();
    res.status(200).json({ message: 'Data pendaftar berhasil diperbarui.', applicant });
  } catch (error) {
    console.error('Error mengupdate pendaftar (updateApplicant):', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: "Data tidak valid: " + error.errors.map(e => e.message).join(', '), details: error.errors });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message || 'Error tidak diketahui' });
  }
};

// Fungsi deleteApplicant (dari kode Anda)
exports.deleteApplicant = async (req, res) => {
  try {
    const applicantId = req.params.id;
    const applicant = await Applicant.findByPk(applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Data pendaftar tidak ditemukan.' });
    }
    await applicant.destroy();
    res.status(200).json({ message: 'Data pendaftar berhasil dihapus.' });
  } catch (error) {
    console.error('Error menghapus pendaftar (deleteApplicant):', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message || 'Error tidak diketahui' });
  }
};

// Fungsi BARU untuk statistik pendaftar (getApplicantStats)
exports.getApplicantStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()); 
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); 
    const startOfSevenDaysAgo = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());

    const applicantsToday = await Applicant.count({
      where: {
        createdAt: { // Asumsi model Applicant punya createdAt (default Sequelize)
          [Op.gte]: startOfToday 
        }
      }
    });

    const applicantsLast7Days = await Applicant.count({
      where: {
        createdAt: {
          [Op.gte]: startOfSevenDaysAgo 
        }
      }
    });
    
    const totalApplicants = await Applicant.count(); 

    console.log("APPLICANT_CONTROLLER: Mengirim statistik:", { totalApplicants, applicantsToday, applicantsLast7Days });
    res.status(200).json({
      totalApplicants,
      applicantsToday,
      applicantsLast7Days
    });

  } catch (error) {
    console.error('Error fetching applicant stats (applicantController):', error);
    res.status(500).json({ message: 'Gagal mengambil statistik pendaftar.', error: error.message });
  }
};