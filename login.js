// =====================================================
// LOGIN.JS
// SISTEM ABSENSI GURU & KARYAWAN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Jika sudah login
        const session =
            localStorage.getItem(
                "absensi_session"
            );

        if (session) {

            try {

                const user =
                    JSON.parse(session);

                if (user && user.username) {

                    // Jika ingin otomatis ke dashboard
                    // uncomment baris berikut:
                    // window.location.href = "dashboard.html";

                }

            } catch (error) {

                localStorage.removeItem(
                    "absensi_session"
                );

            }

        }

    }
);


// =====================================================
// TOGGLE PASSWORD
// =====================================================

function togglePassword() {

    const input =
        document.getElementById(
            "password"
        );

    const button =
        document.querySelector(
            ".password-toggle"
        );

    if (input.type === "password") {

        input.type = "text";

        button.textContent =
            "Sembunyikan";

    } else {

        input.type = "password";

        button.textContent =
            "Lihat";

    }

}


// =====================================================
// HANDLE LOGIN
// =====================================================

async function handleLogin(event) {

    event.preventDefault();

    const username =
        document
            .getElementById("username")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;

    if (!username || !password) {

        showMessage(
            "Username dan password wajib diisi.",
            "error"
        );

        return;

    }


    const button =
        document.getElementById(
            "loginButton"
        );

    const loginText =
        document.getElementById(
            "loginText"
        );

    const loading =
        document.getElementById(
            "loading"
        );


    button.disabled = true;

    loginText.style.display =
        "none";

    loading.classList.add(
        "active"
    );

    hideMessage();


    try {

        console.log(
            "LOGIN REQUEST:",
            username
        );


        // =================================================
        // HUBUNGI API
        // =================================================

        const result =
            await apiPost(
                "login",
                {
                    username:
                        username,

                    password:
                        password
                }
            );


        console.log(
            "LOGIN RESULT:",
            result
        );


        if (
            !result ||
            typeof result !== "object"
        ) {

            throw new Error(
                "Response login tidak valid."
            );

        }


        if (
            result.success !== true
        ) {

            throw new Error(
                result.message ||
                "Username atau password salah."
            );

        }


        // =================================================
        // SIMPAN SESSION
        // =================================================

        const user =
            result.data || {};


        const session = {

            username:
                username,

            id:
                user.id ||
                "",

            nama:
                user.nama ||
                user.name ||
                "",

            role:
                user.role ||
                "admin",

            loginAt:
                new Date()
                    .toISOString()

        };


        localStorage.setItem(
            "absensi_session",
            JSON.stringify(session)
        );


        // =================================================
        // BERHASIL
        // =================================================

        showMessage(
            "Login berhasil. Mengalihkan ke dashboard...",
            "success"
        );


        setTimeout(
            function () {

                window.location.href =
                    "dashboard.html";

            },
            700
        );


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Login gagal. Silakan coba kembali.",
            "error"
        );


        button.disabled = false;

        loginText.style.display =
            "inline";

        loading.classList.remove(
            "active"
        );

    }

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "message"
        );

    element.textContent =
        message;

    element.className =
        "message " +
        type;

}


function hideMessage() {

    const element =
        document.getElementById(
            "message"
        );

    element.textContent = "";

    element.className =
        "message";

}
