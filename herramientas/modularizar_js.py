# -*- coding: utf-8 -*-
"""
Subdivide los modulos JS grandes (05-caminatas.js, 06-directorio.js)
en archivos de menos de 200 lineas respetando funciones enteras.
"""
import re
from pathlib import Path

BASE = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")
LIMITE = 200
SALTO = "\r\n"


def cortar_modulo(nombre_archivo, prefijo):
    ruta = BASE / "static" / "js" / nombre_archivo
    lineas = ruta.read_bytes().decode("utf-8").split(SALTO)

    # Inicios de cada funcion (linea 0-based)
    funcs = []
    for i, l in enumerate(lineas):
        if re.match(r"^(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(", l):
            funcs.append(i)

    if not funcs:
        print(f"No se encontraron funciones en {nombre_archivo}")
        return []

    # Inicios de corte: 0 y cada funcion
    inicios = [0] + funcs
    # Fines: final del archivo y antes de cada funcion despues de la primera
    fines = [f - 1 for f in funcs[1:]] + [len(lineas) - 1]

    # Cortes candidatos: desde inicio[i] hasta fines[i]
    candidatos = []
    for ini, fin in zip(inicios, fines):
        candidatos.append((ini, fin))

    # Agrupar hasta que no excedan LIMITE lineas
    grupos = []
    g_inicio = 0
    for ini, fin in candidatos:
        if ini == g_inicio:
            # primer fragmento empieza en 0
            pass
        if fin - g_inicio + 1 > LIMITE:
            # cerrar grupo anterior antes de ini
            grupos.append((g_inicio, ini - 1, lineas[ini - 1] if ini > 0 else lineas[0]))
            g_inicio = ini
    grupos.append((g_inicio, len(lineas) - 1, lineas[g_inicio]))

    archivos = []
    for i, (desde, hasta, nombre_linea) in enumerate(grupos, start=1):
        m = re.search(r"function\s+([A-Za-z0-9_]+)", nombre_linea)
        nom = m.group(1) if m else "modulo"
        nom_arch = f"{prefijo}{i:02d}-{nom}.js"
        ruta_dest = BASE / "static" / "js" / nom_arch
        contenido = SALTO.join(lineas[desde:hasta + 1])
        ruta_dest.write_bytes(contenido.encode("utf-8"))
        archivos.append(nom_arch)
        print(f"  {nom_arch:<34} {hasta - desde + 1:>4} lineas")

    return archivos


def actualizar_base(archivos05, archivos06):
    base = BASE / "templates" / "base.html"
    texto = base.read_bytes().decode("utf-8")

    texto = re.sub(r"\s*<script src=\"\{\{\s*url_for\('static',\s*filename='js/05-caminatas\.js'\s*\)\s*\}\}\"></script>\r?\n?", "", texto)
    texto = re.sub(r"\s*<script src=\"\{\{\s*url_for\('static',\s*filename='js/06-directorio\.js'\s*\)\s*\}\}\"></script>\r?\n?", "", texto)

    inserto = []
    for a in archivos05 + archivos06:
        inserto.append(f'    <script src="{{{{ url_for(\'static\', filename=\'js/{a}\') }}}}"></script>')

    marcador = '    <script src="{{ url_for(\'static\', filename=\'js/07-notas.js\') }}"></script>'
    if marcador in texto:
        texto = texto.replace(marcador, SALTO.join(inserto) + SALTO + marcador)
    else:
        print("ADVERTENCIA: no se encontro marcador 07-notas.js")

    base.write_bytes(texto.encode("utf-8"))


def main():
    print("MODULARIZANDO 05-caminatas.js")
    archivos05 = cortar_modulo("05-caminatas.js", "05-")
    print("\nMODULARIZANDO 06-directorio.js")
    archivos06 = cortar_modulo("06-directorio.js", "06-")
    print("\nACTUALIZANDO base.html")
    actualizar_base(archivos05, archivos06)
    print("\nOK. Revisa templates/base.html y recarga.")


if __name__ == "__main__":
    main()
