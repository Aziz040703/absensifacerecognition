const API_URL =
    "https://script.google.com/macros/s/AKfycbyQEnPcFYGuqerr7PdrUtJNCx4czqFW7k3C9QTTWSoTKFJ2u-XT3Mw70etl8-kAMrL44A/exec";


/* =====================================================
   GET API - JSONP
===================================================== */

function apiGet(action, params = {}) {

    return new Promise((resolve, reject) => {

        const callbackName =
            "apiCallback_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2);

        const script =
            document.createElement("script");

        const query =
            new URLSearchParams();

        query.set("action", action);
        query.set("callback", callbackName);

        Object.keys(params).forEach(key => {

            if (
                params[key] !== undefined &&
                params[key] !== null
            ) {
                query.set(
                    key,
                    params[key]
                );
            }

        });

        let selesai = false;

        const timer = setTimeout(() => {

            if (selesai) return;

            selesai = true;

            delete window[callbackName];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }

            reject(
                new Error(
                    "Timeout menghubungi Google Apps Script."
                )
            );

        }, 15000);


        window[callbackName] =
            function(response) {

                if (selesai) return;

                selesai = true;

                clearTimeout(timer);

                delete window[callbackName];

                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }

                resolve(response);

            };

        console.log(
            "API GET URL:",
            API_URL + "?" + query.toString()
        );
        script.src =
            API_URL +
            "?" +
            query.toString();


        script.onerror =
            function() {

                if (selesai) return;

                selesai = true;

                clearTimeout(timer);

                delete window[callbackName];

                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }

                reject(
                    new Error(
                        "Gagal menghubungi Google Apps Script."
                    )
                );

            };


        document.head.appendChild(script);

    });

}
async function apiPost(
    action,
    data = {}
) {

    const response =
        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify({

                        action:
                            action,

                        data:
                            data

                    })
            }
        );


    const text =
        await response.text();


    try {

        return JSON.parse(
            text
        );

    } catch (error) {

        console.error(
            "API POST RESPONSE:",
            text
        );

        throw new Error(
            "Response API tidak valid."
        );

    }

}
