
let semuaLaporan = [];

document.addEventListener(
    "DOMContentLoaded",
    loadLaporan
);


async function loadLaporan(){

    try{

        const result =
            await apiGet("laporan");

        console.log(result);

        if(result.success){

            semuaLaporan =
                result.data || [];

            renderLaporan(
                semuaLaporan
            );

        }

    }catch(error){

        console.error(error);

    }

}


function renderLaporan(data) {

    const body = document.getElementById("tabelLaporan");

    // Pastikan tabel tersedia
    if (!body) {
        console.error(
            "RENDER LAPORAN ERROR: Element #laporanBody tidak ditemukan."
        );
        return;
    }

    // Bersihkan tabel
    body.innerHTML = "";

    // Pastikan data berupa array
    if (!Array.isArray(data) || data.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Tidak ada data
                </td>
            </tr>
        `;

        return;
    }

    // Render data
    data.forEach((item, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>

            <td>${item.tanggal || "-"}</td>

            <td>${item.jam || "-"}</td>

            <td>${item.nip || "-"}</td>

            <td>${item.nama || "-"}</td>

            <td>${item.jenis || "-"}</td>

            <td>
                <span class="badge ${
                    item.status === "Masuk"
                        ? "bg-success"
                        : "bg-danger"
                }">
                    ${item.status || "-"}
                </span>
            </td>
        `;

        body.appendChild(row);

    });

}


function filterLaporan(){

    let tanggal =
        document.getElementById(
            "filterTanggal"
        ).value;

    let jenis =
        document.getElementById(
            "filterJenis"
        ).value;


    let hasil =
        semuaLaporan.filter(item=>{

            let cocokTanggal =
                !tanggal ||
                item.tanggal===tanggal;

            let cocokJenis =
                !jenis ||
                item.jenis===jenis;

            return (
                cocokTanggal &&
                cocokJenis
            );

        });

    renderLaporan(
        hasil
    );

}


function exportExcel(){

    let csv = [];

    csv.push(
        "Tanggal,Jam,NIP,Nama,Jenis,Status"
    );

    semuaLaporan.forEach(item=>{

        csv.push(

            `${item.tanggal},
             ${item.jam},
             ${item.nip},
             ${item.nama},
             ${item.jenis},
             ${item.status}`

        );

    });

    let blob =
        new Blob(
            [csv.join("\n")],
            {
                type:
                "text/csv"
            }
        );

    let a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        "laporan_absensi.csv";

    a.click();

}
function resetLaporan() {
    try {
        console.log("RESET LAPORAN...");

        // Reset semua input
        document.querySelectorAll(
            '#pageLaporan input'
        ).forEach(function(input) {

            if (
                input.type === 'date' ||
                input.type === 'text' ||
                input.type === 'search'
            ) {
                input.value = '';
            }

            if (
                input.type === 'checkbox' ||
                input.type === 'radio'
            ) {
                input.checked = false;
            }
        });


        // Reset semua select
        document.querySelectorAll(
            '#pageLaporan select'
        ).forEach(function(select) {
            select.selectedIndex = 0;
        });


        // Reset halaman jika variabel ini memang ada
        if (typeof currentPage !== 'undefined') {
            currentPage = 1;
        }

        if (typeof halamanSaatIni !== 'undefined') {
            halamanSaatIni = 1;
        }


        // Muat ulang seluruh laporan
        loadLaporan();

        console.log("RESET LAPORAN BERHASIL");

    } catch (error) {
        console.error(
            "RESET LAPORAN ERROR:",
            error
        );
    }
}
window.resetLaporan = resetLaporan;
