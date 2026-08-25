# -*- coding: utf-8 -*-
"""Modulariza un solo archivo JS grande y actualiza base.html."""
import re
import sys
from pathlib import Path

BASE = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")
LIMITE = 200
SALTO = "\r\n"


def cortar(nombre_archivo, prefijo):
    ruta = BASE / "static" / "js" / nombre_archivo
    lineas = ruta.read_bytes().decode("utf-8").split(SALTO)

    funcs = []
    for i, l in enumerate(lineas):
        if re.match(r"^(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(", l):
            funcs.append(i)

    if not funcs:
        print(f"No se encontraron funciones en {nombre_archivo}")
        return []

    inicios = [0] + funcs
    cortes = []
    g_inicio = 0
    for i, ini in enumerate(inicios):
        if i == 0:
            continue
        if ini - g_inicio + 1 > LIMITE:
            # cerrar antes de ini
            cortes.append((g_inicio, ini - 1, lineas[g_inicio]))
            g_inicio = ini
    cortes.append((g_inicio, len(lineas) - 1, lineas[g_inicio]))

    archivos = []
    for i, (desde, hasta, nombre_linea) in enumerate(cortes, start=1):
        m = re.search(r"function\s+([A-Za-z0-9_]+)", nombre_linea)
        nom = m.group(1) if m else "modulo"
        nom_arch = f"{prefijo}{i:02d}-{nom}.js"
        ruta_dest = BASE / "static" / "js" / nom_arch
        contenido = SALTO.join(lineas[desde:hasta + 1])
        ruta_dest.write_bytes(contenido.encode("utf-8"))
        archivos.append(nom_arch)
        n = hasta - desde + 1
        print(f"  {nom_arch:<36} {n:>4} lineas  {'OK' if n <= 200 else 'ALERTA'}")

    return archivos


def actualizar_base(nombre_original, archivos, marcador_siguiente):
    base = BASE / "templates" / "base.html"
    texto = base.read_bytes().decode("utf-8")

    # Quitar linea original
    patron = re.compile(rf'\s*<script src="\{{{{\s*url_for\(\'static\',\s*filename=\'js/{re.escape(nombre_original)}\'\s*\)\s*\}}}}\">\s*</script>\r?\n?')
    texto = patron.sub("", texto)

    inserto = []
    for a in archivos:
        inserto.append(f'    <script src="{{{{ url_for(\'static\', filename=\'js/{a}\') }}}}"></script>')

    # Buscar linea del marcador siguiente
    lineas = texto.split(SALTO)
    pos = None
    for i, l in enumerate(lineas):
        if marcador_siguiente in l:
            pos = i
            break
    if pos is None:
        print("ADVERTENCIA: no se encontro marcador", marcador_siguiente)
        return

    lineas[pos:pos] = inserto
    base.write_bytes(SALTO.join(lineas).encode("utf-8"))


def main():
    if len(sys.argv) < 4:
        print("Uso: python modularizar_uno.py <archivo.js> <prefijo> <marcador_siguiente>")
        return

    nombre = sys.argv[1]
    prefijo = sys.argv[2]
    marcador = sys.argv[3]

    print(f"\nMODULARIZANDO {nombre}")
    archivos = cortar(nombre, prefijo)
    print("ACTUALIZANDO base.html")
    actualizar_base(nombre, archivos, marcador)
    print("OK.")


if __name__ == "__main__":
    main()
