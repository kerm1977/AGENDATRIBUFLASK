# -*- coding: utf-8 -*-
"""
Verifica que el troceado de las plantillas no perdio ni altero nada.

Prueba principal: se expanden recursivamente todos los {% include %} y el
resultado debe ser IDENTICO BYTE A BYTE al <body> del original. Como en el HTML
no se toco la sangria, la igualdad debe ser exacta, no aproximada. Si un solo
caracter se hubiera movido, esta prueba falla.

Pruebas de apoyo:
  - Inventario de id: los 'id="..."' deben ser los mismos y sin duplicados
    (de ellos dependen todos los getElementById del JS).
  - Inventario de manejadores: cada onclick/onchange/onkeyup/oninput debe seguir
    presente, porque el HTML los llama por nombre global.
"""
import re
import sys
from pathlib import Path

BASE = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")
PLANTILLAS = BASE / "templates"
ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")
SALTO = "\r\n"

CUERPO_DESDE, CUERPO_HASTA = 582, 2882
RE_INCLUDE = re.compile(r"^(\s*)\{%\s*include\s*'([^']+)'\s*%\}\s*$")


def original_body():
    lineas = ORIGINAL.read_bytes().decode("utf-8").split(SALTO)
    return SALTO.join(lineas[CUERPO_DESDE - 1:CUERPO_HASTA])


def expandir(ruta_relativa, profundidad=0, vistos=None):
    """Sustituye cada linea de include por el contenido del archivo referido."""
    if profundidad > 10:
        raise RecursionError("include demasiado anidado")
    vistos = vistos if vistos is not None else []
    vistos.append(ruta_relativa)
    texto = (PLANTILLAS / ruta_relativa).read_bytes().decode("utf-8")
    salida = []
    for linea in texto.split(SALTO):
        m = RE_INCLUDE.match(linea)
        if m:
            salida.append(expandir(m.group(2), profundidad + 1, vistos))
        else:
            salida.append(linea)
    return SALTO.join(salida)


def prueba_reconstruccion():
    print("\n[1] Reconstruccion exacta del <body>")
    esperado = original_body()
    vistos = []
    obtenido = expandir("_cuerpo.html", vistos=vistos)
    igual = esperado == obtenido
    print(f"    plantillas expandidas : {len(vistos)}")
    print(f"    original              : {len(esperado)} bytes, {len(esperado.split(SALTO))} lineas")
    print(f"    reconstruido          : {len(obtenido)} bytes, {len(obtenido.split(SALTO))} lineas")
    if not igual:
        a, b = esperado.split(SALTO), obtenido.split(SALTO)
        for i in range(min(len(a), len(b))):
            if a[i] != b[i]:
                print(f"    primera diferencia en la linea {CUERPO_DESDE + i}:")
                print(f"      original     : {a[i][:88]!r}")
                print(f"      reconstruido : {b[i][:88]!r}")
                break
        if len(a) != len(b):
            print(f"    distinto numero de lineas: {len(a)} vs {len(b)}")
    print(f"    {'OK  identico byte a byte' if igual else 'MAL hay diferencias'}")
    return igual


def _extraer(patron, texto):
    return re.findall(patron, texto)


def prueba_inventario_ids():
    print("\n[2] Inventario de atributos id")
    esperado = _extraer(r'\sid="([^"]+)"', original_body())
    obtenido = _extraer(r'\sid="([^"]+)"', expandir("_cuerpo.html"))
    falta = sorted(set(esperado) - set(obtenido))
    sobra = sorted(set(obtenido) - set(esperado))
    dup = sorted({i for i in obtenido if obtenido.count(i) > 1})
    print(f"    en el original : {len(esperado)}")
    print(f"    en plantillas  : {len(obtenido)}")
    print(f"    faltantes      : {len(falta)} {falta[:5] if falta else ''}")
    print(f"    sobrantes      : {len(sobra)} {sobra[:5] if sobra else ''}")
    print(f"    duplicados     : {len(dup)} {dup[:5] if dup else ''}")
    ok = not falta and not sobra and not dup
    print(f"    {'OK' if ok else 'MAL'}")
    return ok


def prueba_inventario_manejadores():
    print("\n[3] Inventario de manejadores en linea (onclick y similares)")
    patron = r'\bon(?:click|change|input|keyup|keydown|submit|dblclick|blur|focus)="([^"]*)"'
    esperado = _extraer(patron, original_body())
    obtenido = _extraer(patron, expandir("_cuerpo.html"))
    print(f"    en el original : {len(esperado)}")
    print(f"    en plantillas  : {len(obtenido)}")
    ok = sorted(esperado) == sorted(obtenido)
    if not ok:
        falta = sorted(set(esperado) - set(obtenido))
        print(f"    faltantes: {falta[:8]}")
    print(f"    {'OK  todos presentes' if ok else 'MAL faltan manejadores'}")
    return ok


def prueba_limite_lineas(limite=200):
    print(f"\n[4] Limite de {limite} lineas por plantilla")
    excedidas = []
    total = 0
    for ruta in sorted(PLANTILLAS.rglob("*.html")):
        n = len(ruta.read_bytes().decode("utf-8").split(SALTO))
        total += 1
        if n > limite:
            excedidas.append((ruta.relative_to(PLANTILLAS), n))
    print(f"    plantillas revisadas : {total}")
    for r, n in excedidas:
        print(f"    MAL {r} tiene {n} lineas")
    ok = not excedidas
    print(f"    {'OK  ninguna excede el limite' if ok else 'MAL'}")
    return ok


def main():
    resultados = {
        "reconstruccion exacta": prueba_reconstruccion(),
        "inventario de id": prueba_inventario_ids(),
        "inventario de manejadores": prueba_inventario_manejadores(),
        "limite de lineas": prueba_limite_lineas(),
    }
    print("\n" + "=" * 60)
    for nombre, ok in resultados.items():
        print(f"  {'PASA  ' if ok else 'FALLA '} {nombre}")
    todo = all(resultados.values())
    print("=" * 60)
    print("RESULTADO:", "TODO CORRECTO" if todo else "HAY FALLOS, REVISAR")
    return 0 if todo else 1


if __name__ == "__main__":
    sys.exit(main())
