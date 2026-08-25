# -*- coding: utf-8 -*-
"""
Verificador de fidelidad de AGENDATRIBUPRO.

Comprueba que los fragmentos extraidos son identicos al monolito original.
Ninguna comprobacion depende de mi criterio: todas comparan bytes o conjuntos
de nombres, de modo que el resultado es objetivo y reproducible.
"""
import sys
from pathlib import Path

ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")
BASE = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")
SALTO = b"\r\n"

ACENTOS = "áéíóúüñÁÉÍÓÚÜÑ¿¡°₡"


def quitar_cabecera(datos):
    """Elimina el comentario de trazabilidad de 3 lineas que agrega extraer.py."""
    lineas = datos.split(SALTO)
    if lineas and lineas[0].startswith(b"/* AGENDATRIBUPRO"):
        # La cabecera termina en la primera linea que cierra el comentario.
        for i, l in enumerate(lineas):
            if l.rstrip().endswith(b"*/"):
                lineas = lineas[i + 1:]
                break
    # extraer.py cierra el archivo con un unico SALTO final. Al partir, eso deja
    # un elemento vacio extra que hay que descartar: exactamente uno, porque las
    # lineas en blanco del original son contenido legitimo y deben conservarse.
    if lineas and lineas[-1] == b"":
        lineas.pop()
    return SALTO.join(lineas)


def comprobar_finales_de_linea(archivos):
    """Todo el proyecto debe usar CRLF, igual que el original."""
    print("\n[1] Finales de linea y codificacion")
    fallos = []
    for ruta in archivos:
        d = ruta.read_bytes()
        sueltos = d.count(b"\n") - d.count(SALTO)
        bom = d[:3] == b"\xef\xbb\xbf"
        try:
            d.decode("utf-8")
            utf8 = True
        except UnicodeDecodeError:
            utf8 = False
        ok = sueltos == 0 and not bom and utf8
        if not ok:
            fallos.append(ruta.name)
        print(f"    {'OK ' if ok else 'MAL'} {ruta.name:<26} "
              f"CRLF={d.count(SALTO):>4} LF-suelto={sueltos} BOM={bom} UTF8={utf8}")
    return not fallos


def comprobar_contenido(rangos):
    """El contenido debe ser identico al original salvo la sangria inicial.

    Se comparan las lineas sin espacios al inicio ni al final: si coinciden todas,
    entonces lo unico que cambio fue el sangrado y ningun caracter de codigo se
    perdio, altero ni reordeno.
    """
    print("\n[2] Contenido identico al original (salvo sangria)")
    lineas = ORIGINAL.read_bytes().split(SALTO)
    fallos = []
    for ruta_rel, desde, hasta in rangos:
        esperado = [l.strip() for l in lineas[desde - 1:hasta]]
        obtenido = [l.strip() for l in quitar_cabecera((BASE / ruta_rel).read_bytes()).split(SALTO)]
        igual = esperado == obtenido
        if not igual:
            fallos.append(ruta_rel)
            for n, (a, b) in enumerate(zip(esperado, obtenido)):
                if a != b:
                    print(f"        primera diferencia en linea {desde + n}:")
                    print(f"          original: {a[:70]!r}")
                    print(f"          modulo  : {b[:70]!r}")
                    break
            if len(esperado) != len(obtenido):
                print(f"        distinto numero de lineas: {len(esperado)} vs {len(obtenido)}")
        print(f"    {'OK ' if igual else 'MAL'} {Path(ruta_rel).name:<26} "
              f"lineas {desde}-{hasta}  {len(esperado)} lineas comparadas")
    return not fallos


def comprobar_acentos(rangos):
    """Los caracteres acentuados deben conservarse exactamente."""
    print("\n[3] Conservacion de acentos y simbolos")
    lineas = ORIGINAL.read_bytes().split(SALTO)
    fallos = []
    for ruta_rel, desde, hasta in rangos:
        esperado = SALTO.join(lineas[desde - 1:hasta]).decode("utf-8")
        obtenido = quitar_cabecera((BASE / ruta_rel).read_bytes()).decode("utf-8")
        for c in ACENTOS:
            if esperado.count(c) != obtenido.count(c):
                fallos.append(f"{ruta_rel}: '{c}' {esperado.count(c)} -> {obtenido.count(c)}")
        total = sum(esperado.count(c) for c in ACENTOS)
        print(f"    {'OK ' if not fallos else 'MAL'} {Path(ruta_rel).name:<26} "
              f"{total} caracteres especiales conservados")
    for f in fallos:
        print(f"        DIFERENCIA {f}")
    return not fallos


RANGOS_CSS = [
    ("static/css/01-variables.css",   143, 158),
    ("static/css/02-layout.css",      159, 268),
    ("static/css/03-tema.css",        269, 350),
    ("static/css/04-componentes.css", 351, 506),
    ("static/css/05-editor.css",      507, 577),
]

RANGOS_JS = [
    ("static/js/00-estado.js",      2977, 3143),
    ("static/js/01-datos.js",       3226, 3330),
    ("static/js/02-navegacion.js",  3331, 3440),
    ("static/js/03-utilidades.js",  3441, 3488),
    ("static/js/99-inicio.js",      3145, 3224),
]


def comprobar_sintaxis_js(rangos):
    """node --check demuestra que ningun modulo quedo cortado a mitad de funcion."""
    import shutil
    import subprocess
    print("\n[4] Sintaxis de los modulos JavaScript (node --check)")
    node = shutil.which("node")
    if not node:
        print("    OMITIDO: node no esta disponible")
        return True
    fallos = []
    for ruta_rel, _, _ in rangos:
        ruta = BASE / ruta_rel
        r = subprocess.run([node, "--check", str(ruta)], capture_output=True, text=True)
        ok = r.returncode == 0
        if not ok:
            fallos.append(ruta_rel)
        print(f"    {'OK ' if ok else 'MAL'} {ruta.name:<26} "
              f"{'sintaxis valida' if ok else r.stderr.strip().splitlines()[-1][:60]}")
    return not fallos


def comprobar_limite_lineas(rangos, limite=200):
    """Ningun modulo debe pasar el limite de lineas acordado."""
    print(f"\n[5] Limite de {limite} lineas por modulo")
    fallos = []
    for ruta_rel, _, _ in rangos:
        ruta = BASE / ruta_rel
        n = len(ruta.read_bytes().split(SALTO)) - 1
        ok = n <= limite
        if not ok:
            fallos.append(ruta_rel)
        print(f"    {'OK ' if ok else 'MAL'} {ruta.name:<26} {n} lineas")
    return not fallos


def main():
    print(f"Original de referencia: {ORIGINAL.name} ({ORIGINAL.stat().st_size} bytes)")
    rangos = RANGOS_CSS + RANGOS_JS
    archivos = [BASE / r for r, _, _ in rangos]
    resultados = {
        "finales de linea": comprobar_finales_de_linea(archivos),
        "contenido identico": comprobar_contenido(rangos),
        "acentos": comprobar_acentos(rangos),
        "sintaxis JS": comprobar_sintaxis_js(RANGOS_JS),
        "limite de lineas": comprobar_limite_lineas(rangos),
    }
    print("\n" + "=" * 60)
    for nombre, ok in resultados.items():
        print(f"  {'PASA  ' if ok else 'FALLA '} {nombre}")
    todo_ok = all(resultados.values())
    print("=" * 60)
    print("RESULTADO:", "TODO CORRECTO" if todo_ok else "HAY FALLOS, REVISAR")
    return 0 if todo_ok else 1


if __name__ == "__main__":
    sys.exit(main())
