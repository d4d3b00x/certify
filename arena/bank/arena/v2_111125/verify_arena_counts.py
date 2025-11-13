import boto3
from collections import defaultdict

# Nombre de tu tabla DynamoDB
TABLE_NAME = "arenaQuestions"

# Crear cliente DynamoDB
dynamodb = boto3.client("dynamodb")

# Contadores
counts = defaultdict(lambda: defaultdict(int))

print(f"🔍 Escaneando la tabla '{TABLE_NAME}'...")

# Escanear toda la tabla (usa paginación automática)
paginator = dynamodb.get_paginator("scan")
page_iterator = paginator.paginate(TableName=TABLE_NAME, ProjectionExpression="cert, difficulty")

total = 0
for page in page_iterator:
    for item in page.get("Items", []):
        cert = item.get("cert", {}).get("S", "unknown")
        diff = item.get("difficulty", {}).get("S", "unknown")
        counts[cert][diff] += 1
        total += 1

# Mostrar resultados
print("\n📊 Resultados de conteo por certificación y dificultad:")
for cert in sorted(counts.keys()):
    print(f"\n{cert}")
    for diff, count in sorted(counts[cert].items()):
        print(f"  - {diff:<8}: {count}")

print(f"\n🧮 Total general: {total} items en la tabla '{TABLE_NAME}'")
