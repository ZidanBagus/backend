// controllers/selectionController.js
const db = require('../models');
const Applicant = db.Applicant;
const SelectionResult = db.SelectionResult;
const { Sequelize } = require('sequelize'); // Di-uncomment jika perlu untuk query kompleks

/**
 * Helper function untuk membuat alasan keputusan yang lebih manusiawi.
 * @param {string[]} path - Array berisi jejak aturan.
 * @param {string} status - Keputusan akhir ('Direkomendasikan' atau 'Tidak Direkomendasikan').
 * @returns {{status: string, reason: string}}
 */
const makeDecision = (path, status) => {
    // Mapping aturan ke narasi manusiawi
    const narasi = [];
    path.forEach(p => {
        if (p === "Tidak Ikut UKM") narasi.push("Anda tidak mengikuti UKM.");
        else if (p === "Ikut UKM") narasi.push("Anda mengikuti UKM.");
        else if (p === "IPK <= 2.75") narasi.push("IPK Anda kurang dari atau sama dengan 2.75.");
        else if (p === "IPK > 2.75") narasi.push("IPK Anda lebih dari 2.75.");
        else if (p === "IPK > 3.82") narasi.push("IPK Anda sangat tinggi (di atas 3.82).");
        else if (p === "Tidak Ikut Organisasi") narasi.push("Anda tidak mengikuti organisasi.");
        else if (p === "Ikut Organisasi & Tanggungan <= 3") narasi.push("Anda mengikuti organisasi dan tanggungan keluarga Anda 3 atau kurang.");
        else if (p === "Ikut Organisasi & Tanggungan > 3") narasi.push("Anda mengikuti organisasi dan tanggungan keluarga Anda lebih dari 3.");
        else if (p === "Tanggungan > 4") narasi.push("Jumlah tanggungan keluarga Anda lebih dari 4.");
        else if (p === "Tanggungan 3-4") narasi.push("Jumlah tanggungan keluarga Anda antara 3 sampai 4.");
        else if (p === "Tanggungan <= 2") narasi.push("Jumlah tanggungan keluarga Anda 2 atau kurang.");
        else if (p === "Ikut Organisasi") narasi.push("Anda mengikuti organisasi.");
        else if (p === "IPK > 3.72") narasi.push("IPK Anda lebih dari 3.72.");
        else if (p === "IPK (3.40-3.72]") narasi.push("IPK Anda antara 3.40 sampai 3.72.");
        else if (p === "IPK (3.155-3.40]") narasi.push("IPK Anda antara 3.155 sampai 3.40.");
        else if (p === "IPK (3.12-3.155]") narasi.push("IPK Anda antara 3.12 sampai 3.155.");
        else if (p === "IPK <= 3.12") narasi.push("IPK Anda kurang dari atau sama dengan 3.12.");
        else if (p === "IPK <= 3.72") narasi.push("IPK Anda kurang dari atau sama dengan 3.72.");
        else if (p.startsWith("Penghasilan")) narasi.push(`Penghasilan orang tua Anda ${p.replace("Penghasilan '", "").replace("'", "")}.`);
        else if (p === "IPK > 3.13") narasi.push("IPK Anda lebih dari 3.13.");
        else if (p === "IPK <= 3.05") narasi.push("IPK Anda kurang dari atau sama dengan 3.05.");
        else if (p === "IPK > 3.69") narasi.push("IPK Anda lebih dari 3.69.");
        else if (p === "IPK (3.31-3.69]") narasi.push("IPK Anda antara 3.31 sampai 3.69.");
        else if (p === "IPK > 3.66") narasi.push("IPK Anda lebih dari 3.66.");
        else if (p === "IPK <= 3.35") narasi.push("IPK Anda kurang dari atau sama dengan 3.35.");
        else if (p === "IPK > 3.74") narasi.push("IPK Anda lebih dari 3.74.");
        else if (p === "IPK <= 3.74") narasi.push("IPK Anda kurang dari atau sama dengan 3.74.");
        else if (p === "Tanggungan > 1") narasi.push("Jumlah tanggungan keluarga Anda lebih dari 1.");
        else if (p === "IPK > 3.77") narasi.push("IPK Anda lebih dari 3.77.");
        // Tambahkan mapping lain sesuai kebutuhan
        else narasi.push(p);
    });

    // Gabungkan narasi menjadi satu kalimat
    const reason = narasi.join(' ');
    return { status, reason };
};


/**
 * Menerapkan aturan pohon keputusan C4.5 dari skripsi untuk menentukan status kelulusan.
 * @param {object} applicant - Objek berisi data pendaftar yang sudah diparsing.
 * @returns {object} - Objek berisi { status, reason }.
 */
const applyC45Rules = (applicant) => {
    const ipk = parseFloat(applicant.ipk);
    const penghasilan = String(applicant.penghasilanOrtu).trim();
    const tanggungan = parseInt(applicant.jmlTanggungan);
    const ikutOrganisasi = applicant.ikutOrganisasi === 'Ya';
    const ikutUKM = applicant.ikutUKM === 'Ya';

    let reasonParts = []; // Array untuk membangun string alasan keputusan

    // Aturan 1, 5, 6: Jika mahasiswa TIDAK IKUT UKM
    if (!ikutUKM) {
        reasonParts.push("Tidak Ikut UKM");
        // Aturan 6: IPK <= 2.75
        if (ipk <= 2.75) {
            reasonParts.push("IPK <= 2.75");
            return makeDecision(reasonParts, 'Tidak Direkomendasikan');
        } 
        // Aturan 5: IPK > 2.75
        else { // ipk > 2.75
            reasonParts.push("IPK > 2.75");
            // Aturan 5.a: IPK > 3.82
            if (ipk > 3.82) {
                reasonParts.push("IPK > 3.82");
                // Asumsi 3.50 di aturan Anda adalah 3 tanggungan
                if (!ikutOrganisasi || (ikutOrganisasi && tanggungan <= 3)) {
                    if (!ikutOrganisasi) reasonParts.push("Tidak Ikut Organisasi");
                    else reasonParts.push("Ikut Organisasi & Tanggungan <= 3");
                    return makeDecision(reasonParts, 'Direkomendasikan');
                } else { // ikutOrganisasi && tanggungan > 3
                    reasonParts.push("Ikut Organisasi & Tanggungan > 3");
                    return makeDecision(reasonParts, 'Tidak Direkomendasikan');
                }
            } 
            // Aturan 5.b: 2.75 < IPK <= 3.82
            else { 
                return makeDecision(reasonParts, 'Tidak Direkomendasikan');
            }
        }
    } 
    // Jika lolos, berarti mahasiswa IKUT UKM (Aturan 2, 3, 4)
    else { 
        reasonParts.push("Ikut UKM");
        
        // Aturan 2: Tanggungan > 4
        if (tanggungan > 4) {
            reasonParts.push("Tanggungan > 4");
            if (ikutOrganisasi) {
                reasonParts.push("Ikut Organisasi");
                if (ipk > 3.72) { // Aturan 2.a
                    reasonParts.push("IPK > 3.72");
                    return makeDecision(reasonParts, 'Direkomendasikan');
                } else if (ipk > 3.40 && ipk <= 3.72) { // Aturan 2.b
                    reasonParts.push("IPK (3.40-3.72]");
                    return makeDecision(reasonParts, 'Direkomendasikan');
                } else if (ipk > 3.155 && ipk <= 3.40) { // Aturan 2.c, bagian utama
                    reasonParts.push("IPK (3.155-3.40]");
                    return makeDecision(reasonParts, 'Direkomendasikan');
                } else if (ipk > 3.12 && ipk <= 3.155) { // Aturan 2.c, pengecualian
                    reasonParts.push("IPK (3.12-3.155]");
                    return makeDecision(reasonParts, 'Tidak Direkomendasikan');
                } else if (ipk <= 3.12) { // Aturan 2.d
                    reasonParts.push("IPK <= 3.12");
                    return makeDecision(reasonParts, 'Direkomendasikan');
                }
            } else { // Tidak Ikut Organisasi
                reasonParts.push("Tidak Ikut Organisasi");
                if (ipk <= 3.72) { // Aturan 2.e
                    reasonParts.push("IPK <= 3.72");
                    if (penghasilan === 'Rendah' || penghasilan === 'Sedang') {
                        reasonParts.push(`Penghasilan '${penghasilan}'`);
                        return makeDecision(reasonParts, 'Direkomendasikan');
                    } else if (penghasilan === 'Tinggi') {
                        reasonParts.push("Penghasilan 'Tinggi'");
                        if (ipk > 3.13) {
                            reasonParts.push("IPK > 3.13");
                            return makeDecision(reasonParts, 'Tidak Direkomendasikan');
                        }
                    }
                }
            }
            if (ipk <= 3.05) { // Aturan 2.f (override)
                reasonParts.push("IPK <= 3.05");
                return makeDecision(reasonParts, 'Tidak Direkomendasikan');
            }
        }
        // Aturan 3: Tanggungan antara 3 dan 4 (inklusif)
        else if (tanggungan >= 3 && tanggungan <= 4) {
            reasonParts.push("Tanggungan 3-4");
            if (ikutOrganisasi) { // Aturan 3.a
                reasonParts.push("Ikut Organisasi");
                return makeDecision(reasonParts, 'Tidak Direkomendasikan');
            } else { // Tidak Ikut Organisasi
                reasonParts.push("Tidak Ikut Organisasi");
                if (ipk > 3.69) { // Aturan 3.b
                    reasonParts.push("IPK > 3.69");
                    return makeDecision(reasonParts, 'Direkomendasikan');
                } else if (ipk > 3.31 && ipk <= 3.69) { // Aturan 3.c
                    reasonParts.push("IPK (3.31-3.69]");
                    if (ipk > 3.66 || ipk <= 3.35) {
                        return makeDecision(reasonParts, 'Direkomendasikan');
                    } else { // antara 3.35 dan 3.66
                        return makeDecision(reasonParts, 'Tidak Direkomendasikan');
                    }
                }
            }
        }
        // Aturan 4: Tanggungan <= 3 (saya ubah jadi <= 2 agar tidak tumpang tindih dengan aturan 3)
        // Jika aturan Anda "kurang dari atau sama dengan 3.500" mencakup 3, maka aturan 3 seharusnya "hanya 4".
        // Mari kita asumsikan aturan 3 untuk 3 & 4. Jadi aturan ini untuk <= 2.
        else if (tanggungan <= 2) {
            reasonParts.push("Tanggungan <= 2");
            if (ipk > 3.74) { // Aturan 4.a
                reasonParts.push("IPK > 3.74");
                if (penghasilan === 'Tinggi') {
                    reasonParts.push("Penghasilan 'Tinggi'");
                    return makeDecision(reasonParts, 'Tidak Direkomendasikan');
                } else if (penghasilan === 'Sedang') {
                    reasonParts.push("Penghasilan 'Sedang'");
                    if (tanggungan > 1) { // Asumsi "> 1.500" adalah > 1
                        reasonParts.push("Tanggungan > 1");
                        if (ipk > 3.77) { // Pengecualian
                            reasonParts.push("IPK > 3.77");
                            return makeDecision(reasonParts, 'Tidak Direkomendasikan');
                        }
                    }
                }
                // Jika Penghasilan Rendah, atau Sedang dengan kondisi terpenuhi
                return makeDecision(reasonParts, 'Direkomendasikan');
            } else { // Aturan 4.b: IPK <= 3.74
                reasonParts.push("IPK <= 3.74");
                if (ikutOrganisasi) { // Aturan 4.b.1 dan 4.b.2 digabung
                    reasonParts.push("Ikut Organisasi");
                    return makeDecision(reasonParts, 'Tidak Direkomendasikan');
                } else { // Aturan 4.b.3: tidak ikut organisasi
                    reasonParts.push("Tidak Ikut Organisasi");
                    // Aturan 4.b.3 sangat kontradiktif: "(2.99, 3.71) ... TERIMA jika (3.71, 3.73)". Ini tidak mungkin.
                    // Saya akan abaikan bagian ini dan biarkan jatuh ke default 'Tidak Direkomendasikan'
                    // jika tidak ada aturan lain yang lebih spesifik.
                }
            }
        }
    }

    // Default jika tidak ada aturan yang cocok sama sekali
    return makeDecision(reasonParts, 'Tidak Direkomendasikan');
};


exports.startSelectionProcess = async (req, res) => {
    const transaction = await db.sequelize.transaction(); 
    try {
        console.log("Memulai proses seleksi backend (startSelectionProcess)...");

        // Menghapus hasil seleksi sebelumnya
        await SelectionResult.destroy({ where: {}, truncate: false, transaction });
        console.log("Data hasil seleksi sebelumnya telah dihapus.");

        const allApplicants = await Applicant.findAll({ transaction });
        if (allApplicants.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Tidak ada data pendaftar untuk diproses.' });
        }
        console.log(`Ditemukan ${allApplicants.length} pendaftar untuk diproses.`);

        const selectionDate = new Date();
        const resultsToSave = [];

        for (const applicant of allApplicants) {
            // Pastikan data yang dikirim ke rules sudah dalam format yang benar
            const applicantDataForRules = {
                ...applicant.toJSON(), // Konversi instance Sequelize ke objek biasa
                ipk: parseFloat(applicant.ipk),
                jmlTanggungan: parseInt(applicant.jmlTanggungan)
            };
            // Ambil status dan reason dari fungsi C4.5
            const { status, reason } = applyC45Rules(applicantDataForRules); 
            
            resultsToSave.push({
                applicantId: applicant.id,
                namaPendaftar: applicant.nama,
                ipk: applicant.ipk,
                penghasilanOrtu: applicant.penghasilanOrtu,
                jmlTanggungan: applicant.jmlTanggungan,
                ikutOrganisasi: applicant.ikutOrganisasi,
                ikutUKM: applicant.ikutUKM,
                statusKelulusan: status,
                alasanKeputusan: reason, // Simpan alasan keputusan
                tanggalSeleksi: selectionDate
            });
        }

        if (resultsToSave.length > 0) {
            await SelectionResult.bulkCreate(resultsToSave, { transaction });
            console.log(`${resultsToSave.length} hasil seleksi berhasil disimpan ke database.`);
        }

        await transaction.commit(); 

        const recommendedCount = resultsToSave.filter(r => r.statusKelulusan === 'Direkomendasikan').length;
        const notRecommendedCount = resultsToSave.length - recommendedCount;

        res.status(200).json({
            message: 'Proses seleksi berhasil diselesaikan dengan sukses.',
            totalProcessed: resultsToSave.length,
            recommended: recommendedCount,
            notRecommended: notRecommendedCount
        });

    } catch (error) {
        if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') { 
             await transaction.rollback(); 
        }
        console.error('Error KRUSIAL selama proses seleksi:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat proses seleksi.', error: error.message || 'Error tidak diketahui' });
    }
};