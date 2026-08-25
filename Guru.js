let guruData = [];

let guruModal;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        guruModal =
            new bootstrap.Modal(
                document.getElementById(
                    "guruModal"
                )
            );

        loadGuru();

    }
);


/* =================================================
   LOAD
================================================= */

async function loadGuru() {

    const tbody =
        document.getElementById(
            "guruTableBody"
        );


    try {

        const result =
            await apiGet("guru");


        console.log(
            "GURU RESPONSE:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data guru."
            );

        }


        guruData =
            Array.isArray(result.data)
                ? result.data
                : [];


        window.guruData =
            guruData;


        renderGuru();


    } catch (error) {

        console.error(
            "LOAD GURU ERROR:",
            error
        );


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-danger py-5"
                >

                    <i
                        class="bi bi-exclamation-triangle fs-2"
                    ></i>

                    <div class="mt-2">

                        Gagal memuat data guru.

                    </div>

                    <small>

                        ${escapeHtml(
                            error.message
                        )}

                    </small>

                </td>

            </tr>

        `;

    }

}


/* =================================================
   RENDER
================================================= */

function renderGuru() {

    const tbody =
        document.getElementById(
            "guruTableBody"
        );


    document.getElementById(
        "guruCount"
    ).textContent =
        guruData.length +
        " guru";


    if (
        guruData.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-5 text-muted"
                >

                    <i
                        class="bi bi-person-x fs-2"
                    ></i>

                    <div class="mt-2">
                        Belum ada data guru.
                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        guruData.map(
            function (guru, index) {

                const face =
                    String(
                        guru.face || ""
                    ).trim();


                return `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(guru.id)}
                    </td>

                    <td>
                        ${escapeHtml(guru.nip)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(guru.nama)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(guru.jabatan)}
                    </td>

                    <td>
                        ${escapeHtml(guru.noHp)}
                    </td>

                    <td>

                        ${
                            face
                            ?
                            `
                            <span class="badge bg-success">
                                <i class="bi bi-check-circle"></i>
                                Terdaftar
                            </span>
                            `
                            :
                            `
                            <span class="badge bg-secondary">
                                Belum
                            </span>
                            `
                        }

                    </td>

                    <td>

                        <button
                            class="btn btn-sm btn-warning action-btn"
                            onclick="editGuru('${escapeAttr(guru.id)}')"
                        >
                            <i class="bi bi-pencil"></i>
                            Edit
                        </button>


                        <button
                            class="btn btn-sm btn-danger action-btn"
                            onclick="deleteGuru('${escapeAttr(guru.id)}')"
                        >
                            <i class="bi bi-trash"></i>
                            Hapus
                        </button>


                        <button
                            class="btn btn-sm btn-success action-btn"
                            onclick="registerGuruFace('${escapeAttr(guru.id)}')"
                        >
                            <i class="bi bi-person-bounding-box"></i>
                            Face
                        </button>

                    </td>

                </tr>

                `;

            }
        ).join("");

}


/* =================================================
   ADD
================================================= */

function openAddGuru() {

    document.getElementById(
        "guruModalTitle"
    ).textContent =
        "Tambah Guru";


    document.getElementById(
        "guruId"
    ).value = "";


    document.getElementById(
        "guruNip"
    ).value = "";


    document.getElementById(
        "guruNama"
    ).value = "";


    document.getElementById(
        "guruJabatan"
    ).value = "";


    document.getElementById(
        "guruNoHp"
    ).value = "";


    guruModal.show();

}


/* =================================================
   EDIT
================================================= */

function editGuru(id) {

    const guru =
        guruData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!guru) {

        alert(
            "Data guru tidak ditemukan."
        );

        return;

    }


    document.getElementById(
        "guruModalTitle"
    ).textContent =
        "Edit Guru";


    document.getElementById(
        "guruId"
    ).value =
        guru.id || "";


    document.getElementById(
        "guruNip"
    ).value =
        guru.nip || "";


    document.getElementById(
        "guruNama"
    ).value =
        guru.nama || "";


    document.getElementById(
        "guruJabatan"
    ).value =
        guru.jabatan || "";


    document.getElementById(
        "guruNoHp"
    ).value =
        guru.noHp || "";


    guruModal.show();

}


/* =================================================
   SAVE
================================================= */

async function saveGuru() {

    const id =
        document.getElementById(
            "guruId"
        ).value.trim();


    const nip =
        document.getElementById(
            "guruNip"
        ).value.trim();


    const nama =
        document.getElementById(
            "guruNama"
        ).value.trim();


    const jabatan =
        document.getElementById(
            "guruJabatan"
        ).value.trim();


    const noHp =
        document.getElementById(
            "guruNoHp"
        ).value.trim();


    if (!nama) {

        alert(
            "Nama guru wajib diisi."
        );

        return;

    }


    try {

        const action =
            id
                ? "updateGuru"
                : "addGuru";


        const result =
            await apiPost(
                action,
                {
                    id: id,
                    nip: nip,
                    nama: nama,
                    jabatan: jabatan,
                    noHp: noHp
                }
            );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal menyimpan data."
            );

        }


        guruModal.hide();


        await loadGuru();


        alert(
            result.message ||
            "Data berhasil disimpan."
        );


    } catch (error) {

        console.error(
            "SAVE GURU ERROR:",
            error
        );


        alert(
            "Gagal menyimpan:\n" +
            error.message
        );

    }

}


/* =================================================
   DELETE
================================================= */

async function deleteGuru(id) {

    const guru =
        guruData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!guru) {

        alert(
            "Guru tidak ditemukan."
        );

        return;

    }


    if (
        !confirm(
            "Hapus guru:\n\n" +
            guru.nama +
            "?"
        )
    ) {

        return;

    }


    try {

        const result =
            await apiPost(
                "deleteGuru",
                {
                    id: id
                }
            );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal menghapus."
            );

        }


        await loadGuru();


        alert(
            result.message ||
            "Guru berhasil dihapus."
        );


    } catch (error) {

        alert(
            "Gagal menghapus:\n" +
            error.message
        );

    }

}


/* =================================================
   REGISTER FACE
================================================= */

function registerGuruFace(id) {

    const guru =
        guruData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!guru) {

        alert(
            "Data guru tidak ditemukan."
        );

        return;

    }


    const params =
        new URLSearchParams({

            id:
                guru.id || "",

            nip:
                guru.nip || "",

            nama:
                guru.nama || "",

            target:
                "guru"

        });


    window.location.href =
        "Face.html?" +
        params.toString();

}


/* =================================================
   SECURITY
================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttr(value) {

    return String(
        value ?? ""
    )
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");

}