# -*- coding: utf-8 -*-
"""Mapea funciones y secciones del bloque <script> del original."""
import re
from pathlib import Path

ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")
SALTO = "\r\n"

BLOQUE_DESDE, BLOQUE_HASTA = 2889, 11779

lineas = ORIGINAL.read_bytes().decode("utf-8").split(SALTO)

# Encontrar todos los comentarios de seccion y declaraciones de funcion
secciones = []
funciones = []
for i in range(BLOQUE_DESDE - 1, BLOQUE_HASTA):
    linea = lineas[i]
    # comentarios de seccion
    m = re.search(r'^\s*// (?:---|\*\*\*|===|/|\s+MÓDULO|BLOQUE|INICIO|FIN)(.+)', linea)
    if m:
        secciones.append((i + 1, linea.strip()))
    # declaraciones de funcion
    m = re.search(r'^\s*(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(', linea)
    if m:
        funciones.append((i + 1, m.group(1)))

print(f"BLOQUE JS: {BLOQUE_DESDE}-{BLOQUE_HASTA} ({BLOQUE_HASTA - BLOQUE_DESDE + 1} lineas)")
print(f"\nSECCIONES ({len(secciones)}):")
for l, t in secciones:
    print(f"  {l:>6}: {t[:90]}")

print(f"\nFUNCIONES ({len(funciones)}):")
for l, n in funciones:
    print(f"  {l:>6}: {n}")
