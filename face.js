/* =====================================================
   REGISTRASI WAJAH
   Sinkron dengan Code.gs pengguna
   Backend action:
       registerface
       face
       getGuru
       getKaryawan
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const MODEL_URL =
    "https://justadudewhohacks.github.io/face-api.js/models";


let cameraStream = null;

let modelsReady = false;

let detectionRunning = false;

let lastDetection = null;

let currentDescriptor = null;

let currentUser = null;

let guruData = [];

let karyawanData = [];

let registeredFaces = [];

let detectionTimer = null;


/* =====================================================
   DOM
===================================================== */

const video =
    document.getElementById("video");

const overlay =
    document.getElementById("overlay");

const overlayCtx =
    overlay.getContext("2d");


/* =====================================================
   INIT
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    bindEvents();

    updateClock();

    setInterval(
        updateClock,
        1000
    );

    await loadModels();

    await loadPeople();

    await loadRegisteredFaces();

}


/* =====================================================
   EVENTS
===================================================== */

function bindEvents() {


    document
        .getElementById("startCamera")
        .addEventListener(
            "click",
            startCamera
        );


    document
        .getElementById("stopCamera")
        .addEventListener(
            "click",
            stopCamera
        );


    document
        .getElementById("detectBtn")
        .addEventListener(
            "click",
            detectFace
        );


    document
        .getElementById("captureBtn")
        .addEventListener(
            "click",
            useDetectedFace
        );


    document
        .getElementById("saveBtn")
        .addEventListener(
            "click",
            saveRegistration
        );


    document
        .getElementById("clearBtn")
        .addEventListener(
            "click",
            resetForm
        );


    document
        .getElementById("refreshBtn")
        .addEventListener(
            "click",
            loadRegisteredFaces
        );


    document
        .getElementById("exportBtn")
        .addEventListener(
            "click",
            exportCSV
        );


    document
        .getElementById("search")
        .addEventListener(
            "input",
            renderTable
        );


    document
        .getElementById("jenis")
        .addEventListener(
            "change",
            changeJenis
        );


    document
        .getElementById("pengguna")
        .addEventListener(
            "change",
            selectUser
        );


    window.addEventListener(
        "beforeunload",
        stopCamera
    );

}


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

    const now =
        new Date();


    document.getElementById(
        "jam"
    ).textContent =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    document.getElementById(
        "tanggal"
    ).textContent =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


/* =====================================================
   NOTICE
===================================================== */

function showNotice(
    message,
    type = "info"
) {

    const el =
        document.getElementById(
            "notice"
        );


    el.textContent =
        message;


    el.className =
        "notice show " +
        type;


    clearTimeout(
        showNotice.timer
    );


    showNotice.timer =
        setTimeout(
            () => {

                el.className =
                    "notice";

            },
            6000
        );

}


/* =====================================================
   MODEL
===================================================== */

async function loadModels() {

    const dot =
        document.getElementById(
            "modelDot"
        );

    const text =
        document.getElementById(
            "modelText"
        );


    try {

        text.textContent =
            "Memuat model face recognition...";


        await Promise.all([

            faceapi.nets.tinyFaceDetector
                .loadFromUri(
                    MODEL_URL
                ),

            faceapi.nets.faceLandmark68Net
                .loadFromUri(
                    MODEL_URL
                ),

            faceapi.nets.faceRecognitionNet
                .loadFromUri(
                    MODEL_URL
                )

        ]);


        modelsReady =
            true;


        dot.className =
            "status-dot ready";


        text.textContent =
            "Model face recognition siap digunakan.";


        document.getElementById(
            "startCamera"
        ).disabled =
            false;


    } catch (error) {

        console.error(
            "MODEL ERROR:",
            error
        );


        modelsReady =
            false;


        dot.className =
            "status-dot error";


        text.textContent =
            "Model gagal dimuat.";


        showNotice(
            "Model face recognition gagal dimuat. Pastikan internet aktif.",
            "error"
        );

    }

}


/* =====================================================
   LOAD GURU + KARYAWAN
===================================================== */

async function loadPeople() {

    try {

        const [
            guruResult,
            karyawanResult
        ] =
        await Promise.all([

            apiGet(
                "guru"
            ),

            apiGet(
                "karyawan"
            )

        ]);


        if (
            !guruResult ||
            guruResult.success !== true
        ) {

            throw new Error(
                guruResult?.message ||
                "Data guru gagal dimuat."
            );

        }


        if (
            !karyawanResult ||
            karyawanResult.success !== true
        ) {

            throw new Error(
                karyawanResult?.message ||
                "Data karyawan gagal dimuat."
            );

        }


        guruData =
            Array.isArray(
                guruResult.data
            )
                ? guruResult.data
                : [];


        karyawanData =
            Array.isArray(
                karyawanResult.data
            )
                ? karyawanResult.data
                : [];


    } catch (error) {

        console.error(
            "LOAD PEOPLE:",
            error
        );


        showNotice(
            "Data Guru/Karyawan gagal dimuat: " +
            error.message,
            "error"
        );

    }

}


/* =====================================================
   CHANGE JENIS
===================================================== */

function changeJenis() {

    const jenis =
        document.getElementById(
            "jenis"
        ).value;


    const select =
        document.getElementById(
            "pengguna"
        );


    select.innerHTML =
        "";


    clearUserFields();


    currentUser =
        null;


    if (!jenis) {

        select.disabled =
            true;


        select.innerHTML =
            `
            <option value="">
                Pilih jenis terlebih dahulu
            </option>
            `;


        updateSaveButton();

        return;

    }


    let data = [];


    if (
        jenis === "GURU"
    ) {

        data =
            guruData;

    }


    if (
        jenis === "KARYAWAN"
    ) {

        data =
            karyawanData;

    }


    select.disabled =
        false;


    select.innerHTML =
        `
        <option value="">
            Pilih pengguna
        </option>
        `;


    data.forEach(
        (person, index) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(index);


            option.textContent =
                `${person.nama || "-"} — ${
                    person.nip || person.id || "-"
                }`;


            select.appendChild(
                option
            );

        }
    );


    if (!data.length) {

        select.innerHTML =
            `
            <option value="">
                Tidak ada data
            </option>
            `;

    }


    updateSaveButton();

}


/* =====================================================
   SELECT USER
===================================================== */

function selectUser() {

    const jenis =
        document.getElementById(
            "jenis"
        ).value;


    const index =
        document.getElementById(
            "pengguna"
        ).value;


    if (
        !jenis ||
        index === ""
    ) {

        currentUser =
            null;


        clearUserFields();

        updateSaveButton();

        return;

    }


    const source =
        jenis === "GURU"
            ? guruData
            : karyawanData;


    currentUser =
        source[
            Number(index)
        ] || null;


    if (!currentUser) {

        clearUserFields();

        updateSaveButton();

        return;

    }


    document.getElementById(
        "id"
    ).value =
        currentUser.id || "";


    document.getElementById(
        "nip"
    ).value =
        currentUser.nip || "";


    document.getElementById(
        "nama"
    ).value =
        currentUser.nama || "";


    document.getElementById(
        "jabatan"
    ).value =
        currentUser.jabatan ||
        currentUser.divisi ||
        "";


    document.getElementById(
        "jabatanLabel"
    ).textContent =
        jenis === "GURU"
            ? "Jabatan"
            : "Divisi";


    updateSaveButton();

}


/* =====================================================
   CLEAR USER
===================================================== */

function clearUserFields() {

    document.getElementById(
        "id"
    ).value =
        "";


    document.getElementById(
        "nip"
    ).value =
        "";


    document.getElementById(
        "nama"
    ).value =
        "";


    document.getElementById(
        "jabatan"
    ).value =
        "";


    document.getElementById(
        "descriptorStatus"
    ).value =
        "Belum terdeteksi";

}


/* =====================================================
   CAMERA START
===================================================== */

async function startCamera() {

    if (!modelsReady) {

        showNotice(
            "Model face recognition belum siap.",
            "warning"
        );

        return;

    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        showNotice(
            "Browser tidak mendukung kamera.",
            "error"
        );

        return;

    }


    try {

        stopCamera(
            false
        );


        cameraStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        facingMode:
                            "user",

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        }

                    },

                    audio:
                        false

                });


        video.srcObject =
            cameraStream;


        await video.play();


        document.getElementById(
            "cameraPlaceholder"
        ).style.display =
            "none";


        document.getElementById(
            "cameraStatus"
        ).textContent =
            "LIVE";


        document.getElementById(
            "cameraState"
        ).textContent =
            "AKTIF";


        document.getElementById(
            "cameraState"
        ).className =
            "badge badge-ok";


        document.getElementById(
            "startCamera"
        ).disabled =
            true;


        document.getElementById(
            "stopCamera"
        ).disabled =
            false;


        document.getElementById(
            "detectBtn"
        ).disabled =
            false;


        resizeOverlay();


        showNotice(
            "Kamera aktif. Pastikan hanya satu wajah terlihat.",
            "success"
        );


    } catch (error) {

        console.error(
            "CAMERA:",
            error
        );


        showNotice(
            "Kamera tidak dapat digunakan. Izinkan akses kamera pada browser.",
            "error"
        );

    }

}


/* =====================================================
   STOP CAMERA
===================================================== */

function stopCamera(
    show = true
) {

    if (detectionTimer) {

        clearTimeout(
            detectionTimer
        );

        detectionTimer =
            null;

    }


    detectionRunning =
        false;


    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        cameraStream =
            null;

    }


    video.srcObject =
        null;


    overlayCtx.clearRect(
        0,
        0,
        overlay.width,
        overlay.height
    );


    document.getElementById(
        "cameraPlaceholder"
    ).style.display =
        "block";


    document.getElementById(
        "cameraStatus"
    ).textContent =
        "OFFLINE";


    document.getElementById(
        "cameraState"
    ).textContent =
        "OFFLINE";


    document.getElementById(
        "cameraState"
    ).className =
        "badge badge-no";


    document.getElementById(
        "startCamera"
    ).disabled =
        !modelsReady;


    document.getElementById(
        "stopCamera"
    ).disabled =
        true;


    document.getElementById(
        "detectBtn"
    ).disabled =
        true;


    document.getElementById(
        "captureBtn"
    ).disabled =
        true;


    lastDetection =
        null;


    if (show) {

        showNotice(
            "Kamera dimatikan.",
            "info"
        );

    }

}


/* =====================================================
   RESIZE OVERLAY
===================================================== */

function resizeOverlay() {

    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        return;

    }


    overlay.width =
        video.videoWidth;


    overlay.height =
        video.videoHeight;

}


/* =====================================================
   DETECT FACE
===================================================== */

async function detectFace() {

    if (!cameraStream) {

        showNotice(
            "Mulai kamera terlebih dahulu.",
            "warning"
        );

        return;

    }


    if (!modelsReady) {

        showNotice(
            "Model belum siap.",
            "warning"
        );

        return;

    }


    if (
        video.readyState <
        2
    ) {

        showNotice(
            "Kamera belum siap.",
            "warning"
        );

        return;

    }


    try {

        resizeOverlay();


        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi
                        .TinyFaceDetectorOptions({
                            inputSize:
                                416,
                            scoreThreshold:
                                0.5
                        })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        overlayCtx.clearRect(
            0,
            0,
            overlay.width,
            overlay.height
        );


        if (!detection) {

            lastDetection =
                null;


            currentDescriptor =
                null;


            document.getElementById(
                "descriptorStatus"
            ).value =
                "Wajah tidak terdeteksi";


            document.getElementById(
                "captureBtn"
            ).disabled =
                true;


            showNotice(
                "Wajah belum terdeteksi. Posisikan wajah di tengah kamera.",
                "warning"
            );


            return;

        }


        lastDetection =
            detection;


        currentDescriptor =
            Array.from(
                detection.descriptor
            );


        const box =
            detection.detection.box;


        overlayCtx.strokeStyle =
            "#22c55e";


        overlayCtx.lineWidth =
            4;


        overlayCtx.strokeRect(
            box.x,
            box.y,
            box.width,
            box.height
        );


        document.getElementById(
            "descriptorStatus"
        ).value =
            `Terdeteksi — ${currentDescriptor.length} angka`;


        document.getElementById(
            "captureBtn"
        ).disabled =
            false;


        showNotice(
            "Wajah berhasil terdeteksi. Klik 'Gunakan Wajah' untuk melanjutkan.",
            "success"
        );


    } catch (error) {

        console.error(
            "DETECT:",
            error
        );


        showNotice(
            "Gagal mendeteksi wajah.",
            "error"
        );

    }

}


/* =====================================================
   USE DETECTED FACE
===================================================== */

function useDetectedFace() {

    if (
        !currentDescriptor ||
        currentDescriptor.length !== 128
    ) {

        showNotice(
            "Descriptor wajah belum tersedia.",
            "warning"
        );

        return;

    }


    document.getElementById(
        "descriptorStatus"
    ).value =
        "Siap disimpan — 128 angka";


    updateSaveButton();


    showNotice(
        "Wajah siap didaftarkan ke sistem.",
        "success"
    );

}


/* =====================================================
   VALIDATE
===================================================== */

function updateSaveButton() {

    const validUser =
        currentUser &&
        currentUser.id;


    const validDescriptor =
        Array.isArray(
            currentDescriptor
        ) &&
        currentDescriptor.length ===
            128;


    document.getElementById(
        "saveBtn"
    ).disabled =
        !(
            validUser &&
            validDescriptor
        );

}


/* =====================================================
   SAVE REGISTRATION
===================================================== */

async function saveRegistration() {

    if (!currentUser) {

        showNotice(
            "Pilih pengguna terlebih dahulu.",
            "warning"
        );

        return;

    }


    if (
        !currentDescriptor ||
        currentDescriptor.length !== 128
    ) {

        showNotice(
            "Descriptor wajah belum valid.",
            "warning"
        );

        return;

    }


    const button =
        document.getElementById(
            "saveBtn"
        );


    button.disabled =
        true;


    button.innerHTML =
        `
        <span class="spinner"></span>
        Menyimpan...
        `;


    try {

        const descriptorText =
            JSON.stringify(
                currentDescriptor
            );


        /*
         * INI YANG SESUAI DENGAN
         * simpanWajahFinal(data)
         * PADA CODE.GS ANDA.
         */

        const payload = {

            id:
                String(
                    currentUser.id ||
                    ""
                ),

            nip:
                String(
                    currentUser.nip ||
                    ""
                ),

            nama:
                String(
                    currentUser.nama ||
                    ""
                ),

            descriptor:
                descriptorText

        };


        const result =
            await apiPost(
                "registerface",
                payload
            );


        console.log(
            "REGISTER FACE RESULT:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Registrasi wajah gagal."
            );

        }


        showNotice(
            result.message ||
            "Wajah berhasil didaftarkan.",
            "success"
        );


        document.getElementById(
            "descriptorStatus"
        ).value =
            "Berhasil tersimpan — 128 angka";


        await loadRegisteredFaces();


        setTimeout(
            resetForm,
            1200
        );


    } catch (error) {

        console.error(
            "SAVE FACE:",
            error
        );


        showNotice(
            "Gagal menyimpan wajah: " +
            error.message,
            "error"
        );


    } finally {

        button.innerHTML =
            "💾 Simpan Registrasi";

        updateSaveButton();

    }

}


/* =====================================================
   LOAD REGISTERED FACES
===================================================== */

async function loadRegisteredFaces() {

    const tbody =
        document.getElementById(
            "faceTable"
        );


    tbody.innerHTML =
        `
        <tr>
            <td
                colspan="7"
                class="empty"
            >
                Memuat data wajah...
            </td>
        </tr>
        `;


    try {

        const result =
            await apiGet(
                "face"
            );


        console.log(
            "REGISTERED FACES:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data wajah."
            );

        }


        registeredFaces =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        renderTable();


    } catch (error) {

        console.error(
            "LOAD FACE:",
            error
        );


        registeredFaces =
            [];


        tbody.innerHTML =
            `
            <tr>
                <td
                    colspan="7"
                    class="empty"
                >
                    Gagal memuat data:
                    ${escapeHtml(
                        error.message
                    )}
                </td>
            </tr>
            `;

    }

}


/* =====================================================
   TABLE
===================================================== */

function renderTable() {

    const tbody =
        document.getElementById(
            "faceTable"
        );


    const keyword =
        document.getElementById(
            "search"
        ).value
            .trim()
            .toLowerCase();


    const filtered =
        registeredFaces.filter(
            item => {

                const text = [

                    item.id,

                    item.nip,

                    item.nama,

                    item.jabatan,

                    item.noHp

                ]
                .join(" ")
                .toLowerCase();


                return text.includes(
                    keyword
                );

            }
        );


    if (!filtered.length) {

        tbody.innerHTML =
            `
            <tr>
                <td
                    colspan="7"
                    class="empty"
                >
                    Belum ada wajah yang terdaftar.
                </td>
            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        filtered
            .map(
                (item, index) => {

                    const descriptorLength =
                        Array.isArray(
                            item.descriptor
                        )
                            ? item.descriptor.length
                            : 0;


                    return `

                    <tr>

                        <td>

                            <div class="face-icon">
                                🧑
                            </div>

                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(
                                    item.nama ||
                                    "-"
                                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHtml(
                                item.nip ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                item.id ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                item.jabatan ||
                                "-"
                            )}

                        </td>


                        <td>

                            <span
                                class="badge badge-ok"
                            >
                                ${descriptorLength}
                                angka
                            </span>

                        </td>


                        <td>

                            ${
                                descriptorLength === 128

                                ?

                                `
                                <span
                                    class="badge badge-ok"
                                >
                                    TERDAFTAR
                                </span>
                                `

                                :

                                `
                                <span
                                    class="badge badge-warn"
                                >
                                    TIDAK VALID
                                </span>
                                `
                            }

                        </td>

                    </tr>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   RESET
===================================================== */

function resetForm() {

    currentUser =
        null;


    currentDescriptor =
        null;


    lastDetection =
        null;


    document.getElementById(
        "jenis"
    ).value =
        "";


    const pengguna =
        document.getElementById(
            "pengguna"
        );


    pengguna.disabled =
        true;


    pengguna.innerHTML =
        `
        <option value="">
            Pilih jenis terlebih dahulu
        </option>
        `;


    clearUserFields();


    document.getElementById(
        "descriptorStatus"
    ).value =
        "Belum terdeteksi";


    overlayCtx.clearRect(
        0,
        0,
        overlay.width,
        overlay.height
    );


    updateSaveButton();

}


/* =====================================================
   EXPORT CSV
===================================================== */

function exportCSV() {

    if (
        !registeredFaces.length
    ) {

        showNotice(
            "Tidak ada data untuk diekspor.",
            "info"
        );

        return;

    }


    const rows = [

        [
            "ID",
            "NIP",
            "Nama",
            "Jabatan",
            "Panjang Descriptor",
            "Status"
        ]

    ];


    registeredFaces.forEach(
        item => {

            const length =
                Array.isArray(
                    item.descriptor
                )
                    ? item.descriptor.length
                    : 0;


            rows.push([

                item.id || "",

                item.nip || "",

                item.nama || "",

                item.jabatan || "",

                length,

                length === 128
                    ? "TERDAFTAR"
                    : "TIDAK VALID"

            ]);

        }
    );


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            csvCell
                        )
                        .join(",")
            )
            .join("\r\n");


    const blob =
        new Blob(
            [
                "\ufeff" +
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "registrasi-wajah.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showNotice(
        "Data berhasil diekspor.",
        "success"
    );

}


/* =====================================================
   HELPERS
===================================================== */

function csvCell(
    value
) {

    return `"${String(
        value ?? ""
    ).replace(
        /"/g,
        '""'
    )}"`;

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
