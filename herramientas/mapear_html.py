# -*- coding: utf-8 -*-
"""
Localiza el cierre exacto de cada bloque de nivel superior del <body>.

Metodo: la etiqueta que cierra un bloque abierto con N espacios de sangria es la
primera '</tag>' que aparece con esos mismos N espacios. El formato del monolito
es consistente, asi que el resultado es exacto y no una estimacion.
"""
from pathlib import Path

ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")


def cargar():
    return ORIGINAL.read_bytes().decode("utf-8").split("\r\n")


def sangria(linea):
    return len(linea) - len(linea.lstrip(" "))


def buscar_cierre(lineas, inicio, etiqueta):
    """Devuelve el numero de linea (base 1) que cierra el bloque abierto en 'inicio'."""
    nivel = sangria(lineas[inicio - 1])
    objetivo = f"{' ' * nivel}</{etiqueta}>"
    for i in range(inicio, len(lineas)):
        if lineas[i].rstrip() == objetivo:
            return i + 1
    raise ValueError(f"sin cierre para {etiqueta} abierto en {inicio}")


def con_comentario_previo(lineas, inicio):
    """Si la linea anterior es un comentario HTML, lo incluye en el bloque."""
    anterior = lineas[inicio - 2].strip()
    if anterior.startswith("<!--") and anterior.endswith("-->"):
        return inicio - 1
    return inicio


def mapear():
    lineas = cargar()
    bloques = []

    for i, linea in enumerate(lineas[:2890], start=1):
        s = linea.strip()
        etiqueta = None
        nombre = None
        if s.startswith('<div id="view-'):
            etiqueta, nombre = "div", s.split('id="')[1].split('"')[0]
        elif s.startswith('<div class="modal fade" id="'):
            etiqueta, nombre = "div", s.split('id="')[1].split('"')[0]
        elif s.startswith('<div id="tarjeta-cuentas-preview"'):
            etiqueta, nombre = "div", "tarjeta-cuentas-preview"
        elif s.startswith('<div id="banner-cumpleanos"'):
            etiqueta, nombre = "div", "banner-cumpleanos"
        if etiqueta:
            fin = buscar_cierre(lineas, i, etiqueta)
            bloques.append((nombre, con_comentario_previo(lineas, i), fin))

    return bloques


if __name__ == "__main__":
    bloques = mapear()
    vistas = [b for b in bloques if b[0].startswith("view-")]
    modales = [b for b in bloques if b[0].startswith("modal")]
    otros = [b for b in bloques if b not in vistas and b not in modales]

    for titulo, grupo in (("VISTAS", vistas), ("MODALES", modales), ("OTROS BLOQUES", otros)):
        print(f"\n{titulo} ({len(grupo)})")
        for nombre, desde, hasta in grupo:
            n = hasta - desde + 1
            marca = "  <-- pasa de 200" if n > 200 else ""
            print(f"  {nombre:<32} {desde:>5}-{hasta:<5} {n:>5} lineas{marca}")

    print(f"\nTotal de bloques mapeados: {len(bloques)}")
