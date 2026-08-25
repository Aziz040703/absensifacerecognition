"use strict";


/* =========================================================
   ABSENSI FACE RECOGNITION
   ENGINE: face-api.js
   API: api.js
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const FACE_THRESHOLD = 0.55;
// ==========================================
// GPS LOCK ABSENSI
// ==========================================

const GPS_CONFIG = {
    latitude: -6.9932,   // latitude sekolah
    longitude: 110.4316,
    accuracy: 100,          // radius dalam meter
};
// ==========================================
// HITUNG JARAK 2 KOORDINAT GPS
// ==========================================

function hitungJarakGPS(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const rad =
        Math.PI / 180;

    const dLat =
        (lat2 - lat1) * rad;

    const dLon =
        (lon2 - lon1) * rad;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * rad) *
        Math.cos(lat2 * rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}
// ==========================================
// CEK GPS LOCK
// ==========================================

function cekGPSLock() {

    return new Promise(
        function(resolve, reject) {

            if (
                !navigator.geolocation
            ) {

                reject(
                    new Error(
                        "Browser tidak mendukung GPS."
                    )
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(

                function(position) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    const accuracy =
                        position.coords.accuracy;

                    console.log(
                        "=== GPS ABSENSI ==="
                    );

                    console.log(
                        "Latitude:",
                        latitude
                    );

                    console.log(
                        "Longitude:",
                        longitude
                    );

                    console.log(
                        "Akurasi:",
                        accuracy,
                        "meter"
                    );


                    const jarak =
                        hitungJarakGPS(
                            latitude,
                            longitude,
                            GPS_CONFIG.latitude,
                            GPS_CONFIG.longitude
                        );


                    console.log(
                        "Jarak dari sekolah:",
                        jarak,
                        "meter"
                    );


                    if (
                        jarak >
                        GPS_CONFIG.radius
                    ) {

                        reject(
                            new Error(
                                "Anda berada di luar area absensi. Jarak dari sekolah sekitar " +
                                Math.round(jarak) +
                                " meter."
                            )
                        );

                        return;
                    }


                    resolve({

                        latitude:
                            latitude,

                        longitude:
                            longitude,

                        accuracy:
                            accuracy,

                        jarak:
                            jarak

                    });

                },


                function(error) {

                    console.error(
                        "GPS ERROR:",
                        error
                    );


                    let pesan =
                        "Lokasi GPS tidak dapat diperoleh.";


                    if (
                        error.code ===
                        error.PERMISSION_DENIED
                    ) {

                        pesan =
                            "Izin lokasi ditolak. Aktifkan izin lokasi untuk melakukan absensi.";

                    }

                    else if (
                        error.code ===
                        error.POSITION_UNAVAILABLE
                    ) {

                        pesan =
                            "Lokasi GPS tidak tersedia.";

                    }

                    else if (
                        error.code ===
                        error.TIMEOUT
                    ) {

                        pesan =
                            "Pengambilan lokasi GPS timeout. Coba lagi.";

                    }


                    reject(
                        new Error(
                            pesan
                        )
                    );

                },


                {

                    enableHighAccuracy:
                        true,

                    timeout:
                        15000,

                    maximumAge:
                        0
                    
                }

            );

        }
    );
}

const MODEL_URL =
    "https://justadudewhohacks.github.io/face-api.js/models";


/* =========================================================
   STATE
========================================================= */

let streamAbsensi = null;

let faceMatcherAbsensi = null;

let faceUsersAbsensi = [];

let guruTeridentifikasi = null;

let modelsReady = false;

let kameraReady = false;


/* =========================================================
   ELEMENT
========================================================= */

function el(id) {

    return document.getElementById(id);

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(
    message,
    type = "info"
) {

    const target =
        el("statusFace");

    if (!target) return;

    target.className =
        "status " + type;

    target.textContent =
        message;

}


/* =========================================================
   HASIL RESET
========================================================= */

function resetHasil() {

    el("hasilId").textContent =
        "-";

    el("hasilNip").textContent =
        "-";

    el("hasilNama").textContent =
        "-";

    el("hasilJabatan").textContent =
        "-";

    el("hasilStatus").textContent =
        "Belum diidentifikasi";

    el("hasilDistance").textContent =
        "-";

    guruTeridentifikasi =
        null;

    el("btnAbsen").disabled =
        true;

}


/* =========================================================
   LOAD MODEL
========================================================= */

async function loadFaceModels() {

    if (modelsReady) {
        return;
    }

    console.log(
        "=== MEMUAT MODEL FACE API ==="
    );


    setStatus(
        "Memuat model pengenalan wajah...",
        "info"
    );


    await faceapi.nets.tinyFaceDetector.loadFromUri(
        MODEL_URL
    );


    await faceapi.nets.faceLandmark68Net.loadFromUri(
        MODEL_URL
    );


    await faceapi.nets.faceRecognitionNet.loadFromUri(
        MODEL_URL
    );


    modelsReady = true;


    console.log(
        "MODEL FACE API SIAP"
    );


    setStatus(
        "Model wajah siap.",
        "success"
    );

}


/* =========================================================
   AMBIL DATA WAJAH DARI API
========================================================= */

async function siapkanFaceMatcherAbsensi() {

    console.log("=== MENGAMBIL DATA WAJAH ===");

    const result = await apiGet("face");

    console.log("FACE FINAL:", result);

    if (!result || result.success !== true) {
        throw new Error(
            result?.message || "Data wajah gagal diambil."
        );
    }

    if (!Array.isArray(result.data)) {
        throw new Error(
            "Format data wajah tidak valid."
        );
    }

    faceUsersAbsensi = [];

    const labeledDescriptors = [];

    result.data.forEach(function (user) {

        console.log(
            "MEMERIKSA:",
            user
        );

        if (!user.id) {
            console.warn(
                "ID kosong:",
                user
            );
            return;
        }

        /*
         * PENTING:
         * Backend mengirim:
         *
         * user.descriptor
         *
         * BUKAN user.face
         */

        let rawDescriptor =
            user.descriptor;


        if (!rawDescriptor) {

            console.warn(
                "Descriptor kosong:",
                user.id
            );

            return;

        }


        try {

            /*
             * Kalau descriptor datang
             * sebagai string JSON,
             * ubah menjadi array.
             */

            if (
                typeof rawDescriptor ===
                "string"
            ) {

                rawDescriptor =
                    JSON.parse(
                        rawDescriptor
                    );

            }


            /*
             * Pastikan array.
             */

            if (
                !Array.isArray(
                    rawDescriptor
                )
            ) {

                console.warn(
                    "Descriptor bukan array:",
                    user.id,
                    rawDescriptor
                );

                return;

            }


            /*
             * Face-api.js harus
             * menerima 128 angka.
             */

            if (
                rawDescriptor.length !==
                128
            ) {

                console.warn(
                    "Jumlah descriptor tidak 128:",
                    user.id,
                    rawDescriptor.length
                );

                return;

            }


            /*
             * Konversi ke Float32Array.
             */

            const descriptor =
                new Float32Array(
                    rawDescriptor.map(
                        Number
                    )
                );


            /*
             * Cek nilai.
             */

            const invalid =
                Array.from(
                    descriptor
                ).some(
                    function (value) {

                        return !Number.isFinite(
                            value
                        );

                    }
                );


            if (invalid) {

                console.warn(
                    "Descriptor mengandung NaN:",
                    user.id
                );

                return;

            }


            /*
             * Buat label.
             */

            const labeled =
                new faceapi
                    .LabeledFaceDescriptors(
                        String(user.id),
                        [descriptor]
                    );


            labeledDescriptors.push(
                labeled
            );


            /*
             * Simpan data user
             * untuk hasil identifikasi.
             */

            faceUsersAbsensi.push({

                id:
                    String(
                        user.id
                    ),

                nip:
                    user.nip || "",

                nama:
                    user.nama || "",

                jabatan:
                    user.jabatan || "",

                noHp:
                    user.noHp || "",

                descriptor:
                    rawDescriptor

            });


            console.log(
                "✓ DESCRIPTOR VALID:",
                user.id,
                "128 nilai"
            );

        } catch (error) {

            console.error(
                "GAGAL MEMPROSES DESCRIPTOR:",
                user.id,
                error
            );

        }

    });


    console.log(
        "TOTAL DESCRIPTOR VALID:",
        labeledDescriptors.length
    );


    if (
        labeledDescriptors.length ===
        0
    ) {

        throw new Error(
            "Tidak ada descriptor wajah yang valid."
        );

    }


    /*
     * Buat FaceMatcher.
     */

    faceMatcherAbsensi =
        new faceapi.FaceMatcher(
            labeledDescriptors,
            FACE_THRESHOLD
        );


    /*
     * Tampilkan jumlah wajah.
     */

    const jumlah =
        el("jumlahWajah");

    if (jumlah) {

        jumlah.textContent =
            labeledDescriptors.length;

    }


    console.log(
        "================================"
    );

    console.log(
        "FACE MATCHER ABSENSI SIAP"
    );

    console.log(
        "JUMLAH:",
        labeledDescriptors.length
    );

    console.log(
        "================================"
    );


    return true;
}
async function mulaiKameraAbsensi() {

    const video =
        el("videoAbsensi");


    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Browser tidak mendukung akses kamera."
            );

        }


        setStatus(
            "Meminta izin kamera...",
            "info"
        );


        streamAbsensi =
            await navigator
                .mediaDevices
                .getUserMedia({

                    video: {
                        width: {
                            ideal: 640
                        },
                        height: {
                            ideal: 480
                        },
                        facingMode: "user"
                    },

                    audio: false

                });


        video.srcObject =
            streamAbsensi;


        await video.play();


        kameraReady = true;


        el(
            "cameraPlaceholder"
        ).classList.add(
            "hidden"
        );


        el(
            "btnIdentifikasi"
        ).disabled = false;


        setStatus(
            "Kamera aktif. Posisikan wajah di tengah kamera.",
            "success"
        );


        console.log(
            "KAMERA AKTIF"
        );


    } catch (error) {

        console.error(
            "KAMERA ERROR:",
            error
        );


        kameraReady = false;


        setStatus(
            error.message ||
            "Kamera tidak dapat digunakan.",
            "error"
        );

    }

}


/* =========================================================
   STOP KAMERA
========================================================= */

function hentikanKameraAbsensi() {

    if (streamAbsensi) {

        streamAbsensi
            .getTracks()
            .forEach(
                function (track) {
                    track.stop();
                }
            );

    }


    streamAbsensi =
        null;

    kameraReady =
        false;


    const video =
        el("videoAbsensi");


    if (video) {
        video.srcObject =
            null;
    }


    el(
        "cameraPlaceholder"
    ).classList.remove(
        "hidden"
    );


    el(
        "btnIdentifikasi"
    ).disabled = true;


    el(
        "btnAbsen"
    ).disabled = true;


    resetHasil();


    setStatus(
        "Kamera dihentikan.",
        "info"
    );

}


/* =========================================================
   DETEKSI + IDENTIFIKASI
========================================================= */

async function identifikasiWajahAbsensi() {

    const tombol =
        el("btnIdentifikasi");

    try {

        if (!kameraReady) {

            throw new Error(
                "Kamera belum aktif."
            );

        }

        if (!modelsReady) {

            await loadFaceModels();

        }

        if (!faceMatcherAbsensi) {

            await siapkanFaceMatcherAbsensi();

        }

        tombol.disabled = true;

        tombol.textContent =
            "Mendeteksi...";

        setStatus(
            "Sedang mendeteksi wajah...",
            "info"
        );

        resetHasil();


        const video =
            el("videoAbsensi");


        /*
         * DETEKSI WAJAH
         */

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi
                        .TinyFaceDetectorOptions({
                            inputSize: 416,
                            scoreThreshold: 0.5
                        })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if (!detection) {

            setStatus(
                "Wajah belum terdeteksi. Posisikan wajah di tengah kamera.",
                "warning"
            );

            return;

        }


        console.log(
            "✓ WAJAH TERDETEKSI"
        );


        console.log(
            "DESCRIPTOR KAMERA:",
            detection.descriptor
        );


        console.log(
            "PANJANG:",
            detection.descriptor.length
        );


        /*
         * COCOKKAN DENGAN DATA TERDAFTAR
         */

        const bestMatch =
            faceMatcherAbsensi
                .findBestMatch(
                    detection.descriptor
                );


        console.log(
            "HASIL MATCH:",
            bestMatch
        );


        /*
         * JIKA TIDAK DIKENALI
         */

        if (
    bestMatch.label === "unknown" ||
    bestMatch.distance > FACE_THRESHOLD
) {

    guruTeridentifikasi = null;

    el(
        "hasilStatus"
    ).textContent =
        "Wajah tidak dikenali";

    el(
        "hasilDistance"
    ).textContent =
        bestMatch.distance
            .toFixed(4);

    setStatus(
        "Wajah tidak dikenali.",
        "error"
    );

    console.log(
        "WAJAH DITOLAK - DISTANCE:",
        bestMatch.distance
    );

    console.log(
        "FACE THRESHOLD:",
        FACE_THRESHOLD
    );

    return;

}


        /*
         * CARI DATA GURU
         */

        const user =
            faceUsersAbsensi.find(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(
                        bestMatch.label
                    );

                }
            );


        if (!user) {

            throw new Error(
                "Data guru hasil identifikasi tidak ditemukan."
            );

        }


       /*
 * CEK LIVENESS
 */

setStatus(
    "Wajah cocok. Silakan gerakkan kepala sedikit...",
    "info"
);

const liveness =
    await cekLivenessAbsensi();

if (!liveness) {

    guruTeridentifikasi = null;

    el("hasilStatus").textContent =
        "Verifikasi gagal";

    setStatus(
        "Verifikasi wajah gagal. Silakan gerakkan kepala dan coba lagi.",
        "error"
    );

    return;
}


/*
 * SIMPAN USER
 */

guruTeridentifikasi =
    user;


        /*
         * TAMPILKAN HASIL
         */

        el(
            "hasilId"
        ).textContent =
            user.id || "-";


        el(
            "hasilNip"
        ).textContent =
            user.nip || "-";


        el(
            "hasilNama"
        ).textContent =
            user.nama || "-";


        el(
            "hasilJabatan"
        ).textContent =
            user.jabatan || "-";


        el(
            "hasilStatus"
        ).textContent =
            "✓ Wajah dikenali";


        el(
            "hasilDistance"
        ).textContent =
            bestMatch.distance
                .toFixed(4);


        /*
         * AKTIFKAN TOMBOL ABSEN
         */

        el(
            "btnAbsen"
        ).disabled =
            false;


        setStatus(
            "✓ Wajah dikenali: " +
            user.nama,
            "success"
        );


        console.log(
            "================================"
        );

        console.log(
            "IDENTIFIKASI BERHASIL"
        );

        console.log(
            "ID:",
            user.id
        );

        console.log(
            "NIP:",
            user.nip
        );

        console.log(
            "NAMA:",
            user.nama
        );

        console.log(
            "JABATAN:",
            user.jabatan
        );

        console.log(
            "DISTANCE:",
            bestMatch.distance
        );

        console.log(
            "================================"
        );


    } catch (error) {

        console.error(
            "IDENTIFIKASI ERROR:",
            error
        );

        setStatus(
            error.message ||
            "Identifikasi gagal.",
            "error"
        );

    } finally {

        tombol.disabled =
            !kameraReady;

        tombol.textContent =
            "Identifikasi Wajah";

    }
}
async function cekLivenessAbsensi() {

    const video = el("videoAbsensi");

    if (!video || video.readyState < 2) {
        return false;
    }

    let posisiAwal = null;
    let bergerak = false;

    const waktuMulai = Date.now();

    while (Date.now() - waktuMulai < 3000) {

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.5
                    })
                )
                .withFaceLandmarks();

        if (!detection) {
            await new Promise(resolve =>
                setTimeout(resolve, 150)
            );
            continue;
        }

        const landmarks =
            detection.landmarks;

        const hidung =
            landmarks.getNose();

        if (!hidung || !hidung.length) {
            continue;
        }

        const titikHidung =
            hidung[0];

        if (!posisiAwal) {

            posisiAwal = {
                x: titikHidung.x,
                y: titikHidung.y
            };

        } else {

            const jarak =
                Math.sqrt(
                    Math.pow(
                        titikHidung.x -
                        posisiAwal.x,
                        2
                    ) +
                    Math.pow(
                        titikHidung.y -
                        posisiAwal.y,
                        2
                    )
                );

            if (jarak > 8) {
                bergerak = true;
                break;
            }
        }

        await new Promise(resolve =>
            setTimeout(resolve, 150)
        );
    }

    return bergerak;
}
async function prosesAbsensi() {

    if (!guruTeridentifikasi) {

        setStatus(
            "Silakan identifikasi wajah terlebih dahulu.",
            "warning"
        );

        return;
    }


    const tombol =
        el("btnAbsen");


    try {

        tombol.disabled = true;

        tombol.textContent =
            "Menyimpan...";

        // ==========================================
// CEK GPS LOCK
// ==========================================

setStatus(
    "Memeriksa lokasi GPS...",
    "info"
);

const lokasiGPS =
    await cekGPSLock();


console.log(
    "=== GPS VALID ==="
);

console.log(
    lokasiGPS
);
const dataAbsensi = {

    id:
        guruTeridentifikasi.id,

    nip:
        guruTeridentifikasi.nip,

    nama:
        guruTeridentifikasi.nama,

    jabatan:
        guruTeridentifikasi.jabatan || "",

    waktu:
        new Date().toISOString(),

    latitude:
        lokasiGPS.latitude,

    longitude:
        lokasiGPS.longitude,

    accuracy:
        lokasiGPS.accuracy,

    jarak:
        lokasiGPS.jarak

};
const result = 
    await apiPost(
        "absensi",
        dataAbsensi
    );


        console.log(
            "=== DATA ABSENSI ==="
        );

        console.log(
            dataAbsensi
        );


        /*
         * PENTING:
         * action dikirim sebagai argumen pertama.
         *
         * BUKAN:
         * apiPost(dataAbsensi)
         *
         * Tetapi:
         * apiPost("simpanAbsensi", dataAbsensi)
         */


        console.log(
            "=== HASIL SIMPAN ==="
        );

        console.log(
            result
        );


        if (
            result &&
            result.success === true
        ) {

            el(
                "hasilStatus"
            ).textContent =
                "✓ Absensi berhasil dicatat";


            setStatus(
                result.message ||
                "Absensi berhasil dicatat.",
                "success"
            );


            tampilkanHasilPesan(
                result.message ||
                "Absensi berhasil dicatat."
            );


        } else {

            throw new Error(
                result?.message ||
                "Absensi gagal disimpan."
            );

        }


    } catch (error) {

        console.error(
            "SIMPAN ABSENSI ERROR:",
            error
        );


        setStatus(
            error.message ||
            "Gagal menyimpan absensi.",
            "error"
        );


    } finally {

        tombol.disabled = false;

        tombol.textContent =
            "Simpan Absensi";

    }

}
function tampilkanHasilPesan(
    message
) {

    const result =
        el("hasilAbsensi");


    if (!result) return;


    const old =
        result.querySelector(
            ".save-message"
        );


    if (old) {
        old.remove();
    }


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "save-message";

    div.style.padding =
        "13px 16px";

    div.style.background =
        "#ecfdf5";

    div.style.color =
        "#047857";

    div.style.fontWeight =
        "600";

    div.textContent =
        message;


    result.appendChild(
        div
    );

}


/* =========================================================
   INIT
========================================================= */

async function initAbsensi() {

    console.log(
        "================================"
    );

    console.log(
        "ABSENSI SYSTEM START"
    );

    console.log(
        "================================"
    );


    resetHasil();


    try {

        await loadFaceModels();

    } catch (error) {

        console.error(
            "MODEL ERROR:",
            error
        );


        setStatus(
            "Model Face Recognition gagal dimuat.",
            "error"
        );


        return;

    }


    try {

        await siapkanFaceMatcherAbsensi();

    } catch (error) {

        console.error(
            "FACE DATA ERROR:",
            error
        );


        setStatus(
            "Data wajah gagal dimuat: " +
            error.message,
            "warning"
        );

    }


    console.log(
        "ABSENSI SYSTEM READY"
    );

}


/* =========================================================
   EVENT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        el(
            "btnKamera"
        ).addEventListener(
            "click",
            mulaiKameraAbsensi
        );


        el(
            "btnIdentifikasi"
        ).addEventListener(
            "click",
            identifikasiWajahAbsensi
        );


        el(
            "btnAbsen"
        ).addEventListener(
            "click",
            prosesAbsensi
        );


        initAbsensi();

    }
);


/* =========================================================
   GLOBAL FUNCTION
   Supaya aman dipanggil dari Console
========================================================= */

window.mulaiKameraAbsensi =
    mulaiKameraAbsensi;


window.hentikanKameraAbsensi =
    hentikanKameraAbsensi;


window.siapkanFaceMatcherAbsensi =
    siapkanFaceMatcherAbsensi;


window.identifikasiWajahAbsensi =
    identifikasiWajahAbsensi;

window.siapkanFaceMatcherAbsensi =
    siapkanFaceMatcherAbsensi;

window.prosesAbsensi =
    prosesAbsensi;


window.initAbsensi =
    initAbsensi;

function tampilkanHasilAbsensi(hasil) {

    const box =
        document.getElementById("hasilAbsensi");

    if (!box) return;

    if (!hasil || !hasil.success) {

        box.innerHTML = `
            <div class="absensi-error">
                ❌ ${hasil?.message || "Absensi gagal"}
            </div>
        `;

        return;
    }

    const item =
        hasil.data &&
        hasil.data.length
            ? hasil.data[0]
            : {};

    const status =
        item.status || "";

    const waktu =
        item.waktu
            ? new Date(item.waktu)
            : new Date();

    const waktuFormat =
        waktu.toLocaleString("id-ID", {
            dateStyle: "full",
            timeStyle: "medium"
        });

    box.innerHTML = `
        <div class="absensi-success">

            <div class="status-absensi">
                ✅ ABSEN ${status}
            </div>

            <div class="nama-absensi">
                ${item.nama || "-"}
            </div>

            <div class="detail-absensi">
                NIP: ${item.nip || "-"}
            </div>

            <div class="detail-absensi">
                Jabatan: ${item.jabatan || "-"}
            </div>

            <div class="waktu-absensi">
                ${waktuFormat}
            </div>

        </div>
    `;
}
