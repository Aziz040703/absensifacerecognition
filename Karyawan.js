let karyawanData = [];

let karyawanModal;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        karyawanModal =
            new bootstrap.Modal(
                document.getElementById(
                    "karyawanModal"
                )
            );

        loadKaryawan();

    }
);


/* =========================================
   LOAD
========================================= */

async function loadKaryawan() {

    const tbody =
        document.getElementById(
            "karyawanTableBody"
        );


    try {

        const result =
            await apiGet("karyawan");


        console.log(
            "KARYAWAN RESPONSE:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data."
            );

        }


        karyawanData =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderKaryawan();


    } catch (error) {

        console.error(
            "LOAD KARYAWAN ERROR:",
            error
        );


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-danger py-5"
                >

                    Gagal memuat data karyawan.

                    <br>

                    <small>
                        ${escapeHtml(error.message)}
                    </small>

                </td>

            </tr>

        `;

    }

}


/* =========================================
   RENDER
========================================= */

function renderKaryawan() {

    const tbody = document.getElementById("karyawanTableBody");
    const count = document.getElementById("karyawanCount");

    if (!tbody) return;

    if (!Array.isArray(karyawanData)) {
        karyawanData = [];
    }

    if (count) {
        count.textContent = karyawanData.length + " karyawan";
    }

    if (karyawanData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-5">
                    Belum ada data karyawan.
                </td>
            </tr>
        `;
        return;
    }

    let html = "";

    karyawanData.forEach(function (item, index) {

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.id || ""}</td>
                <td>${item.nip || ""}</td>
                <td><strong>${item.nama || ""}</strong></td>
                <td>${item.divisi || ""}</td>

                <td>
                    ${
                        item.foto
                            ? `<img src="${item.foto}"
                                    class="photo-thumb"
                                    style="width:50px;height:50px;object-fit:cover;">`
                            : "-"
                    }
                </td>

                <td>
                    <span class="badge ${
                        String(item.status || "").toLowerCase() === "aktif"
                            ? "bg-success"
                            : "bg-secondary"
                    }">
                        ${item.status || ""}
                    </span>
                </td>

                <td>
                    ${
                        item.faceDescriptor
                            ? `<span class="badge bg-success">Terdaftar</span>`
                            : `<span class="badge bg-secondary">Belum</span>`
                    }
                </td>

                <td>
                    <button
                        type="button"
                        class="btn btn-sm btn-warning"
                        onclick="editKaryawan('${item.id}')">
                        <i class="bi bi-pencil"></i>
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        onclick="deleteKaryawan('${item.id}')">
                        <i class="bi bi-trash"></i>
                        Hapus
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-success"
                        onclick="registerKaryawanFace('${item.id}')">
                        <i class="bi bi-person-bounding-box"></i>
                        Face
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}


/* =========================================
   ADD
========================================= */

function openAddKaryawan() {

    document.getElementById(
        "karyawanId"
    ).value = "";


    document.getElementById(
        "karyawanNip"
    ).value = "";


    document.getElementById(
        "karyawanNama"
    ).value = "";


    document.getElementById(
        "karyawanDivisi"
    ).value = "";


    document.getElementById(
        "karyawanFoto"
    ).value = "";


    document.getElementById(
        "karyawanStatus"
    ).value = "Aktif";


    karyawanModal.show();

}


/* =========================================
   EDIT
========================================= */

function editKaryawan(id) {

    const item =
        karyawanData.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if (!item) {

        alert(
            "Karyawan tidak ditemukan."
        );

        return;

    }


    document.getElementById(
        "karyawanModalTitle"
    ).textContent =
        "Edit Karyawan";


    document.getElementById(
        "karyawanId"
    ).value =
        item.id || "";


    document.getElementById(
        "karyawanNip"
    ).value =
        item.nip || "";


    document.getElementById(
        "karyawanNama"
    ).value =
        item.nama || "";


    document.getElementById(
        "karyawanDivisi"
    ).value =
        item.divisi || "";


    document.getElementById(
        "karyawanFoto"
    ).value =
        item.foto || "";


    document.getElementById(
        "karyawanStatus"
    ).value =
        item.status || "Aktif";


    karyawanModal.show();

}


/* =========================================
   SAVE
========================================= */

async function saveKaryawan() {

    const id =
        document.getElementById("karyawanId").value.trim();

    const nip =
        document.getElementById("karyawanNip").value.trim();

    const nama =
        document.getElementById("karyawanNama").value.trim();

    const divisi =
        document.getElementById("karyawanDivisi").value.trim();

    const foto =
        document.getElementById("karyawanFoto").value.trim();

    const status =
        document.getElementById("karyawanStatus").value;


    if (!nama) {

        alert(
            "Nama karyawan wajib diisi."
        );

        return;
    }


    try {

        const action =
            id
                ? "updateKaryawan"
                : "addKaryawan";

        console.log("DATA KARYAWAN YANG DIKIRIM:", {
            id: id,
            nip: nip,
            nama: nama,
            divisi: divisi,
            foto: foto,
            status: status
        });
        const result =
            await apiPost(
                action,
                {
                    id: id,
                    nip: nip,
                    nama: nama,
                    divisi: divisi,
                    foto: foto,
                    status: status
                }
            );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal menyimpan."
            );
        }


        karyawanModal.hide();


        await loadKaryawan();


        alert(
            result.message ||
            "Data berhasil disimpan."
        );


    } catch (error) {

        alert(
            "Gagal menyimpan:\n" +
            error.message
        );

    }

}


/* =========================================
   DELETE
========================================= */

async function deleteKaryawan(id) {

    const item =
        karyawanData.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if (!item) {

        return;

    }


    if (
        !confirm(
            "Hapus karyawan:\n\n" +
            item.nama +
            "?"
        )
    ) {

        return;

    }


    try {

        const result =
            await apiPost(
                "deleteKaryawan",
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


        await loadKaryawan();


        alert(
            result.message ||
            "Karyawan berhasil dihapus."
        );


    } catch (error) {

        alert(
            "Gagal menghapus:\n" +
            error.message
        );

    }

}


/* =========================================
   REGISTER FACE
========================================= */

function registerKaryawanFace(id) {

    const item =
        karyawanData.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if (!item) {

        alert(
            "Karyawan tidak ditemukan."
        );

        return;

    }


    const params =
        new URLSearchParams({

            id:
                item.id || "",

            nip:
                item.nip || "",

            nama:
                item.nama || "",

            target:
                "karyawan"

        });


    window.location.href =
        "Face.html?" +
        params.toString();

}


/* =========================================
   SECURITY
========================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttr(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}