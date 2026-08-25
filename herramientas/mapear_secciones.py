# -*- coding: utf-8 -*-
"""
Mapea las secciones internas de las dos vistas que pasan de 200 lineas
(view-caminata y view-settings) para poder partirlas en parciales.

Regla de corte: solo se corta en bloques HTML BALANCEADOS (que abren y cierran
por completo). Asi cada parcial es un fragmento valido por si mismo y no un
trozo colgando que solo funciona si se pega en el orden exacto.
"""
from mapear_html import cargar, sangria, buscar_cierre


def secciones_de(lineas, desde, hasta, patron):
    """Encuentra los bloques balanceados de primer nivel dentro de un rango."""
    encontrados = []
    i = desde
    while i <= hasta:
        linea = lineas[i - 1]
        if patron in linea:
            fin = buscar_cierre(lineas, i, "div")
            if fin <= hasta:
                encontrados.append((i, fin, sangria(linea)))
                i = fin + 1
                continue
        i += 1
    return encontrados


def etiqueta_de(lineas, desde, fin):
    """Busca el id del collapse o el texto del boton para nombrar la seccion."""
    for i in range(desde, min(fin, desde + 14)):
        s = lineas[i - 1]
        if 'id="collapse' in s:
            return s.split('id="collapse')[1].split('"')[0]
        if 'id="heading' in s:
            return s.split('id="heading')[1].split('"')[0]
    return "?"


def informe(nombre, desde, hasta):
    lineas = cargar()
    print(f"\n{nombre}  ({desde}-{hasta}, {hasta - desde + 1} lineas)")
    secs = secciones_de(lineas, desde, hasta, 'class="accordion-item')
    cubierto = 0
    for d, f, sang in secs:
        n = f - d + 1
        cubierto += n
        marca = "  <-- pasa de 200" if n > 200 else ""
        print(f"    {etiqueta_de(lineas, d, f):<24} {d:>5}-{f:<5} {n:>4} lineas (sangria {sang}){marca}")
    print(f"    {'-' * 60}")
    print(f"    {len(secs)} secciones, {cubierto} lineas cubiertas, "
          f"{hasta - desde + 1 - cubierto} lineas de armazon")


if __name__ == "__main__":
    informe("view-caminata", 692, 1252)
    informe("view-settings", 1315, 1768)
