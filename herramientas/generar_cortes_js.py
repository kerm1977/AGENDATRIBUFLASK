# -*- coding: utf-8 -*-
"""Genera una lista de cortes JS < 200 lineas respetando funciones enteras."""
import re
from pathlib import Path

ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")
SALTO = "\r\n"

BLOQUE_DESDE, BLOQUE_HASTA = 2889, 11779
LIMITE = 200

lineas = ORIGINAL.read_bytes().decode("utf-8").split(SALTO)

# Leer secciones de maepar_js.py o calcularlas
secciones = []
for i in range(BLOQUE_DESDE - 1, BLOQUE_HASTA):
    s = lineas[i]
    m = re.search(r'^\s*// (?:---|\*\*\*|===|\s+MÓDULO|BLOQUE|INICIO|FIN)(.+)', s)
    if m:
        secciones.append((i + 1, m.group(1).strip()))

# Funciones
funciones = []
for i in range(BLOQUE_DESDE - 1, BLOQUE_HASTA):
    s = lineas[i]
    m = re.search(r'^\s*(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(', s)
    if m:
        funciones.append((i + 1, m.group(1)))

# Asignar a cada funcion su seccion
funcion_a_seccion = []
seccion_idx = 0
for l, n in funciones:
    while seccion_idx + 1 < len(secciones) and secciones[seccion_idx + 1][0] <= l:
        seccion_idx += 1
    funcion_a_seccion.append((l, n, secciones[seccion_idx][1]))

# Generar cortes: agrupar funciones hasta ~200 lineas, sin partir
cortes = []
arch_idx = 4
inicio = BLOQUE_DESDE
for i in range(len(funciones)):
    fin = (funciones[i + 1][0] - 1) if i + 1 < len(funciones) else BLOQUE_HASTA
    longitud = fin - inicio + 1
    if longitud > LIMITE:
        # Cerrar corte anterior en la funcion anterior
        cierre = funciones[i][0] - 1
        cortes.append((inicio, cierre, funciones[i - 1][2] if i > 0 else 'inicio'))
        inicio = funciones[i][0]
    # Si la funcion actual sola excede el limite, hay que partirla (lo evitaremos)
    if i == len(funciones) - 1:
        cortes.append((inicio, BLOQUE_HASTA, funciones[i][2]))

# Si no se activo el cierre, añadir el ultimo
if cortes and cortes[-1][1] != BLOQUE_HASTA:
    if inicio < BLOQUE_HASTA:
        cortes.append((inicio, BLOQUE_HASTA, funcion_a_seccion[-1][2]))

# Imprimir como lista Python
print("CORTES_JS = [")
for desde, hasta, desc in cortes:
    n = hasta - desde + 1
    nom = re.sub(r'[^A-Za-z0-9áéíóúñ\s/]', '', desc).strip().replace('/', ' ').replace('  ', ' ').replace(' ', '-').lower()[:40]
    # dejar legible
    nom = re.sub(r'[^a-z0-9-]', '', nom).strip('-') or 'modulo'
    print(f'    ("static/js/{desde}-{hasta}-{nom}.js", {desde}, {hasta}, "{desc}"),  # {n} lineas')
print("]")
