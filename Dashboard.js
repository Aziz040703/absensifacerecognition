document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!requireLogin()) {
            return;
        }

        const session =
            localStorage.getItem(
                "absensi_session"
            );

        if (!session) {

            window.location.replace(
                "Login.html"
            );

            return;
        }

        try {

            const user =
                JSON.parse(session);

            console.log(
                "SESSION LOGIN:",
                user
            );

        } catch (error) {

            localStorage.removeItem(
                "absensi_session"
            );

            window.location.replace(
                "Login.html"
            );

        return;
        }

        updateClock();

        setInterval(
            updateClock,
            1000
        );

        loadDashboard();

    }
);


/**
 * ==============================
 * JAM & TANGGAL
 * ==============================
 */
function updateClock() {

    const now =
        new Date();

    const date =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    const time =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    const dateElement =
        document.getElementById(
            "currentDate"
        );

    const timeElement =
        document.getElementById(
            "currentTime"
        );

    if (dateElement) {
        dateElement.textContent =
            date;
    }

    if (timeElement) {
        timeElement.textContent =
            time;
    }

}

/**
 * ==============================
 * LOAD DASHBOARD
 * ==============================
 */
async function loadDashboard() {

    try {

        const guruResult =
            await apiGet("getGuru");

        const karyawanResult =
            await apiGet("getKaryawan");


        const guru =
            guruResult.success
                ? guruResult.data || []
                : [];

        const karyawan =
            karyawanResult.success
                ? karyawanResult.data || []
                : [];


        const totalGuru =
            guru.length;

        const totalKaryawan =
            karyawan.length;

        const totalPengguna =
            totalGuru +
            totalKaryawan;


        setText(
            "totalGuru",
            totalGuru
        );

        setText(
            "totalKaryawan",
            totalKaryawan
        );

        setText(
            "totalPengguna",
            totalPengguna
        );


        /*
         * Untuk tahap ini data absensi
         * belum kita hubungkan.
         *
         * Akan kita aktifkan pada
         * tahap backend absensi.
         */

        setText(
            "hadirHariIni",
            0
        );

        setText(
            "belumAbsen",
            totalPengguna
        );

        setText(
            "summaryHadir",
            0
        );

        setText(
            "summaryBelum",
            totalPengguna
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


/**
 * ==============================
 * HELPER
 * ==============================
 */
function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}