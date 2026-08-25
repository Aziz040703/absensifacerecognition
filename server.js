const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5500;

// ======================================================
// MASUKKAN URL WEB APP GOOGLE APPS SCRIPT KITA DI SINI
// ======================================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz8Iy0tWwnWcjqbkeN_JLvxNyagy2LX0TGOrZX_NYR_ZGo3drbXBLyJdkjQtWpiXAXc/exec";

// ======================================================
// MIME TYPE
// ======================================================

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
};

// ======================================================
// SERVER
// ======================================================

const server = http.createServer(async (req, res) => {

    // ==================================================
    // API PROXY
    // ==================================================

    if (req.url === "/api" && req.method === "POST") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", async () => {

            try {

                console.log("API REQUEST:");
                console.log(body);

                const response = await fetch(
                    GOOGLE_SCRIPT_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "text/plain;charset=utf-8"
                        },

                        body: body,

                        redirect: "follow"
                    }
                );

                const responseText =
                    await response.text();

                console.log(
                    "API STATUS:",
                    response.status
                );

                console.log(
                    "API RESPONSE:",
                    responseText
                );

                res.writeHead(
                    response.status,
                    {
                        "Content-Type":
                            response.headers.get(
                                "content-type"
                            ) ||
                            "application/json; charset=utf-8",

                        "Access-Control-Allow-Origin":
                            "*"
                    }
                );

                res.end(responseText);

            } catch (error) {

                console.error(
                    "PROXY ERROR:",
                    error
                );

                res.writeHead(
                    500,
                    {
                        "Content-Type":
                            "application/json; charset=utf-8",

                        "Access-Control-Allow-Origin":
                            "*"
                    }
                );

                res.end(
                    JSON.stringify({
                        success: false,
                        message:
                            "Proxy error: " +
                            error.message
                    })
                );
            }
        });

        return;
    }

    // ==================================================
    // STATIC FILE
    // ==================================================

    let requestPath =
        decodeURIComponent(
            req.url.split("?")[0]
        );

    if (requestPath === "/") {
        requestPath = "/HTML/dashboard.html";
    }

    const filePath = path.join(
        __dirname,
        requestPath
    );

    // Keamanan: cegah akses keluar folder project
    if (!filePath.startsWith(__dirname)) {

        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, data) => {

        if (error) {

            res.writeHead(404, {
                "Content-Type":
                    "text/plain; charset=utf-8"
            });

            res.end(
                "File tidak ditemukan: " +
                requestPath
            );

            return;
        }

        const ext =
            path.extname(filePath)
                .toLowerCase();

        const contentType =
            mimeTypes[ext] ||
            "application/octet-stream";

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(data);
    });
});

// ======================================================
// START SERVER
// ======================================================

server.listen(
    PORT,
    "127.0.0.1",
    () => {

        console.log("");
        console.log(
            "=========================================="
        );

        console.log(
            " SISTEM ABSENSI SMK TEUKU UMAR"
        );

        console.log(
            "=========================================="
        );

        console.log(
            "Server berjalan:"
        );

        console.log(
            `http://127.0.0.1:${PORT}`
        );

        console.log("");

        console.log(
            "API Proxy:"
        );

        console.log(
            `http://127.0.0.1:${PORT}/api`
        );

        console.log("");

        console.log(
            "Google Apps Script:"
        );

        console.log(
            GOOGLE_SCRIPT_URL
        );

        console.log("");
    }
);