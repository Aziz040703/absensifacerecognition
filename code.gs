const SHEET_GURU = "guru";
const SHEET_KARYAWAN = "karyawan";
const SETTINGS_SHEET = "SettingsAbsensi";

function doGet(e) {

    try {

        const parameter =
            e && e.parameter
                ? e.parameter
                : {};

        const action =
            String(
                parameter.action || ""
            )
            .trim()
            .toLowerCase();

        const callback =
            String(
                parameter.callback || ""
            )
            .trim();


        let result;

        if (
            action === "" ||
            action === "guru"
        ) {

            result =
                getGuru();

        }

        else if (
            action === "face"
        ) {

            result =
                getRegisteredFaces();

        }

        else if (
            action === "karyawan"
        ) {

            result =
                getKaryawan();

        }

        else if (
            action === "laporan"
        ) {
            result =
                getLaporan();
        }

        else if (
            action === "getabsensisettings"
        ) {
            result =
                getAbsensiSettings();
        }

        else {

          result = {

              success: false,

              message:
                  "Action tidak ditemukan: " +
                  action,

              data: []

            };

        }


        // =========================
        // JSONP
        // =========================

        if (callback) {

            return ContentService
                .createTextOutput(
                    callback +
                    "(" +
                    JSON.stringify(result) +
                    ");"
                )
                .setMimeType(
                    ContentService
                        .MimeType
                        .JAVASCRIPT
                );

        }


        // =========================
        // JSON BIASA
        // =========================

        return ContentService
            .createTextOutput(
                JSON.stringify(result)
            )
            .setMimeType(
                ContentService
                    .MimeType
                    .JSON
            );


    } catch (error) {

        const result = {

            success: false,

            message:
                String(error),

            data: []

        };


        const callback =
            e &&
            e.parameter &&
            e.parameter.callback
                ? String(
                    e.parameter.callback
                )
                : "";


        if (callback) {

            return ContentService
                .createTextOutput(
                    callback +
                    "(" +
                    JSON.stringify(result) +
                    ");"
                )
                .setMimeType(
                    ContentService
                        .MimeType
                        .JAVASCRIPT
                );

        }


        return ContentService
            .createTextOutput(
                JSON.stringify(result)
            )
            .setMimeType(
                ContentService
                    .MimeType
                    .JSON
            );

    }

}
function doPost(e) {

    try {

        if (
            !e ||
            !e.postData ||
            !e.postData.contents
        ) {

            return jsonResponse({
                success: false,
                message: "POST data tidak ditemukan.",
                data: []
            });

        }


        const request =
            JSON.parse(
                e.postData.contents
            );


        const action =
            String(
                request.action ||
                ""
            )
            .trim()
            .toLowerCase();


        const data =
            request.data ||
            {};


        switch (action) {

            case "login":
                return jsonResponse(
                    prosesLogin(data)
                );
            case "guru":

            case "getguru":

                return jsonResponse(
                    getGuru()
                );
            case "addguru":

                return jsonResponse(
                    addGuru(data)
                );

            case "deleteguru":

                return jsonResponse(
                  deleteGuru(data)
                );

            case "updateguru":

                return jsonResponse(
                  updateGuru(data)
                );


            case "karyawan":

            case "getkaryawan":

                return jsonResponse(
                    getKaryawan()
                );

            case "addkaryawan":
                return jsonResponse(
                    addKaryawan(data)
              );

            case "deletekaryawan":

                return jsonResponse(
                  deleteKaryawan(data)
                );

            case "updatekaryawan":

                return jsonResponse(
                  updateKaryawan(data)
                );


            case "registerface":

                return jsonResponse(
                    simpanWajahFinal(
                        data
                    )
                );


            case "face":

                return jsonResponse(
                    getRegisteredFaces()
                );


            case "dashboard":

                return jsonResponse(
                    getDashboard()
                );


            case "laporan":

                return jsonResponse(
                    getLaporan()
                );

            case "absensi":

                return jsonResponse(
                    simpanAbsensi(data)
                );
            case "getabsensisettings":

                return jsonResponse(
                    getAbsensiSettings()
                );


            case "saveabsensisettings":

                return jsonResponse(
                    saveAbsensiSettings(data)
                );

            default:

                return jsonResponse({

                    success: false,

                    message:
                        "Action tidak ditemukan: " +
                        action,

                    data: []

                });

        }


    } catch (error) {

        console.error(
            "DO POST ERROR:",
            error
        );


        return jsonResponse({

            success: false,

            message:
                String(error),

            data: []

        });

    }

}
/* =================================================
   JSON RESPONSE
================================================= */

function jsonResponse(result) {

    return ContentService
        .createTextOutput(
            JSON.stringify(result)
        )
        .setMimeType(
            ContentService.MimeType.JSON
        );

}


/* =================================================
   SPREADSHEET
================================================= */

function getSpreadsheet() {

    return SpreadsheetApp
        .openById(
            SPREADSHEET_ID
        );

}


function getSheet(name) {

    const sheet =
        getSpreadsheet()
            .getSheetByName(name);


    if (!sheet) {

        throw new Error(
            "Sheet tidak ditemukan: " +
            name
        );

    }


    return sheet;

}


/* =================================================
   GURU
   A ID
   B NIP
   C Nama
   D Jabatan
   E No HP
   F Face
================================================= */

function getGuru() {

    try {

        const sheet =
            getSheet(SHEET_GURU);


        const values =
            sheet
                .getDataRange()
                .getValues();


        const data = [];


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            if (
                !values[i][0] &&
                !values[i][1] &&
                !values[i][2]
            ) {
                continue;
            }


            data.push({

                id:
                    String(
                        values[i][0] || ""
                    ),

                nip:
                    String(
                        values[i][1] || ""
                    ),

                nama:
                    String(
                        values[i][2] || ""
                    ),

                jabatan:
                    String(
                        values[i][3] || ""
                    ),

                noHp:
                    String(
                        values[i][4] || ""
                    ),

                face:
                    String(
                        values[i][5] || ""
                    )

            });

        }


        return {

            success: true,

            message:
                "Data guru berhasil diambil.",

            data: data

        };


    } catch (error) {

        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}


/* =================================================
   ADD GURU
================================================= */

function addGuru(data) {

    try {

        const sheet =
            getSheet(SHEET_GURU);


        const id =
            data.id ||
            generateId("G");


        const nip =
            data.nip || "";


        const nama =
            data.nama || "";


        const jabatan =
            data.jabatan || "";


        const noHp =
            data.noHp || "";


        if (!nama) {

            return {

                success: false,

                message:
                    "Nama guru wajib diisi.",

                data: []

            };

        }


        const values =
            sheet
                .getDataRange()
                .getValues();


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            if (
                String(values[i][0]) ===
                String(id)
            ) {

                return {

                    success: false,

                    message:
                        "ID guru sudah digunakan.",

                    data: []

                };

            }

        }


        sheet.appendRow([

            id,
            nip,
            nama,
            jabatan,
            noHp,
            ""

        ]);


        return {

            success: true,

            message:
                "Guru berhasil ditambahkan.",

            data: {
                id: id
            }

        };


    } catch (error) {

        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}


/* =================================================
   UPDATE GURU
================================================= */

function updateGuru(data) {

    try {

        const sheet =
            getSheet(SHEET_GURU);


        const id =
            String(data.id || "");


        if (!id) {

            return {

                success: false,

                message:
                    "ID guru wajib diisi.",

                data: []

            };

        }


        const values =
            sheet
                .getDataRange()
                .getValues();


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            if (
                String(values[i][0]) === id
            ) {

                sheet
                    .getRange(i + 1, 2, 1, 4)
                    .setValues([[
                        data.nip || "",
                        data.nama || "",
                        data.jabatan || "",
                        data.noHp || ""
                    ]]);


                return {

                    success: true,

                    message:
                        "Data guru berhasil diperbarui.",

                    data: []

                };

            }

        }


        return {

            success: false,

            message:
                "Guru tidak ditemukan.",

            data: []

        };


    } catch (error) {

        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}


/* =================================================
   DELETE GURU
================================================= */

function deleteGuru(data) {

    try {

        const sheet =
            getSheet(SHEET_GURU);


        const id =
            String(data.id || "");


        const values =
            sheet
                .getDataRange()
                .getValues();


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            if (
                String(values[i][0]) === id
            ) {

                sheet.deleteRow(i + 1);


                return {

                    success: true,

                    message:
                        "Guru berhasil dihapus.",

                    data: []

                };

            }

        }


        return {

            success: false,

            message:
                "Guru tidak ditemukan.",

            data: []

        };


    } catch (error) {

        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}


/* =================================================
   KARYAWAN
   A ID
   B NIP
   C Nama
   D Divisi
   E Foto
   F Status
   G FaceDescriptor
================================================= */

function getKaryawan() {

    try {

        const sheet =
            getSheet(SHEET_KARYAWAN);


        const values =
            sheet
                .getDataRange()
                .getValues();


        const data = [];


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            if (
                !values[i][0] &&
                !values[i][1] &&
                !values[i][2]
            ) {
                continue;
            }


            data.push({

                id:
                    String(
                        values[i][0] || ""
                    ),

                nip:
                    String(
                        values[i][1] || ""
                    ),

                nama:
                    String(
                        values[i][2] || ""
                    ),

                divisi:
                    String(
                        values[i][3] || ""
                    ),

                foto:
                    String(
                        values[i][4] || ""
                    ),

                status:
                    String(
                        values[i][5] || ""
                    ),

                faceDescriptor:
                    String(
                        values[i][6] || ""
                    )

            });

        }


        return {

            success: true,

            message:
                "Data karyawan berhasil diambil.",

            data: data

        };


    } catch (error) {

        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}
function addKaryawan(data) {
    data = data || {};
    try {

        const sheet = getSheet(SHEET_KARYAWAN);
        
        const id = String(data.id || "").trim();
        const nip = String(data.nip || "").trim();
        const nama = String(data.nama || "").trim();
        const divisi = String(data.divisi || "").trim();
        const foto = String(data.foto || "").trim();
        const status = String(data.status || "").trim();

        if (!nama) {
            return {
                success: false,
                message: "Nama karyawan wajib diisi.",
                data: []
            };
        }

        /*
         * Buat ID jika belum ada
         */
        const newId =
            id ||
            ("KRY-" + new Date().getTime());

        /*
         * SIMPAN KE GOOGLE SHEET
         */
        sheet.appendRow([
              newId,
              nip,
              nama,
              divisi,
              foto,
              status,
              ""
          ]);

        return {
            success: true,
            message: "Karyawan berhasil ditambahkan.",
            data: {
                id: newId,
                nip: nip,
                nama: nama,
                divisi: divisi,
                foto: foto,
                status: status,
                faceDescriptor: ""
            }
        };

    } catch (error) {

        return {
            success: false,
            message: String(error),
            data: []
        };

    }
}


/* =================================================
   UPDATE KARYAWAN
================================================= */

function updateKaryawan(data) {

    try {

        const sheet =
            getSheet(SHEET_KARYAWAN);


        const id =
            String(data.id || "");


        const values =
            sheet
                .getDataRange()
                .getValues();


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            if (
                String(values[i][0]) === id
            ) {

                sheet
                    .getRange(i + 1, 2, 1, 5)
                    .setValues([[
                        data.nip || "",
                        data.nama || "",
                        data.divisi || "",
                        data.foto || "",
                        data.status || ""
                    ]]);


                return {

                    success: true,

                    message:
                        "Data karyawan berhasil diperbarui.",

                    data: []

                };

            }

        }


        return {

            success: false,

            message:
                "Karyawan tidak ditemukan.",

            data: []

        };


    } catch (error) {

        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}


/* =================================================
   DELETE KARYAWAN
================================================= */

function deleteKaryawan(data) {

    try {

        const sheet =
            getSheet(SHEET_KARYAWAN);


        const id =
            String(data.id || "");


        const values =
            sheet
                .getDataRange()
                .getValues();


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            if (
                String(values[i][0]) === id
            ) {

                sheet.deleteRow(i + 1);


                return {

                    success: true,

                    message:
                        "Karyawan berhasil dihapus.",

                    data: []

                };

            }

        }


        return {

            success: false,

            message:
                "Karyawan tidak ditemukan.",

            data: []

        };


    } catch (error) {

        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}
function hitungJarakWajah(
    descriptorA,
    descriptorB
) {

    if (
        !Array.isArray(descriptorA) ||
        !Array.isArray(descriptorB)
    ) {

        return Infinity;

    }


    if (
        descriptorA.length !== 128 ||
        descriptorB.length !== 128
    ) {

        return Infinity;

    }


    let total = 0;


    for (
        let i = 0;
        i < 128;
        i++
    ) {

        const selisih =
            Number(
                descriptorA[i]
            ) -
            Number(
                descriptorB[i]
            );


        total +=
            selisih *
            selisih;

    }


    return Math.sqrt(
        total
    );

}
function generateId(prefix) {

    return (
        prefix +
        new Date().getTime().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 7)
    );

}
function getLaporan() {

    const sheet =
        SpreadsheetApp
        .openById(
            SPREADSHEET_ID
        )
        .getSheetByName(
            "Absensi"
        );

    const data =
        sheet
        .getDataRange()
        .getValues();

    const header =
        data.shift();

    const result =
        data.map(row=>{

            let obj = {};

            header.forEach((h,i)=>{

                obj[h] =
                    row[i];

            });

            return obj;

        });

    return {

        success:true,
        data:result

    };

}
function getRegisteredFaces() {

    try {

        const ss =
            SpreadsheetApp.openById(
                SPREADSHEET_ID
            );

        const hasil = [];


        /* =================================================
           GURU
           A = ID
           B = NIP
           C = Nama
           D = Jabatan
           E = No HP
           F = Face
        ================================================= */

        const guruSheet =
            ss.getSheetByName(
                SHEET_GURU
            );


        if (guruSheet) {

            const values =
                guruSheet
                    .getDataRange()
                    .getValues();


            for (
                let i = 1;
                i < values.length;
                i++
            ) {

                const row =
                    values[i];


                const id =
                    String(
                        row[0] || ""
                    ).trim();


                const nip =
                    String(
                        row[1] || ""
                    ).trim();


                const nama =
                    String(
                        row[2] || ""
                    ).trim();


                const jabatan =
                    String(
                        row[3] || ""
                    ).trim();


                const noHp =
                    String(
                        row[4] || ""
                    ).trim();


                const faceRaw =
                    String(
                        row[5] || ""
                    ).trim();


                if (
                    !id ||
                    !faceRaw
                ) {
                    continue;
                }


                let descriptor;


                try {

                    descriptor =
                        JSON.parse(
                            faceRaw
                        );

                } catch (error) {

                    console.log(
                        "Face Guru bukan JSON valid: " +
                        id
                    );

                    continue;

                }


                if (
                    !Array.isArray(
                        descriptor
                    ) ||
                    descriptor.length !== 128
                ) {

                    console.log(
                        "Descriptor Guru tidak valid: " +
                        id
                    );

                    continue;

                }


                hasil.push({

                    id:
                        id,

                    nip:
                        nip,

                    nama:
                        nama,

                    jabatan:
                        jabatan,

                    noHp:
                        noHp,

                    jenis:
                        "GURU",

                    descriptor:
                        descriptor

                });

            }

        }


        /* =================================================
           KARYAWAN
           A = ID
           B = NIP
           C = Nama
           D = Divisi
           E = Foto
           F = Status
           G = FaceDescriptor
        ================================================= */

        const karyawanSheet =
            ss.getSheetByName(
                SHEET_KARYAWAN
            );


        if (karyawanSheet) {

            const values =
                karyawanSheet
                    .getDataRange()
                    .getValues();


            for (
                let i = 1;
                i < values.length;
                i++
            ) {

                const row =
                    values[i];


                const id =
                    String(
                        row[0] || ""
                    ).trim();


                const nip =
                    String(
                        row[1] || ""
                    ).trim();


                const nama =
                    String(
                        row[2] || ""
                    ).trim();


                const divisi =
                    String(
                        row[3] || ""
                    ).trim();


                const status =
                    String(
                        row[5] || ""
                    ).trim();


                const faceRaw =
                    String(
                        row[6] || ""
                    ).trim();


                if (
                    !id ||
                    !faceRaw
                ) {
                    continue;
                }


                let descriptor;


                try {

                    descriptor =
                        JSON.parse(
                            faceRaw
                        );

                } catch (error) {

                    console.log(
                        "Face Karyawan bukan JSON valid: " +
                        id
                    );

                    continue;

                }


                if (
                    !Array.isArray(
                        descriptor
                    ) ||
                    descriptor.length !== 128
                ) {

                    console.log(
                        "Descriptor Karyawan tidak valid: " +
                        id
                    );

                    continue;

                }


                hasil.push({

                    id:
                        id,

                    nip:
                        nip,

                    nama:
                        nama,

                    jabatan:
                        divisi,

                    divisi:
                        divisi,

                    noHp:
                        "",

                    status:
                        status,

                    jenis:
                        "KARYAWAN",

                    descriptor:
                        descriptor

                });

            }

        }


        return {

            success:
                true,

            message:
                "Data wajah Guru dan Karyawan berhasil diambil.",

            data:
                hasil

        };


    } catch (error) {

        console.error(
            "GET REGISTERED FACES ERROR:",
            error
        );


        return {

            success:
                false,

            message:
                String(
                    error
                ),

            data:
                []

        };

    }

}
function getUserFace(e) {

    try {

        const id =
            e.parameter.id;


        if (!id) {

            return {

                success: false,

                message:
                    "ID pengguna tidak ditemukan.",

                data: null

            };

        }


        const ss =
            SpreadsheetApp.openById(
                SPREADSHEET_ID
            );


        // =========================
        // CARI DI GURU
        // =========================

        const guru =
            findUserById(
                ss.getSheetByName(
                    SHEET_GURU
                ),
                id
            );


        if (guru) {

            guru.jenis =
                "Guru";

            return {

                success: true,

                data: guru

            };

        }


        // =========================
        // CARI DI KARYAWAN
        // =========================

        const karyawan =
            findUserById(
                ss.getSheetByName(
                    SHEET_KARYAWAN
                ),
                id
            );


        if (karyawan) {

            karyawan.jenis =
                "Karyawan";

            return {

                success: true,

                data: karyawan

            };

        }


        return {

            success: false,

            message:
                "Data pengguna tidak ditemukan.",

            data: null

        };


    } catch (error) {

        return {

            success: false,

            message:
                error.toString(),

            data: null

        };

    }

}
function findUserById(
    sheet,
    id
) {

    if (!sheet) {

        return null;

    }


    const values =
        sheet
            .getDataRange()
            .getValues();


    if (values.length < 2) {

        return null;

    }


    const header =
        values[0];


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const data =
            rowToObject(
                header,
                values[i]
            );


        if (
            String(data.id || "")
            ===
            String(id)
        ) {

            return {

                id:
                    String(
                        data.id || ""
                    ),

                nip:
                    String(
                        data.nip || ""
                    ),

                nama:
                    String(
                        data.nama || ""
                    ),

                jabatan:
                    String(
                        data.jabatan || ""
                    ),

                noHp:
                    String(
                        data.noHp ||
                        data.no_hp ||
                        ""
                    )

            };

        }

    }


    return null;

}
function rowToObject(
    header,
    row
) {

    const obj = {};

    header.forEach(
        function(key, index) {

            obj[
                String(key)
                .trim()
            ] =
                row[index];

        }
    );

    return obj;

}


function parseDescriptor(
    value
) {

    if (
        Array.isArray(value)
    ) {

        return value;

    }


    try {

        return JSON.parse(
            String(value)
        );

    } catch (error) {

        return [];

    }

}
function apiGet(action, params) {

    try {

        params =
            params || {};

        switch (action) {

            case "guru":

                return getGuru();

            case "addguru":
                return addGuru(data);

            case "karyawan":

                return getKaryawan();


            case "face":

                return getRegisteredFaces();


            case "userFace":

                return getUserFace(params.id);


            case "laporan":

                return getLaporan();


            case "getabsensisettings":

                return getAbsensiSettings();


            default:

                return {

                    success: false,

                    message:
                        "Action tidak ditemukan: " +
                        action,

                    data: []

                };

        }

    } catch (error) {

        return {

            success: false,

            message:
                error.toString(),

            data: []

        };

    }

}


function apiPost(action, data) {

    try {

        data = data || {};

        switch (action) {

            case "guru":
                return prosesGuru(data);

            case "addKaryawan":
                return addKaryawan(data);

            case "updatekaryawan":
                return updateKaryawan(data);

            case "deletekaryawan":
                return deleteKaryawan(data);

            case "registerkaryawanFace":
                return registerKaryawanFace(data);

            default:

                return {
                    success: false,
                    message:
                        "Action tidak ditemukan: " +
                        action,
                    data: []
                };

        }

    } catch (error) {

        return {
            success: false,
            message: error.toString(),
            data: []
        };

    }

}
function TEST_FACE() {

  const ss =
    SpreadsheetApp.openById(
      SPREADSHEET_ID
    );

  const sheet =
    ss.getSheetByName(
      SHEET_GURU
    );

  if (!sheet) {

    Logger.log(
      "SHEET GURU TIDAK DITEMUKAN"
    );

    return {
      success: false,
      data: []
    };
  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  Logger.log(
    "JUMLAH BARIS: " +
    values.length
  );

  Logger.log(
    "HEADER: " +
    JSON.stringify(values[0])
  );

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    Logger.log(
      "BARIS " +
      i +
      ": " +
      JSON.stringify(values[i])
    );

  }

  return {

    success: true,

    rows:
      values.length,

    header:
      values[0],

    data:
      values.slice(1)

  };

}
function simpanAbsensi(data) {

    console.log("===== CEK WAKTU ABSENSI =====");
    console.log("TIMEZONE:", Session.getScriptTimeZone());
    console.log("WAKTU SERVER:", new Date());

    try {

        data = data || {};

        const id =
            String(data.id || "").trim();

        const nip =
            String(data.nip || "").trim();

        const nama =
            String(data.nama || "").trim();

        const jabatan =
            String(data.jabatan || "").trim();
        
        const latitude =
            Number(data.latitude);

        const longitude =
            Number(data.longitude);

        const accuracy =
            Number(data.accuracy);

        const jarak =
            Number(data.jarak);


        if (!id) {

            return {
                success: false,
                message: "ID wajah tidak ditemukan.",
                data: []
            };

        }


        const ss =
            SpreadsheetApp.openById(
                SPREADSHEET_ID
            );


        const sheet =
            ss.getSheetByName(
                "Absensi"
            );


        if (!sheet) {

            return {
                success: false,
                message:
                    'Sheet "Absensi" tidak ditemukan.',
                data: []
            };

        }


        // =====================================
        // AMBIL SETTINGS
        // =====================================

        const settingsResult =
            getAbsensiSettings();


        if (
            !settingsResult ||
            settingsResult.success !== true
        ) {

            return {
                success: false,
                message:
                    "Pengaturan absensi gagal dimuat.",
                data: []
            };

        }


        const settings =
            settingsResult.data || {};


        // =====================================
        // SISTEM AKTIF?
        // =====================================

        if (
            settings.sistemAktif === false
        ) {

            return {
                success: false,
                message:
                    "Sistem absensi sedang tidak aktif.",
                data: []
            };

        }


        // =====================================
        // WAKTU SERVER
        // =====================================

        const timezone =
            Session.getScriptTimeZone();


        const sekarang = new Date();

        console.log("WAKTU SERVER:", sekarang);
        console.log(
            "WAKTU FORMAT:",
            Utilities.formatDate(
                sekarang,
                Session.getScriptTimeZone(),
                "yyyy-MM-dd HH:mm:ss"
            )
        );
        console.log(
            "TIMEZONE:",
            Session.getScriptTimeZone()
        );


        const jamSekarang =
            Utilities.formatDate(
                sekarang,
                timezone,
                "HH:mm"
            );


        const hariSekarang =
            Utilities.formatDate(
                sekarang,
                timezone,
                "EEEE"
            ).toLowerCase();


        // =====================================
        // CEK HARI KERJA
        // =====================================

        const hariMap = {

            monday: "senin",
            tuesday: "selasa",
            wednesday: "rabu",
            thursday: "kamis",
            friday: "jumat",
            saturday: "sabtu",
            sunday: "minggu"

        };


        const namaHari =
            hariMap[hariSekarang];


        const hariKerja =
            settings.hariKerja || {};


        if (
            namaHari &&
            hariKerja[namaHari] === false
        ) {

            return {
                success: false,
                message:
                    "Hari ini bukan hari kerja.",
                data: []
            };

        }


        // =====================================
        // KONVERSI JAM KE MENIT
        // =====================================

        function jamKeMenit(jam) {

            if (!jam) {
                return null;
            }

            const bagian =
                String(jam)
                    .split(":");

            if (
                bagian.length < 2
            ) {
                return null;
            }

            return (
                Number(bagian[0]) * 60 +
                Number(bagian[1])
            );

        }


        const menitSekarang =
            jamKeMenit(
                jamSekarang
            );
        
        const menitJamMasuk =
            jamKeMenit(
                settings.jamMasuk
            );


        const menitTerlambat =
            jamKeMenit(
                settings.batasTerlambat
            );


        const menitBatasMasuk =
            jamKeMenit(
                settings.batasMasuk
            );


        const menitJamPulang =
            jamKeMenit(
                settings.jamPulang
            );


        const menitBatasPulang =
            jamKeMenit(
                settings.batasPulang
            );

        console.log("MENIT SEKARANG:", menitSekarang);
        console.log("JAM MASUK:", settings.jamMasuk);
        console.log("BATAS TERLAMBAT:", settings.batasTerlambat);
        console.log("BATAS MASUK:", settings.batasMasuk);
        console.log("JAM PULANG:", settings.jamPulang);
        console.log("BATAS PULANG:", settings.batasPulang);
        console.log("MENIT JAM PULANG:", menitJamPulang);
        console.log("MENIT BATAS PULANG:", menitBatasPulang);


        // =====================================
        // VALIDASI SETTINGS
        // =====================================

        if (
            menitJamMasuk === null ||
            menitTerlambat === null ||
            menitBatasMasuk === null ||
            menitJamPulang === null ||
            menitBatasPulang === null
        ) {

            return {
                success: false,
                message:
                    "Pengaturan jam absensi tidak lengkap.",
                data: []
            };

        }


        // =====================================
        // CEK ABSENSI HARI INI
        // =====================================

        const hariIni =
            Utilities.formatDate(
                sekarang,
                timezone,
                "yyyy-MM-dd"
            );


        const values =
            sheet
                .getDataRange()
                .getValues();


        let jumlahAbsenHariIni = 0;

        let sudahMasuk = false;

        let sudahPulang = false;


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            const waktu =
                values[i][0];


            const rowId =
                String(
                    values[i][1] || ""
                ).trim();


            const status =
                String(
                    values[i][5] || ""
                )
                .trim()
                .toUpperCase();

            if (
                !waktu ||
                !rowId
            ) {
                continue;
            }


            const tanggal =
                Utilities.formatDate(
                    new Date(waktu),
                    timezone,
                    "yyyy-MM-dd"
                );


            if (
                tanggal === hariIni &&
                rowId === id
            ) {

                jumlahAbsenHariIni++;


                if (
                    status === "MASUK" ||
                    status === "MASUK TERLAMBAT"
                ) {

                    sudahMasuk = true;

                }

                if (
                    status === "PULANG"
                ) {

                    sudahPulang = true;

                }

            }

        }
        console.log("=== STATUS ABSENSI HARI INI ===");
        console.log("sudahMasuk:", sudahMasuk);
        console.log("sudahPulang:", sudahPulang);
        console.log("jumlahAbsenHariIni:", jumlahAbsenHariIni);
        if (jumlahAbsenHariIni === 0) {

            if (
                menitSekarang <
                menitJamMasuk
            ) {

                return {
                    success: false,
                    message:
                        "Absensi MASUK belum dibuka. Mulai pukul " +
                        settings.jamMasuk +
                        ".",
                    data: []
                };

            }

            if (
                menitSekarang >=
                menitBatasMasuk
            ) {

                return {
                    success: false,
                    message:
                        "Waktu absensi MASUK sudah ditutup pada pukul " +
                        settings.batasMasuk +
                        ".",
                    data: []
                };

            }
        


            // Terlambat atau tidak

            const terlambat =
                menitSekarang >
                menitTerlambat;


            const statusMasuk =
                terlambat &&
                settings.statusTerlambat !== false
                    ? "MASUK TERLAMBAT"
                    : "MASUK";


            sheet.appendRow([

                sekarang,

                id,

                nip,

                nama,

                jabatan,

                statusMasuk

            ]);


            return {

                success: true,

                message:
                    terlambat
                        ? "Absensi MASUK berhasil. Anda terlambat."
                        : "Absensi MASUK berhasil disimpan.",

                data: [{

                    id: id,

                    nip: nip,

                    nama: nama,

                    jabatan: jabatan,

                    status: statusMasuk,

                    waktu: sekarang

                }]

            };
        }

        if (jumlahAbsenHariIni === 1) {


            // Belum waktunya pulang

            if (
                menitSekarang <
                menitJamPulang
            ) {

                return {
                    success: false,
                    message:
                        "Absensi PULANG belum dibuka. Mulai pukul " +
                        settings.jamPulang +
                        ".",
                    data: []
                };

            }


            // Batas pulang sudah lewat

            if (
                menitSekarang >
                menitBatasPulang
            ) {

                return {
                    success: false,
                    message:
                        "Waktu absensi PULANG sudah ditutup pada pukul " +
                        settings.batasPulang +
                        ".",
                    data: []
                };

            }
        


            sheet.appendRow([

                sekarang,

                id,

                nip,

                nama,

                jabatan,

                "PULANG"

            ]);


            return {

                success: true,

                message:
                    "Absensi PULANG berhasil disimpan.",

                data: [{

                    id: id,

                    nip: nip,

                    nama: nama,

                    jabatan: jabatan,

                    status: "PULANG",

                    waktu: sekarang

                }]

            };
        }

        // =====================================
        // SUDAH LENGKAP
        // =====================================

        return {

            success: false,

            message:
                "Absensi hari ini sudah lengkap. MASUK dan PULANG sudah tercatat.",

            data: []

        };


    } catch (error) {

        console.error(
            "SIMPAN ABSENSI ERROR:",
            error
        );


        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}
function cekSpreadsheetAbsensi() {

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    const sheet = ss.getSheetByName("Absensi");

    console.log("NAMA SPREADSHEET:", ss.getName());
    console.log("ID SPREADSHEET:", ss.getId());
    console.log("SHEET ABSENSI ADA:", !!sheet);

    if (sheet) {
        console.log("NAMA SHEET:", sheet.getName());
        console.log("JUMLAH BARIS:", sheet.getLastRow());
        console.log("JUMLAH KOLOM:", sheet.getLastColumn());

        console.log(
            "DATA ABSENSI:",
            JSON.stringify(
                sheet.getDataRange().getValues()
            )
        );
    }
}
function simpanWajahFinal(data) {

    try {

        data = data || {};

        const id =
            String(
                data.id || ""
            ).trim();

        const nip =
            String(
                data.nip || ""
            ).trim();

        const nama =
            String(
                data.nama || ""
            ).trim();

        const descriptorText =
            String(
                data.descriptor ||
                data.faceDescriptor ||
                ""
            ).trim();


        /* =================================================
           VALIDASI DASAR
        ================================================= */

        if (!id) {

            throw new Error(
                "ID pengguna tidak ditemukan."
            );

        }

        if (!descriptorText) {

            throw new Error(
                "Face descriptor tidak ditemukan."
            );

        }


        let descriptor;


        try {

            descriptor =
                JSON.parse(
                    descriptorText
                );

        } catch (error) {

            throw new Error(
                "Format face descriptor tidak valid."
            );

        }


        if (
            !Array.isArray(descriptor) ||
            descriptor.length !== 128
        ) {

            throw new Error(
                "Descriptor wajah harus berisi 128 angka."
            );

        }


        const descriptorValid =
            descriptor.every(
                value =>
                    typeof value === "number" &&
                    Number.isFinite(value)
            );


        if (!descriptorValid) {

            throw new Error(
                "Descriptor wajah mengandung data yang bukan angka."
            );

        }


        /* =================================================
           SPREADSHEET
        ================================================= */

        const ss =
            SpreadsheetApp.openById(
                SPREADSHEET_ID
            );


        /* =================================================
           THRESHOLD DUPLIKAT
           Sama dengan threshold face recognition
        ================================================= */

        const DUPLICATE_FACE_THRESHOLD = 0.55;


        /* =================================================
           FUNGSI HITUNG JARAK WAJAH
        ================================================= */

        function hitungJarakFace(
            face1,
            face2
        ) {

            if (
                !Array.isArray(face1) ||
                !Array.isArray(face2) ||
                face1.length !== 128 ||
                face2.length !== 128
            ) {

                return Infinity;

            }


            let jumlah = 0;


            for (
                let i = 0;
                i < 128;
                i++
            ) {

                const selisih =
                    Number(face1[i]) -
                    Number(face2[i]);


                jumlah +=
                    selisih * selisih;

            }


            return Math.sqrt(
                jumlah
            );

        }


        /* =================================================
           CEK WAJAH YANG SUDAH TERDAFTAR
        ================================================= */

        function cekDuplikatPadaSheet(
            sheet,
            jenis,
            kolomFace
        ) {

            if (!sheet) {
                return null;
            }


            const values =
                sheet
                    .getDataRange()
                    .getValues();


            for (
                let i = 1;
                i < values.length;
                i++
            ) {

                const rowId =
                    String(
                        values[i][0] || ""
                    ).trim();


                /*
                 * Kalau ID sama, berarti
                 * ini orang yang sedang
                 * melakukan registrasi ulang.
                 *
                 * Jangan dianggap duplikat.
                 */

                if (
                    rowId === id
                ) {

                    continue;

                }


                const savedDescriptorText =
                    String(
                        values[i][kolomFace - 1] ||
                        ""
                    ).trim();


                if (
                    !savedDescriptorText
                ) {

                    continue;

                }


                let savedDescriptor;


                try {

                    savedDescriptor =
                        JSON.parse(
                            savedDescriptorText
                        );

                } catch (error) {

                    console.warn(
                        "Descriptor tidak valid pada " +
                        jenis +
                        " baris " +
                        (i + 1)
                    );

                    continue;

                }


                if (
                    !Array.isArray(
                        savedDescriptor
                    ) ||
                    savedDescriptor.length !== 128
                ) {

                    continue;

                }


                const distance =
                    hitungJarakFace(
                        descriptor,
                        savedDescriptor
                    );


                console.log(
                    "CEK WAJAH:",
                    jenis,
                    "ID:",
                    rowId,
                    "DISTANCE:",
                    distance
                );


                if (
                    distance <=
                    DUPLICATE_FACE_THRESHOLD
                ) {

                    return {

                        id:
                            rowId,

                        nama:
                            String(
                                values[i][2] ||
                                ""
                            ).trim(),

                        jenis:
                            jenis,

                        distance:
                            distance

                    };

                }

            }


            return null;

        }


        /* =================================================
           CEK GURU
        ================================================= */

        const guruSheet =
            ss.getSheetByName(
                SHEET_GURU
            );


        const duplikatGuru =
            cekDuplikatPadaSheet(
                guruSheet,
                "GURU",
                6
            );


        if (duplikatGuru) {

            throw new Error(
                "Wajah ini sudah terdaftar pada " +
                duplikatGuru.nama +
                " (" +
                duplikatGuru.jenis +
                "). Wajah yang sama tidak dapat digunakan untuk pengguna lain."
            );

        }


        /* =================================================
           CEK KARYAWAN
        ================================================= */

        const karyawanSheet =
            ss.getSheetByName(
                SHEET_KARYAWAN
            );


        const duplikatKaryawan =
            cekDuplikatPadaSheet(
                karyawanSheet,
                "KARYAWAN",
                7
            );


        if (duplikatKaryawan) {

            throw new Error(
                "Wajah ini sudah terdaftar pada " +
                duplikatKaryawan.nama +
                " (" +
                duplikatKaryawan.jenis +
                "). Wajah yang sama tidak dapat digunakan untuk pengguna lain."
            );

        }


        /* =================================================
           CARI PEMILIK ID
        ================================================= */

        let targetSheet =
            null;

        let targetRow =
            -1;

        let targetJenis =
            "";


        /* =================================================
           CARI DI GURU
        ================================================= */

        if (guruSheet) {

            const values =
                guruSheet
                    .getDataRange()
                    .getValues();


            for (
                let i = 1;
                i < values.length;
                i++
            ) {

                const rowId =
                    String(
                        values[i][0] || ""
                    ).trim();


                if (
                    rowId === id
                ) {

                    targetSheet =
                        guruSheet;

                    targetRow =
                        i + 1;

                    targetJenis =
                        "GURU";

                    break;

                }

            }

        }


        /* =================================================
           CARI DI KARYAWAN
        ================================================= */

        if (!targetSheet) {

            if (karyawanSheet) {

                const values =
                    karyawanSheet
                        .getDataRange()
                        .getValues();


                for (
                    let i = 1;
                    i < values.length;
                    i++
                ) {

                    const rowId =
                        String(
                            values[i][0] || ""
                        ).trim();


                    if (
                        rowId === id
                    ) {

                        targetSheet =
                            karyawanSheet;

                        targetRow =
                            i + 1;

                        targetJenis =
                            "KARYAWAN";

                        break;

                    }

                }

            }

        }


        /* =================================================
           PENGGUNA TIDAK DITEMUKAN
        ================================================= */

        if (
            !targetSheet ||
            targetRow < 2
        ) {

            throw new Error(
                "Pengguna dengan ID " +
                id +
                " tidak ditemukan pada Sheet Guru maupun Karyawan."
            );

        }


        /* =================================================
           SIMPAN DESCRIPTOR
        ================================================= */

        if (
            targetJenis === "GURU"
        ) {

            targetSheet
                .getRange(
                    targetRow,
                    6
                )
                .setValue(
                    descriptorText
                );

        }

        else if (
            targetJenis === "KARYAWAN"
        ) {

            targetSheet
                .getRange(
                    targetRow,
                    7
                )
                .setValue(
                    descriptorText
                );

        }


        /* =================================================
           PAKSA SIMPAN
        ================================================= */

        SpreadsheetApp.flush();


        /* =================================================
           VERIFIKASI
        ================================================= */

        const savedValue =
            targetSheet
                .getRange(
                    targetRow,
                    targetJenis === "GURU"
                        ? 6
                        : 7
                )
                .getValue();


        if (!savedValue) {

            throw new Error(
                "Descriptor gagal diverifikasi setelah disimpan."
            );

        }


        /* =================================================
           RESPONSE
        ================================================= */

        return {

            success: true,

            message:
                "Wajah berhasil didaftarkan untuk " +
                nama +
                " (" +
                targetJenis +
                ").",

            data: [{

                id:
                    id,

                nip:
                    nip,

                nama:
                    nama,

                jenis:
                    targetJenis,

                descriptorLength:
                    descriptor.length

            }]

        };


    } catch (error) {

        console.error(
            "SIMPAN WAJAH ERROR:",
            error
        );


        return {

            success: false,

            message:
                String(
                    error.message ||
                    error
                ),

            data: []

        };

    }

}
function getAbsensiSettings() {

    try {

        const ss =
            SpreadsheetApp.openById(
                SPREADSHEET_ID
            );

        let sheet =
            ss.getSheetByName(
                SETTINGS_SHEET
            );


        if (!sheet) {

            sheet =
                ss.insertSheet(
                    SETTINGS_SHEET
                );

            sheet.appendRow([
                "Key",
                "Value"
            ]);

            const defaults = {

                jamMasuk: "07:00",

                batasTerlambat: "07:15",

                batasMasuk: "09:00",

                toleransi: 15,

                jamPulang: "15:00",

                batasPulang: "17:00",

                hariKerja:
                    JSON.stringify({

                        senin: true,
                        selasa: true,
                        rabu: true,
                        kamis: true,
                        jumat: true,
                        sabtu: false,
                        minggu: false

                    }),

                sistemAktif: true,

                autoLock: true,

                statusTerlambat: true

            };


            Object.keys(
                defaults
            ).forEach(
                function(key) {

                    sheet.appendRow([
                        key,
                        typeof defaults[key] ===
                        "object"
                            ? JSON.stringify(
                                defaults[key]
                            )
                            : defaults[key]
                    ]);

                }
            );

        }


        const values =
            sheet
                .getDataRange()
                .getValues();


        const result = {};


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            const key =
                String(
                    values[i][0] || ""
                ).trim();

            const value =
                values[i][1];


            if (!key) {
                continue;
            }


            if (
                key === "toleransi"
            ) {

                result[key] =
                    Number(value);

            } else if (
                key === "sistemAktif" ||
                key === "autoLock" ||
                key === "statusTerlambat"
            ) {

                result[key] =
                    String(value)
                        .toLowerCase() ===
                    "true";

            } else if (
                key === "hariKerja"
            ) {

                try {

                    result[key] =
                        JSON.parse(
                            String(value)
                        );

                } catch (e) {

                    result[key] = {};

                }
                
                        } else if (
                value instanceof Date
            ) {
              
                  result[key] =
                        Utilities.formatDate(
                        value,
                        Session.getScriptTimeZone(),
                        "HH:mm"
                        );

            } else {

                result[key] =
                    String(value || "");

    }

}


        return {

            success: true,

            message:
                "Pengaturan berhasil dimuat.",

            data: result

        };


    } catch (error) {

        return {

            success: false,

            message: String(error),

            data: []

        };

    }

}


function saveAbsensiSettings(data) {

    try {

        const ss =
            SpreadsheetApp.openById(
                SPREADSHEET_ID
            );


        let sheet =
            ss.getSheetByName(
                SETTINGS_SHEET
            );


        if (!sheet) {

            sheet =
                ss.insertSheet(
                    SETTINGS_SHEET
                );

            sheet.appendRow([
                "Key",
                "Value"
            ]);

        }


        const settings = {

            jamMasuk:
                data.jamMasuk,

            batasTerlambat:
                data.batasTerlambat,

            batasMasuk:
                data.batasMasuk,

            toleransi:
                Number(
                    data.toleransi || 0
                ),

            jamPulang:
                data.jamPulang,

            batasPulang:
                data.batasPulang,

            hariKerja:
                JSON.stringify(
                    data.hariKerja || {}
                ),

            sistemAktif:
                Boolean(
                    data.sistemAktif
                ),

            autoLock:
                Boolean(
                    data.autoLock
                ),

            statusTerlambat:
                Boolean(
                    data.statusTerlambat
                )

        };


        const values =
            sheet
                .getDataRange()
                .getValues();


        Object.keys(
            settings
        ).forEach(
            function(key) {

                let found = false;


                for (
                    let i = 1;
                    i < values.length;
                    i++
                ) {

                    if (
                        String(
                            values[i][0] ||
                            ""
                        ).trim() === key
                    ) {

                        sheet
                            .getRange(
                                i + 1,
                                2
                            )
                            .setValue(
                                settings[key]
                            );

                        found = true;

                        break;

                    }

                }


                if (!found) {

                    sheet.appendRow([
                        key,
                        settings[key]
                    ]);

                }

            }
        );


        SpreadsheetApp.flush();


        return {

            success: true,

            message:
                "Pengaturan absensi berhasil disimpan.",

            data: []

        };


    } catch (error) {

        return {

            success: false,

            message: String(error),

            data: []

        };

    }

}
function prosesLogin(data) {

    try {

        const username =
            String(
                data.username || ""
            ).trim();

        const password =
            String(
                data.password || ""
            );

        if (!username) {

            return {

                success: false,

                message:
                    "Username wajib diisi.",

                data: []

            };

        }

        if (!password) {

            return {

                success: false,

                message:
                    "Password wajib diisi.",

                data: []

            };

        }


        const sheet =
            getSheet(
                SHEET.LOGIN
            );


        const values =
            sheet
                .getDataRange()
                .getValues();


        if (
            values.length < 2
        ) {

            return {

                success: false,

                message:
                    "Data login belum tersedia.",

                data: []

            };

        }


        // =================================================
        // HEADER LOGIN
        // =================================================

        const header =
            values[0]
                .map(function (item) {

                    return String(
                        item || ""
                    )
                    .trim()
                    .toLowerCase();

                });


        // Cari posisi kolom secara fleksibel
        const usernameIndex =
            cariKolom(
                header,
                [
                    "username",
                    "user",
                    "email"
                ]
            );


        const passwordIndex =
            cariKolom(
                header,
                [
                    "password",
                    "pass",
                    "kata sandi"
                ]
            );


        const idIndex =
            cariKolom(
                header,
                [
                    "id"
                ]
            );


        const namaIndex =
            cariKolom(
                header,
                [
                    "nama",
                    "name"
                ]
            );


        const roleIndex =
            cariKolom(
                header,
                [
                    "role",
                    "hak akses",
                    "level"
                ]
            );


        // Jika header tidak ditemukan,
        // gunakan posisi default
        const uIndex =
            usernameIndex >= 0
                ? usernameIndex
                : 0;

        const pIndex =
            passwordIndex >= 0
                ? passwordIndex
                : 1;


        for (
            let i = 1;
            i < values.length;
            i++
        ) {

            const row =
                values[i];


            const dbUsername =
                String(
                    row[uIndex] || ""
                ).trim();


            const dbPassword =
                String(
                    row[pIndex] || ""
                );


            if (
                dbUsername === username &&
                dbPassword === password
            ) {

                return {

                    success: true,

                    message:
                        "Login berhasil.",

                    data: {

                        id:
                            idIndex >= 0
                                ? row[idIndex]
                                : "",

                        username:
                            dbUsername,

                        nama:
                            namaIndex >= 0
                                ? row[namaIndex]
                                : "",

                        role:
                            roleIndex >= 0
                                ? row[roleIndex]
                                : "admin"

                    }

                };

            }

        }


        return {

            success: false,

            message:
                "Username atau password salah.",

            data: []

        };


    } catch (error) {

        console.error(
            "PROSES LOGIN ERROR:",
            error
        );


        return {

            success: false,

            message:
                String(error),

            data: []

        };

    }

}
function cariKolom(
    header,
    daftarNama
) {

    for (
        let i = 0;
        i < header.length;
        i++
    ) {

        const nama =
            String(
                header[i] || ""
            )
            .trim()
            .toLowerCase();


        for (
            let j = 0;
            j < daftarNama.length;
            j++
        ) {

            if (
                nama ===
                String(
                    daftarNama[j]
                )
                .trim()
                .toLowerCase()
            ) {

                return i;

            }

        }

    }

    return -1;

}