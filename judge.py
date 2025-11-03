import requests
import base64

JUDGE0_URL = "http://judge.darlon.com.br"

codigo = input("Digite o código Python:\n")

entradas = []
saidas_esperadas = []

for i in range(1, 4):
    entrada = input(f"Digite o input {i}: ")
    saida = input(f"Digite o output esperado {i}: ")
    entradas.append(entrada)
    saidas_esperadas.append(saida)

encoded_source = base64.b64encode(codigo.encode("utf-8")).decode("utf-8")

for i, entrada in enumerate(entradas):
    esperado = saidas_esperadas[i]
    encoded_stdin = base64.b64encode(entrada.encode("utf-8")).decode("utf-8")

    payload = {
        "source_code": encoded_source,
        "language_id": 71,  # Python 3
        "stdin": encoded_stdin,
        "base64_encoded": True,
        "wait": True
    }

    response = requests.post(f"{JUDGE0_URL}/submissions?base64_encoded=true&wait=true", json=payload)
    result = response.json()

    stdout = base64.b64decode(result.get("stdout") or "").decode("utf-8", errors="ignore").strip()
    stderr = base64.b64decode(result.get("stderr") or "").decode("utf-8", errors="ignore").strip()
    status = result["status"]["description"]

    print(f"\n🔹 Teste {i+1}")
    print(f"Entrada: {entrada}")
    print(f"Saída obtida: {stdout}")
    print(f"Saída esperada: {esperado}")
    print(f"Status: {status}")

    if stdout == esperado:
        print("CORRETO")
    else:
        print("INCORRETO")

    if stderr:
        print("Erros:", stderr)
