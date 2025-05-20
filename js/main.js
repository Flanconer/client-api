const ordenPrefijo = "IRON";

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const outputText = document.getElementById("outputText");
    const msgText = document.getElementById("msgText");
    const respuestaElemento = document.getElementById("respuesta");

    if (!respuestaElemento) {
        console.error("Elemento con ID 'respuesta' no encontrado en el DOM.");
        return;
    }

    let recognition;
    let stoppedManually = false;

    outputText.innerHTML = `Di ${ordenPrefijo} para interactuar`;

    if ("webkitSpeechRecognition" in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "es-ES";
    } else {
        alert("Tu navegador no soporta reconocimiento de voz.");
        return;
    }

    startBtn.addEventListener("click", () => {
        stoppedManually = false;
        recognition.start();
        startBtn.disabled = true;
        outputText.textContent = `Escuchando... Di ${ordenPrefijo} para interactuar.`;
        msgText.innerHTML = "";
    });

    recognition.onresult = async (event) => {
        let transcript = event.results[event.results.length - 1][0].transcript.trim().toUpperCase();
        console.log("Texto reconocido:", transcript);

        if (transcript.includes(ordenPrefijo + " DETENTE")) {
            stoppedManually = true;
            recognition.stop();
            startBtn.disabled = false;
            outputText.textContent = "Detenido. Presiona el botón para comenzar nuevamente.";
            msgText.innerHTML = "";
        } else if (transcript.includes(ordenPrefijo)) {
            // Enviar la frase completa incluyendo "IRON"
            outputText.innerHTML = `Mensaje detectado: "<strong><em>${transcript}</em></strong>"`;
            msgText.innerHTML = "Enviando mensaje...";
            await enviarMensaje(transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error("Error en el reconocimiento:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            alert("Error: El micrófono no tiene permisos o fue bloqueado.");
        } else if (event.error === "network") {
            alert("Error: Problema de conexión con el servicio de reconocimiento de voz.");
        }
        recognition.stop();
        startBtn.disabled = false;
    };

    recognition.onend = () => {
        if (!stoppedManually) {
            msgText.innerHTML = "El reconocimiento de voz se detuvo inesperadamente<br>Habla nuevamente para continuar...";
            recognition.start();
        }
    };

    async function enviarMensaje(inputMensaje) {
        const url = "http://3.239.36.162/api-gpt-php/endpoints/chat.php";
        const datos = { message: inputMensaje };

        console.log("Enviando datos a la API:", datos);

        try {
            const respuesta = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            console.log("Respuesta HTTP:", respuesta.status);

            const textoRespuesta = await respuesta.text(); // Lee la respuesta como texto
            console.log("Texto bruto de la API:", textoRespuesta);

            const resultado = JSON.parse(textoRespuesta); // Convierte a JSON
            console.log("Respuesta parseada de la API:", resultado);

            if (resultado?.status === 200 && resultado?.data?.reply) {
                respuestaElemento.textContent = resultado.data.reply;
            } else {
                respuestaElemento.textContent = "La API respondió, pero sin datos válidos.";
            }
        } catch (error) {
            respuestaElemento.textContent = "Error en la conexión con la API.";
            console.error("Error en fetch:", error);
        }
    }
});
