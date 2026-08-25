# -*- coding: utf-8 -*-
"""
Mapeador de bloques HTML basado en anidamiento REAL de etiquetas.

Por que existe este archivo: el primer intento localizaba los cierres por
indentacion, y resulto ser falso. En view-caminata la linea 712 abre un
accordion-item con 28 espacios y la linea 733 tiene los mismos 28 espacios pero
cierra un div distinto, anidado dos niveles mas adentro. Cortar ahi habria
partido el formulario a la mitad.

Este mapeador usa html.parser de la libreria estandar, que lleva una pila real de
etiquetas abiertas. El resultado es el anidamiento verdadero, no una suposicion
basada en el formato.
"""
from html.parser import HTMLParser
from pathlib import Path

ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")

# Etiquetas sin cierre: no participan del anidamiento.
VACIAS = {"br", "hr", "img", "input", "meta", "link", "source", "area", "base",
          "col", "embed", "param", "track", "wbr"}


class Mapeador(HTMLParser):
    """Registra cada etiqueta con su linea de apertura y de cierre reales."""

    def __init__(self, linea_base=1):
        super().__init__(convert_charrefs=False)
        self.linea_base = linea_base
        self.pila = []
        self.bloques = []

    def _linea(self):
        return self.getpos()[0] + self.linea_base - 1

    def handle_starttag(self, tag, attrs):
        if tag in VACIAS:
            return
        d = dict(attrs)
        self.pila.append((tag, self._linea(), d.get("id"), d.get("class", "")))

    def handle_startendtag(self, tag, attrs):
        pass  # <tag /> se abre y cierra solo

    def handle_endtag(self, tag):
        if tag in VACIAS:
            return
        # Se desapila hasta encontrar la etiqueta que corresponde.
        for i in range(len(self.pila) - 1, -1, -1):
            if self.pila[i][0] == tag:
                etiqueta, desde, ident, clases = self.pila[i]
                self.bloques.append({
                    "tag": etiqueta, "id": ident, "class": clases,
                    "desde": desde, "hasta": self._linea(),
                    "nivel": i,
                })
                del self.pila[i:]
                return


def cargar_lineas():
    return ORIGINAL.read_bytes().decode("utf-8").split("\r\n")


def mapear(desde, hasta):
    """Mapea un rango de lineas (base 1, inclusive) y devuelve los bloques."""
    lineas = cargar_lineas()
    fragmento = "\r\n".join(lineas[desde - 1:hasta])
    m = Mapeador(linea_base=desde)
    m.feed(fragmento)
    if m.pila:
        print(f"  AVISO: quedaron {len(m.pila)} etiquetas sin cerrar dentro del rango:")
        for tag, linea, ident, _ in m.pila[:6]:
            print(f"      <{tag}{' id=' + ident if ident else ''}> abierto en linea {linea}")
    return sorted(m.bloques, key=lambda b: b["desde"])


def hijos_directos(bloques, desde, hasta):
    """Bloques contenidos en el rango que no estan dentro de otro del grupo."""
    dentro = [b for b in bloques if b["desde"] > desde and b["hasta"] < hasta]
    resultado = []
    for b in dentro:
        if not any(o is not b and o["desde"] <= b["desde"] and b["hasta"] <= o["hasta"]
                   for o in dentro):
            resultado.append(b)
    return sorted(resultado, key=lambda b: b["desde"])
