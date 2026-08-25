# -*- coding: utf-8 -*-
"""
Partir modulos que superen 250 lineas.

Uso:
    python herramientas/partir_si_pasa.py [ruta_o_archivo]

Sin argumentos, escanea static/js/ y static/css/ y parte automaticamente
los archivos .js que pasen de 250 lineas.  Para .css y .html solo alerta,
porque requieren corte manual cuidadoso.
"""
import re
import sys
from pathlib import Path

BASE = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")
LIMITE = 250
SALTO = "\r\n"


def cortar_js(ruta, prefijo):
    lineas = ruta.read_bytes().decode("utf-8").split(SALTO)

    funcs = []
    for i, l in enumerate(lineas):
        if re.match(r"^(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(", l):
            funcs.append(i)

    if not funcs:
        return []

    inicios = [0] + funcs
    cortes = []
    g_inicio = 0
    for i, ini in enumerate(inicios):
        if i == 0:
            continue
        if ini - g_inicio + 1 > LIMITE:
            cortes.append((g_inicio, ini - 1, lineas[g_inicio]))
            g_inicio = ini
    cortes.append((g_inicio, len(lineas) - 1, lineas[g_inicio]))

    archivos = []
    for i, (desde, hasta, nombre_linea) in enumerate(cortes, start=1):
        m = re.search(r"function\s+([A-Za-z0-9_]+)", nombre_linea)
        nom = m.group(1) if m else "modulo"
        nom_arch = f"{prefijo}-{i:02d}-{nom}.js"
        ruta_dest = ruta.parent / nom_arch
        contenido = SALTO.join(lineas[desde:hasta + 1])
        ruta_dest.write_bytes(contenido.encode("utf-8"))
        archivos.append(nom_arch)
        n = hasta - desde + 1
        print(f"  {nom_arch:<40} {n:>4} lineas")

    return archivos


def actualizar_base_html(nombre_original, archivos):
    base = BASE / "templates" / "base.html"
    texto = base.read_bytes().decode("utf-8")

    # Quitar linea original
    patron = re.compile(
        rf'\s*<script src="\{{{{\s*url_for\(\'static\',\s*filename=\'js/{re.escape(nombre_original)}\'\s*\)\s*\}}}}\">\s*</script>\r?\n?'
    )
    texto = patron.sub("", texto)

    inserto = [f'    <script src="{{{{ url_for(\'static\', filename=\'js/{a}\') }}}}"></script>' for a in archivos]

    # Insertar antes de 99-inicio.js
    marcador = '    <script src="{{ url_for(\'static\', filename=\'js/99-inicio.js\') }}"></script>'
    if marcador in texto:
        lineas = texto.split(SALTO)
        pos = None
        for i, l in enumerate(lineas):
            if marcador in l:
                pos = i
                break
        if pos is not None:
            lineas[pos:pos] = inserto
            base.write_bytes(SALTO.join(lineas).encode("utf-8"))
            return True
    return False


def escanear(directorio):
    problemas = []
    for p in sorted(directorio.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix not in (".js", ".css", ".html"):
            continue
        lineas = len(p.read_bytes().decode("utf-8").split("\r\n"))
        if lineas > LIMITE:
            problemas.append((p.relative_to(BASE), lineas))
    return problemas


def partir_archivo(ruta):
    p = Path(ruta)
    if not p.is_absolute():
        p = BASE / p

    n = len(p.read_bytes().decode("utf-8").split(SALTO))
    if n <= LIMITE:
        print(f"{p.name}: {n} lineas, no requiere partir")
        return

    if p.suffix == ".js":
        print(f"\nPartiendo {p.name} ({n} lineas)...")
        prefijo = p.stem
        archivos = cortar_js(p, prefijo)
        if archivos:
            p.unlink()
            actualizar_base_html(p.name, archivos)
            print(f"  Eliminado {p.name}; base.html actualizado")
    else:
        print(f"{p.name}: {n} lineas. Corte automatico no soportado para {p.suffix}")


def main():
    if len(sys.argv) > 1:
        partir_archivo(sys.argv[1])
        return

    print("Escaneando static/js, static/css y templates...")
    problemas = []
    for d in [BASE / "static" / "js", BASE / "static" / "css", BASE / "templates"]:
        problemas.extend(escanear(d))

    if not problemas:
        print("No hay archivos que superen 250 lineas.")
        return

    print(f"\nSe encontraron {len(problemas)} archivos con mas de {LIMITE} lineas:")
    for r, n in problemas:
        print(f"  {r}: {n} lineas")

    js_grandes = [r for r, n in problemas if str(r).endswith(".js")]
    for r in js_grandes:
        print(f"\nProcesando {r}...")
        partir_archivo(BASE / r)


if __name__ == "__main__":
    main()
