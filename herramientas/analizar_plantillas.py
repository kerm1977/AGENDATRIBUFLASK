# -*- coding: utf-8 -*-
"""
Detecta plantillas de texto multilinea (template literals con comillas invertidas)
dentro del bloque <script> del monolito.

Por que importa: quitar la sangria de los modulos es inocuo para el codigo, pero
DENTRO de una plantilla multilinea los espacios son contenido real. Si un mensaje
de WhatsApp se arma con una plantilla multilinea, quitarle la sangria cambiaria
el texto que se envia al grupo. Este script localiza esos casos para tratarlos
aparte.
"""
from pathlib import Path

ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")
JS_DESDE, JS_HASTA = 2890, 11778


def analizar():
    lineas = ORIGINAL.read_bytes().decode("utf-8").split("\r\n")
    js = lineas[JS_DESDE - 1:JS_HASTA]

    dentro = False
    inicio = 0
    bloques = []
    for i, linea in enumerate(js, start=JS_DESDE):
        # Se ignoran las comillas invertidas escapadas.
        n = linea.replace("\\`", "").count("`")
        if n % 2 == 1:
            if not dentro:
                dentro, inicio = True, i
            else:
                if i > inicio:
                    bloques.append((inicio, i))
                dentro = False
    return bloques, js


def main():
    bloques, js = analizar()
    print(f"Plantillas multilinea encontradas: {len(bloques)}\n")

    con_sangria = []
    for desde, hasta in bloques:
        cuerpo = js[desde - JS_DESDE + 1:hasta - JS_DESDE]
        # Solo interesan las que tienen lineas cuyo contenido arranca con espacios
        # mas alla de la sangria estructural de 8.
        sospechosas = [l for l in cuerpo if l.startswith(" " * 9) and l.strip()]
        if sospechosas:
            con_sangria.append((desde, hasta, len(cuerpo), sospechosas[:2]))

    print(f"Con lineas indentadas en su interior: {len(con_sangria)}\n")
    for desde, hasta, n, muestra in con_sangria:
        print(f"  lineas {desde}-{hasta} ({n} lineas internas)")
        for m in muestra:
            print(f"      |{m[:88]}")
    return con_sangria


if __name__ == "__main__":
    main()
