const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;

// URL base do serviço Judge0
const JUDGE0_URL = "http://judge.darlon.com.br"; 

app.use(express.json()); // Middleware para parsear o body JSON

// Habilita CORS (necessário para que o frontend HTML/JS possa se comunicar)
app.use((req, res, next) => {
    // Permite requisições de qualquer origem (ou 'http://127.0.0.1:5500' se souber o endereço exato)
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Função para codificar em Base64
const encodeBase64 = (str) => Buffer.from(str, 'utf8').toString('base64');

// Função para decodificar de Base64
const decodeBase64 = (str) => Buffer.from(str, 'base64').toString('utf8');

// Rota de execução que o frontend chama
app.post('/executar', async (req, res) => {
    // Recebe o ID da linguagem do frontend
    const { codigo, entradas, saidas, linguagemId } = req.body; 
    let resultadoFormatado = "Detalhes da Execução:\n\n";

    // Codifica o código fonte
    const encodedSource = encodeBase64(codigo);

    for (let i = 0; i < entradas.length; i++) {
        const entrada = entradas[i];
        const esperado = saidas[i];

        // Se o teste não tem entrada OU saída esperada, ignoramos
        if (!entrada && !esperado) { 
            resultadoFormatado += `🔹 Teste ${i+1}: Ignorado (Entrada e Saída Esperada vazias).\n\n`;
            continue;
        }
        
        const encodedStdin = encodeBase64(entrada || ''); // Codifica entrada vazia se não houver
        
        const payload = {
            source_code: encodedSource,
            language_id: parseInt(linguagemId), // Usa o ID da linguagem selecionada
            stdin: encodedStdin,
            base64_encoded: true,
            wait: true 
        };

        try {
            const judge0Res = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, payload);
            const result = judge0Res.data;

            // Decodifica a saída e o erro
            const stdout = decodeBase64(result.stdout || "").trim();
            const stderr = decodeBase64(result.stderr || "").trim();
            const status = result.status.description;

            // Compara e formata o resultado
            const statusCorreto = (status === "Accepted" && stdout === esperado);
            const statusText = statusCorreto ? "CORRETO ✅" : "INCORRETO ❌";
            
            resultadoFormatado += `🔹 Teste ${i+1} - Status: ${status} (${statusText})\n`;
            resultadoFormatado += `  Entrada: ${entrada || '(Vazio)'}\n`;
            resultadoFormatado += `  Saída Obtida: ${stdout || '(Vazio)'}\n`;
            resultadoFormatado += `  Saída Esperada: ${esperado}\n`;
            
            if (stderr) {
                resultadoFormatado += `  Erros (Stderr): ${stderr}\n`;
            }
            resultadoFormatado += "\n";

        } catch (error) {
            console.error(`Erro ao executar Teste ${i+1}:`, error.message);
            resultadoFormatado += `🔹 Teste ${i+1}: Erro de comunicação ou Judge0. (Detalhe: ${error.message})\n\n`;
        }
    }

    res.json({ resultado: resultadoFormatado });
});

app.listen(port, () => {
    console.log(`Servidor Node.js rodando em http://127.0.0.1:${port}`);
});