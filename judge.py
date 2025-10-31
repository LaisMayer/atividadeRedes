import requests
import base64

#IP="10.231.181.196"
#PORT="2358"

#JUDGE0_URL = f"http://{IP}:{PORT}"
JUDGE0_URL = "http://judge.darlon.com.br"

# Código Python a ser executado
source_code = """
print(input())
"""

# Entrada padrão (stdin)
stdin = """Olá, Turma!"""

# Converter ambos para Base64
encoded_source = base64.b64encode(source_code.encode("utf-8")).decode("utf-8")
encoded_stdin  = base64.b64encode(stdin.encode("utf-8")).decode("utf-8")

# Payload
payload = {
    "source_code": encoded_source,
    "language_id": 71,  # Python 3.x
    "stdin": encoded_stdin,
    "base64_encoded": True,
    "wait": True
}

# Enviar submissão
response = requests.post(f"{JUDGE0_URL}/submissions?base64_encoded=true&wait=true", json=payload)
result = response.json()

# Decodificar saída (vem em Base64)
stdout = base64.b64decode(result.get("stdout") or "").decode("utf-8", errors="ignore")
stderr = base64.b64decode(result.get("stderr") or "").decode("utf-8", errors="ignore")

print("Status:", result["status"]["description"])
print("Saída padrão:", stdout)
print("Erros:", stderr)

