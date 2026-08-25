/* =========================================================
   SETTINGS.JS
   SISTEM ABSENSI SMK TEUKU UMAR SEMARANG
   FINAL VERSION
========================================================= */

"use strict";


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const SETTINGS_DEFAULT = {
    jamMasuk: "07:00",
    batasTerlambat: "07:15",
    batasMasuk: "09:00",

    toleransi: 15,

    jamPulang: "15:00",
    batasPulang: "17:00",

    hariKerja: {
        senin: true,
        selasa: true,
        rabu: true,
        kamis: true,
        jumat: true,
        sabtu: false,
        minggu: false
    },

    sistemAktif: true,
    autoLock: true,
    statusTerlambat: true
};


/* =========================================================
   KONFIGURASI
========================================================= */

const DAY_NAMES = [
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
    "minggu"
];

let isBusy = false;


/* =========================================================
   HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function safeString(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value);
}


function cloneDefaultSettings() {
    return {
        jamMasuk:
            SETTINGS_DEFAULT.jamMasuk,

        batasTerlambat:
            SETTINGS_DEFAULT.batasTerlambat,

        batasMasuk:
            SETTINGS_DEFAULT.batasMasuk,

        toleransi:
            SETTINGS_DEFAULT.toleransi,

        jamPulang:
            SETTINGS_DEFAULT.jamPulang,

        batasPulang:
            SETTINGS_DEFAULT.batasPulang,

        hariKerja: {
            ...SETTINGS_DEFAULT.hariKerja
        },

        sistemAktif:
            SETTINGS_DEFAULT.sistemAktif,

        autoLock:
            SETTINGS_DEFAULT.autoLock,

        statusTerlambat:
            SETTINGS_DEFAULT.statusTerlambat
    };
}


/* =========================================================
   TOAST / NOTIFICATION
========================================================= */

function showNotification(
    message,
    type = "success"
) {

    let container =
        $("settingsToastContainer");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "settingsToastContainer";

        container.style.position =
            "fixed";

        container.style.top =
            "24px";

        container.style.right =
            "24px";

        container.style.zIndex =
            "99999";

        container.style.display =
            "flex";

        container.style.flexDirection =
            "column";

        container.style.gap =
            "10px";

        container.style.maxWidth =
            "420px";

        document.body.appendChild(
            container
        );
    }


    const toast =
        document.createElement("div");


    toast.textContent =
        message;


    toast.style.padding =
        "14px 18px";

    toast.style.borderRadius =
        "12px";

    toast.style.fontSize =
        "14px";

    toast.style.fontWeight =
        "600";

    toast.style.color =
        "#ffffff";

    toast.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.18)";

    toast.style.background =
        type === "error"
            ? "#dc2626"
            : type === "warning"
                ? "#d97706"
                : "#16a34a";

    toast.style.opacity =
        "0";

    toast.style.transform =
        "translateY(-10px)";

    toast.style.transition =
        "all .25s ease";


    container.appendChild(
        toast
    );


    requestAnimationFrame(
        function() {

            toast.style.opacity =
                "1";

            toast.style.transform =
                "translateY(0)";

        }
    );


    setTimeout(
        function() {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(-10px)";


            setTimeout(
                function() {

                    toast.remove();

                },
                300
            );

        },
        3500
    );
}


/* =========================================================
   LOADING
========================================================= */

function setLoading(
    status,
    message = "Memproses..."
) {

    isBusy =
        Boolean(status);


    const loading =
        $("loading");


    const loadingText =
        $("loadingText");


    if (loadingText) {

        loadingText.textContent =
            message;

    }


    if (loading) {

        loading.classList.toggle(
            "show",
            Boolean(status)
        );

        loading.style.display =
            status
                ? ""
                : "";

    }


    /*
     * Nonaktifkan tombol sementara
     */

    const buttons =
        document.querySelectorAll(
            "button[data-settings-action], #btnSave, #btnReset, #btnRefresh"
        );


    buttons.forEach(
        function(button) {

            button.disabled =
                Boolean(status);

        }
    );

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now =
        new Date();


    const jam =
        $("jam");


    const tanggal =
        $("tanggal");


    if (jam) {

        jam.textContent =
            now.toLocaleTimeString(
                "id-ID",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );

    }


    if (tanggal) {

        tanggal.textContent =
            now.toLocaleDateString(
                "id-ID",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

    }

}


setInterval(
    updateClock,
    1000
);


/* =========================================================
   NORMALISASI DATA BACKEND
========================================================= */

function normalizeSettings(
    response
) {

    let source =
        response;


    /*
     * Backend Anda:
     *
     * {
     *   success: true,
     *   data: {...}
     * }
     */

    if (
        response &&
        typeof response === "object" &&
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
    ) {

        source =
            response.data;

    }


    if (
        !source ||
        typeof source !== "object"
    ) {

        source =
            {};

    }


    const defaults =
        cloneDefaultSettings();


    let hari =
        source.hariKerja;


    /*
     * Antisipasi apabila hariKerja
     * masih berupa JSON string.
     */

    if (
        typeof hari === "string"
    ) {

        try {

            hari =
                JSON.parse(hari);

        } catch (error) {

            hari =
                {};

        }

    }


    if (
        !hari ||
        typeof hari !== "object"
    ) {

        hari =
            {};

    }


    return {

        jamMasuk:
            safeString(
                source.jamMasuk ??
                defaults.jamMasuk
            ),

        batasTerlambat:
            safeString(
                source.batasTerlambat ??
                defaults.batasTerlambat
            ),

        batasMasuk:
            safeString(
                source.batasMasuk ??
                defaults.batasMasuk
            ),

        toleransi:
            Number.isFinite(
                Number(
                    source.toleransi
                )
            )
                ? Number(
                    source.toleransi
                )
                : defaults.toleransi,

        jamPulang:
            safeString(
                source.jamPulang ??
                defaults.jamPulang
            ),

        batasPulang:
            safeString(
                source.batasPulang ??
                defaults.batasPulang
            ),

        hariKerja: {

            senin:
                Boolean(
                    hari.senin ??
                    defaults.hariKerja.senin
                ),

            selasa:
                Boolean(
                    hari.selasa ??
                    defaults.hariKerja.selasa
                ),

            rabu:
                Boolean(
                    hari.rabu ??
                    defaults.hariKerja.rabu
                ),

            kamis:
                Boolean(
                    hari.kamis ??
                    defaults.hariKerja.kamis
                ),

            jumat:
                Boolean(
                    hari.jumat ??
                    defaults.hariKerja.jumat
                ),

            sabtu:
                Boolean(
                    hari.sabtu ??
                    defaults.hariKerja.sabtu
                ),

            minggu:
                Boolean(
                    hari.minggu ??
                    defaults.hariKerja.minggu
                )

        },

        sistemAktif:
            parseBoolean(
                source.sistemAktif,
                defaults.sistemAktif
            ),

        autoLock:
            parseBoolean(
                source.autoLock,
                defaults.autoLock
            ),

        statusTerlambat:
            parseBoolean(
                source.statusTerlambat,
                defaults.statusTerlambat
            )

    };

}


/* =========================================================
   BOOLEAN PARSER
========================================================= */

function parseBoolean(
    value,
    fallback = false
) {

    if (
        value === true ||
        value === false
    ) {

        return value;

    }


    if (
        typeof value === "string"
    ) {

        const normalized =
            value
                .trim()
                .toLowerCase();


        if (
            normalized === "true" ||
            normalized === "1" ||
            normalized === "yes" ||
            normalized === "aktif"
        ) {

            return true;

        }


        if (
            normalized === "false" ||
            normalized === "0" ||
            normalized === "no" ||
            normalized === "nonaktif"
        ) {

            return false;

        }

    }


    if (
        typeof value === "number"
    ) {

        return value !== 0;

    }


    return fallback;

}


/* =========================================================
   APPLY SETTINGS KE HTML
========================================================= */

function applySettings(
    response
) {

    const settings =
        normalizeSettings(
            response
        );


    /*
     * JAM
     */

    setValue(
        "jamMasuk",
        settings.jamMasuk
    );


    setValue(
        "batasTerlambat",
        settings.batasTerlambat
    );


    setValue(
        "batasMasuk",
        settings.batasMasuk
    );


    setValue(
        "toleransi",
        settings.toleransi
    );


    setValue(
        "jamPulang",
        settings.jamPulang
    );


    setValue(
        "batasPulang",
        settings.batasPulang
    );


    /*
     * HARI KERJA
     */

    DAY_NAMES.forEach(
        function(day) {

            const checkbox =
                $(day);


            if (!checkbox) {
                return;
            }


            checkbox.checked =
                Boolean(
                    settings.hariKerja[day]
                );

        }
    );


    /*
     * SWITCH SISTEM
     */

    setChecked(
        "sistemAktif",
        settings.sistemAktif
    );


    setChecked(
        "autoLock",
        settings.autoLock
    );


    setChecked(
        "statusTerlambat",
        settings.statusTerlambat
    );


    updateDayUI();

    updateSystemStatus();

}


/* =========================================================
   SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        $(id);


    if (!element) {
        return;
    }


    element.value =
        value;

}


/* =========================================================
   SET CHECKED
========================================================= */

function setChecked(
    id,
    value
) {

    const element =
        $(id);


    if (!element) {
        return;
    }


    element.checked =
        Boolean(value);

}


/* =========================================================
   AMBIL DATA FORM
========================================================= */

function getFormData() {

    const hariKerja =
        {};


    DAY_NAMES.forEach(
        function(day) {

            const checkbox =
                $(day);


            hariKerja[day] =
                checkbox
                    ? Boolean(
                        checkbox.checked
                    )
                    : false;

        }
    );


    return {

        jamMasuk:
            getValue(
                "jamMasuk"
            ),

        batasTerlambat:
            getValue(
                "batasTerlambat"
            ),

        batasMasuk:
            getValue(
                "batasMasuk"
            ),

        toleransi:
            Number(
                getValue(
                    "toleransi"
                ) || 0
            ),

        jamPulang:
            getValue(
                "jamPulang"
            ),

        batasPulang:
            getValue(
                "batasPulang"
            ),

        hariKerja:
            hariKerja,

        sistemAktif:
            getChecked(
                "sistemAktif",
                true
            ),

        autoLock:
            getChecked(
                "autoLock",
                true
            ),

        statusTerlambat:
            getChecked(
                "statusTerlambat",
                true
            )

    };

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(
    id
) {

    const element =
        $(id);


    if (!element) {
        return "";
    }


    return safeString(
        element.value
    ).trim();

}


/* =========================================================
   GET CHECKED
========================================================= */

function getChecked(
    id,
    fallback = false
) {

    const element =
        $(id);


    if (!element) {
        return fallback;
    }


    return Boolean(
        element.checked
    );

}


/* =========================================================
   VALIDASI
========================================================= */

function validateSettings(
    data
) {

    if (!data.jamMasuk) {

        return "Jam masuk wajib diisi.";

    }


    if (!data.batasTerlambat) {

        return "Batas terlambat wajib diisi.";

    }


    if (!data.batasMasuk) {

        return "Batas masuk wajib diisi.";

    }


    if (!data.jamPulang) {

        return "Jam pulang wajib diisi.";

    }


    if (!data.batasPulang) {

        return "Batas pulang wajib diisi.";

    }


    if (
        !Number.isFinite(
            data.toleransi
        )
    ) {

        return "Toleransi harus berupa angka.";

    }


    if (
        data.toleransi < 0 ||
        data.toleransi > 120
    ) {

        return "Toleransi harus antara 0 sampai 120 menit.";

    }


    const minimalHari =
        Object.values(
            data.hariKerja
        ).some(
            function(value) {
                return value === true;
            }
        );


    if (!minimalHari) {

        return "Minimal satu hari kerja harus dipilih.";

    }


    return null;

}


/* =========================================================
   LOAD SETTINGS
========================================================= */

async function loadSettings(showMessage = true) {

    if (isBusy) {
        return;
    }

    try {

        setLoading(
            true,
            "Memuat pengaturan..."
        );

        /*
         * Gunakan POST langsung.
         * Tidak menggunakan JSONP / apiGet.
         */

        const response = await apiPost(
            "getabsensisettings",
            {}
        );

        console.log(
            "SETTINGS LOAD RESPONSE:",
            response
        );

        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response?.message ||
                "Pengaturan gagal dimuat."
            );

        }

        applySettings(response);

        if (showMessage) {

            showNotification(
                response.message ||
                "Pengaturan berhasil dimuat.",
                "success"
            );

        }

    } catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );

        showNotification(
            "Gagal memuat pengaturan: " +
            error.message,
            "error"
        );

    } finally {

        setLoading(false);

    }

}
async function saveSettings() {

    if (isBusy) {
        return;
    }


    const data =
        getFormData();


    const validation =
        validateSettings(
            data
        );


    if (validation) {

        showNotification(
            validation,
            "warning"
        );

        return;

    }


    try {

        setLoading(
            true,
            "Menyimpan pengaturan..."
        );


        console.log(
            "SETTINGS DATA:",
            data
        );


        const response =
            await apiPost(
                "saveabsensisettings",
                data
            );


        console.log(
            "SETTINGS SAVE RESPONSE:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Pengaturan gagal disimpan."
            );

        }


        /*
         * Ambil ulang dari server.
         * Ini memastikan nilai yang tampil
         * benar-benar nilai yang tersimpan.
         */

        let verified = false;


        try {

            let serverData;


            try {

                serverData =
                    await apiGet(
                        "getabsensisettings"
                    );

            } catch (error) {

                serverData =
                    await apiPost(
                        "getabsensisettings",
                        {}
                    );

            }


            if (
                serverData &&
                serverData.success === true
            ) {

                applySettings(
                    serverData
                );

                verified = true;

            }

        } catch (verifyError) {

            console.warn(
                "VERIFY SETTINGS GAGAL:",
                verifyError
            );

        }


        showNotification(
            verified
                ? "Pengaturan berhasil disimpan dan diverifikasi."
                : (
                    response.message ||
                    "Pengaturan berhasil disimpan."
                ),
            "success"
        );


    } catch (error) {

        console.error(
            "SAVE SETTINGS ERROR:",
            error
        );


        showNotification(
            "Gagal menyimpan pengaturan: " +
            error.message,
            "error"
        );


    } finally {

        setLoading(
            false
        );

    }

}


/* =========================================================
   RESET DEFAULT
========================================================= */

async function resetSettings() {

    if (isBusy) {
        return;
    }


    const confirmReset =
        window.confirm(
            "Yakin ingin mengembalikan semua pengaturan ke nilai default?"
        );


    if (!confirmReset) {

        return;

    }


    /*
     * Tampilkan default ke form.
     */

    applySettings(
        {
            success: true,
            data:
                cloneDefaultSettings()
        }
    );


    /*
     * Langsung simpan ke backend.
     */

    await saveSettings();

}


/* =========================================================
   UPDATE DAY UI
========================================================= */

function updateDayUI() {

    DAY_NAMES.forEach(
        function(day) {

            const checkbox =
                $(day);


            if (!checkbox) {
                return;
            }


            /*
             * Beberapa kemungkinan wrapper.
             */

            const wrappers = [

                $("day-" + day),

                checkbox.closest(
                    ".day-card"
                ),

                checkbox.closest(
                    ".day-item"
                ),

                checkbox.closest(
                    ".day-option"
                ),

                checkbox.parentElement

            ];


            const wrapper =
                wrappers.find(
                    function(item) {
                        return item !== null;
                    }
                );


            if (!wrapper) {
                return;
            }


            wrapper.classList.toggle(
                "checked",
                checkbox.checked
            );


            wrapper.classList.toggle(
                "active",
                checkbox.checked
            );

        }
    );

}


/* =========================================================
   UPDATE SYSTEM STATUS
========================================================= */

function updateSystemStatus() {

    const checkbox =
        $("sistemAktif");


    const statusText =
        $("statusText");


    const statusDot =
        $("statusDot");


    if (!checkbox) {
        return;
    }


    const aktif =
        Boolean(
            checkbox.checked
        );


    if (statusText) {

        statusText.textContent =
            aktif
                ? "Sistem Aktif"
                : "Sistem Nonaktif";

    }


    if (statusDot) {

        statusDot.classList.toggle(
            "off",
            !aktif
        );

        statusDot.classList.toggle(
            "active",
            aktif
        );

    }


    /*
     * Beberapa HTML memakai element
     * status-system / systemStatus.
     */

    const systemStatus =
        $("systemStatus");


    if (systemStatus) {

        systemStatus.textContent =
            aktif
                ? "Sistem Aktif"
                : "Sistem Nonaktif";

    }

}


/* =========================================================
   CARI TOMBOL BERDASARKAN ID
========================================================= */

function getButtonByIds(
    ids
) {

    for (
        let i = 0;
        i < ids.length;
        i++
    ) {

        const button =
            $(ids[i]);


        if (button) {
            return button;
        }

    }


    return null;

}


/* =========================================================
   DETEKSI TOMBOL BERDASARKAN TEKS
========================================================= */

function findButtonByText(
    keywords
) {

    const buttons =
        document.querySelectorAll(
            "button, input[type='button'], input[type='submit'], a"
        );


    for (
        const button of buttons
    ) {

        const text =
            (
                button.innerText ||
                button.value ||
                button.getAttribute(
                    "aria-label"
                ) ||
                ""
            )
            .trim()
            .toLowerCase();


        if (!text) {
            continue;
        }


        const cocok =
            keywords.some(
                function(keyword) {

                    return text.includes(
                        keyword
                    );

                }
            );


        if (cocok) {

            return button;

        }

    }


    return null;

}


/* =========================================================
   BIND TOMBOL
========================================================= */

function bindButtons() {

    /*
     * SIMPAN
     */

    const saveButton =
        getButtonByIds([
            "btnSave",
            "btnSimpan",
            "saveSettings",
            "simpanSettings"
        ]) ||
        findButtonByText([
            "simpan pengaturan",
            "simpan setting",
            "simpan"
        ]);


    if (saveButton) {

        saveButton.dataset
            .settingsAction =
            "save";

        saveButton.type =
            "button";

    }


    /*
     * RESET
     */

    const resetButton =
        getButtonByIds([
            "btnReset",
            "btnResetDefault",
            "resetSettings"
        ]) ||
        findButtonByText([
            "reset default",
            "reset pengaturan",
            "reset"
        ]);


    if (resetButton) {

        resetButton.dataset
            .settingsAction =
            "reset";

        resetButton.type =
            "button";

    }


    /*
     * REFRESH
     */

    const refreshButton =
        getButtonByIds([
            "btnRefresh",
            "btnReload",
            "refreshSettings"
        ]) ||
        findButtonByText([
            "muat ulang",
            "refresh",
            "reload"
        ]);


    if (refreshButton) {

        refreshButton.dataset
            .settingsAction =
            "refresh";

        refreshButton.type =
            "button";

    }


    console.log(
        "SETTINGS BUTTONS:",
        {
            save:
                saveButton,

            reset:
                resetButton,

            refresh:
                refreshButton
        }
    );

}


/* =========================================================
   EVENT DELEGATION
========================================================= */

function initEvents() {

    /*
     * Satu event listener untuk semua tombol.
     */

    document.addEventListener(
        "click",
        async function(event) {

            const target =
                event.target.closest(
                    "button, input[type='button'], input[type='submit'], a"
                );


            if (!target) {
                return;
            }


            const action =
                target.dataset
                    ? target.dataset.settingsAction
                    : "";


            /*
             * Kalau bukan tombol Settings,
             * biarkan normal.
             */

            if (!action) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            if (isBusy) {
                return;
            }


            if (
                action === "save"
            ) {

                await saveSettings();

                return;

            }


            if (
                action === "reset"
            ) {

                await resetSettings();

                return;

            }


            if (
                action === "refresh"
            ) {

                await loadSettings(
                    true
                );

                return;

            }

        },
        true
    );


    /*
     * Checkbox hari kerja
     */

    DAY_NAMES.forEach(
        function(day) {

            const checkbox =
                $(day);


            if (!checkbox) {
                return;
            }


            checkbox.addEventListener(
                "change",
                function() {

                    updateDayUI();

                }
            );

        }
    );


    /*
     * Sistem aktif
     */

    const sistemAktif =
        $("sistemAktif");


    if (sistemAktif) {

        sistemAktif.addEventListener(
            "change",
            function() {

                updateSystemStatus();

            }
        );

    }


    /*
     * Cegah submit form
     */

    document.addEventListener(
        "submit",
        function(event) {

            const form =
                event.target;


            if (
                form &&
                form.querySelector(
                    "#jamMasuk, #batasTerlambat, #jamPulang"
                )
            ) {

                event.preventDefault();

            }

        }
    );

}


/* =========================================================
   INIT
========================================================= */

async function initSettings() {

    console.log(
        "===================================="
    );

    console.log(
        "SETTINGS SYSTEM INITIALIZING..."
    );

    console.log(
        "===================================="
    );


    /*
     * Clock langsung jalan.
     */

    updateClock();


    /*
     * Bind tombol.
     */

    bindButtons();


    /*
     * Event.
     */

    initEvents();


    /*
     * Load backend.
     */

    await loadSettings(
        false
    );


    console.log(
        "SETTINGS SYSTEM READY."
    );

}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initSettings
    );

} else {

    initSettings();

}