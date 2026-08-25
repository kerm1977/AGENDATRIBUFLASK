# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sqlite3

BASE = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")

# Todos los archivos relevantes por extension
archivos = sorted(
    p for p in BASE.rglob("*")
    if p.is_file()
    and p.suffix in {".html", ".js", ".css", ".py", ".txt", ".json"}
    and "__pycache__" not in p.parts
    and p.name != "tribu.sqlite"
)

print("ARCHIVOS CON MAS LINEAS")
print("=" * 80)
resultados = []
for p in archivos:
    try:
        n = len(p.read_bytes().decode("utf-8").split("\r\n"))
    except Exception:
        continue
    resultados.append((p.relative_to(BASE), n, p.stat().st_size))

resultados.sort(key=lambda x: x[1], reverse=True)
for r, n, s in resultados:
    print(f"{n:>7} lineas {s:>10} bytes  {r}")

print("\n" + "=" * 80)
print("ALERTAS: archivos con mas de 200 lineas")
for r, n, s in resultados:
    if n > 200:
        print(f"  {r} ({n} lineas)")
