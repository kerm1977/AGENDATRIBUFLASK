# -*- coding: utf-8 -*-
"""Comprueba que los modulos JS se cargan en orden y reconstruyen el original."""
from pathlib import Path

BASE = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")
ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")
SALTO = b"\r\n"

lineas = ORIGINAL.read_bytes().split(SALTO)

# Bloque <script> lineas 2889-11779
esperado = SALTO.join(lineas[2888:11779])

modulos = [
    "00-estado.js", "01-datos.js", "02-navegacion.js", "03-utilidades.js",
    "04-ajustes.js", "05-caminatas.js", "06-directorio.js", "07-notas.js", "99-inicio.js",
]
partes = []
for m in modulos:
    p = BASE / "static" / "js" / m
    partes.append(p.read_bytes().rstrip(SALTO))
reconstruido = SALTO.join(partes)

print(f"Original esperado : {len(esperado)} bytes")
print(f"Reconstruido      : {len(reconstruido)} bytes")
print(f"Iguales           : {esperado == reconstruido}")
