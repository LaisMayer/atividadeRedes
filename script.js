(async () => {
    const JUDGE0_URL = "http://judge.darlon.com.br";

 
    const source_code = `print(input())`;

    // Entrada padrão
    const stdin = "Olá, Turma!";

    // Codificar para Base64
    const encoded_source = btoa(unescape(encodeURIComponent(source_code)));
    const encoded_stdin  = btoa(unescape(encodeURIComponent(stdin)));

    // Montar o payload
    const payload = {
        source_code: encoded_source,
        language_id: 71, // Python 3.x
        stdin: encoded_stdin,
        base64_encoded: true,
        wait: true
    };

    try {
        const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // Decodificar saída e erros
        const stdout = result.stdout ? decodeURIComponent(escape(atob(result.stdout))) : "";
        const stderr = result.stderr ? decodeURIComponent(escape(atob(result.stderr))) : "";

        console.log("Status:", result.status?.description);
        console.log("Saída padrão:", stdout);
        console.log("Erros:", stderr);

        // Mostrar no HTML
        document.getElementById("resultado").innerHTML = `
            <h3>Status: ${result.status?.description}</h3>
            <pre><strong>Saída:</strong> ${stdout}</pre>
            <pre><strong>Erros:</strong> ${stderr}</pre>
        `;
    } catch (error) {
        console.error("Erro:", error);
        document.getElementById("resultado").innerHTML = `
            <p style="color:red;">Erro: ${error.message}</p>
        `;
    }
})();
