// =====================================================
// AUTH.JS
// SISTEM ABSENSI GURU & KARYAWAN
// =====================================================

const AUTH_SESSION_KEY = "absensi_session";


// =====================================================
// AMBIL SESSION LOGIN
// =====================================================

function getLoginSession() {

    const session =
        localStorage.getItem(
            AUTH_SESSION_KEY
        );

    if (!session) {
        return null;
    }

    try {

        return JSON.parse(session);

    } catch (error) {

        console.error(
            "SESSION INVALID:",
            error
        );

        localStorage.removeItem(
            AUTH_SESSION_KEY
        );

        return null;
    }
}


// =====================================================
// CEK APAKAH SUDAH LOGIN
// =====================================================

function isLoggedIn() {

    const session =
        getLoginSession();

    return (
        session !== null &&
        typeof session === "object" &&
        session.username
    );
}


// =====================================================
// PROTEKSI HALAMAN
// =====================================================

function requireLogin() {

    if (!isLoggedIn()) {

        window.location.replace(
            "login.html"
        );

        return false;
    }

    return true;
}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    const yakin =
        window.confirm(
            "Apakah Anda yakin ingin keluar dari sistem?"
        );

    if (!yakin) {
        return;
    }


    // ================================================
    // HAPUS SESSION UTAMA
    // ================================================

    localStorage.removeItem(
        AUTH_SESSION_KEY
    );


    // ================================================
    // HAPUS SESSION / DATA LOGIN LAMA
    // Untuk mengantisipasi versi login sebelumnya
    // ================================================

    localStorage.removeItem("user");
    localStorage.removeItem("login_user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("current_user");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("isLoggedIn");


    // ================================================
    // HAPUS SESSION STORAGE
    // ================================================

    try {

        sessionStorage.clear();

    } catch (error) {

        console.warn(
            "SessionStorage tidak dapat dibersihkan:",
            error
        );

    }


    // ================================================
    // PINDAH KE LOGIN
    // ================================================

    window.location.replace(
        "login.html"
    );
}


// =====================================================
// TAMPILKAN USER LOGIN
// Opsional untuk navbar
// =====================================================

function displayLoginUser() {

    const session =
        getLoginSession();

    if (!session) {
        return;
    }


    const nameElements =
        document.querySelectorAll(
            "[data-login-name]"
        );

    nameElements.forEach(
        function (element) {

            element.textContent =
                session.nama ||
                session.username ||
                "Administrator";

        }
    );


    const roleElements =
        document.querySelectorAll(
            "[data-login-role]"
        );

    roleElements.forEach(
        function (element) {

            element.textContent =
                session.role ||
                "Administrator";

        }
    );
}


// =====================================================
// AUTO CHECK SESSION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayLoginUser();

    }
);
