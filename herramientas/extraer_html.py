# -*- coding: utf-8 -*-
"""
Extrae el <body> del monolito a plantillas Jinja2.

Decisiones y su motivo:

1. NO se quita la sangria del HTML (a diferencia del JS y el CSS). El monolito usa
   'white-space: pre-wrap' en varios sitios, donde los espacios al inicio de linea
   son contenido visible. Conservar los bytes evita tener que razonar caso por caso.

2. Los bloques se localizan con el parser de mapear.py, que sigue el anidamiento
   real. No se usa la indentacion: se comprobo que en view-caminata la indentacion
   miente sobre el anidamiento.

3. El armazon de cada vista se conserva tal cual y solo se sustituyen los bloques
   hijos por {% include %}. Asi el orden y el contenido intermedio no se alteran,
   y la sustitucion es reversible: expandiendo los include se debe reconstruir el
   original exacto (lo comprueba verificar_html.py).
"""
from pathlib import Path

import mapear

DESTINO = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")
SALTO = "\r\n"
BODY_DESDE, BODY_HASTA = 581, 2888

VISTAS = ["view-home", "view-caminata", "view-directorio",
          "view-notas", "view-precios", "view-settings"]
SUELTOS = {"tarjeta-cuentas-preview": "_tarjeta-cuentas.html",
           "banner-cumpleanos": "_banner-cumpleanos.html"}

# Vistas que pasan de 200 lineas y se parten por sus accordion-item.
A_PARTIR = {"view-caminata": "caminata", "view-settings": "ajustes"}


def escribir(ruta_relativa, texto):
    destino = DESTINO / "templates" / ruta_relativa
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_bytes(texto.encode("utf-8"))
    return destino


def nombre_seccion(lineas, desde, hasta):
    """Deduce el nombre del archivo desde el id del collapse o el data-bs-target.

    view-caminata identifica sus secciones con id="collapseXxx"; view-settings lo
    hace con data-bs-target="#acc-xxx". Se aceptan ambas formas.
    """
    for i in range(desde, min(hasta, desde + 12)):
        s = lineas[i - 1]
        if 'data-bs-target="#acc-' in s:
            return s.split('data-bs-target="#acc-')[1].split('"')[0]
        for marca in ('id="collapse', 'id="heading'):
            if marca in s:
                return _guionizar(s.split(marca)[1].split('"')[0])
    return f"seccion-{desde}"


def _guionizar(texto):
    """CamelCase a guiones. Las siglas se mantienen juntas: 'URL' -> 'url'."""
    salida = []
    for i, c in enumerate(texto):
        previo_minuscula = i > 0 and texto[i - 1].islower()
        if c.isupper() and previo_minuscula:
            salida.append("-")
        salida.append(c.lower())
    return "".join(salida)


def secciones_de(bloques, contenedor):
    """accordion-item de primer nivel dentro del contenedor."""
    dentro = [b for b in bloques
              if "accordion-item" in (b["class"] or "")
              and contenedor["desde"] < b["desde"] and b["hasta"] < contenedor["hasta"]]
    return sorted(
        [b for b in dentro
         if not any(o is not b and o["desde"] <= b["desde"] and b["hasta"] <= o["hasta"]
                    for o in dentro)],
        key=lambda b: b["desde"])


def reemplazar(lineas, desde, hasta, sustituciones):
    """Devuelve el rango con cada sub-bloque cambiado por su linea de include.

    'sustituciones' es una lista de (desde, hasta, ruta_include).
    """
    subs = {d: (h, ruta) for d, h, ruta in sustituciones}
    salida, i = [], desde
    while i <= hasta:
        if i in subs:
            fin, ruta = subs[i]
            sangria = " " * (len(lineas[i - 1]) - len(lineas[i - 1].lstrip(" ")))
            salida.append(f"{sangria}{{% include '{ruta}' %}}")
            i = fin + 1
        else:
            salida.append(lineas[i - 1])
            i += 1
    return SALTO.join(salida)


def main():
    lineas = mapear.cargar_lineas()
    bloques = mapear.mapear(BODY_DESDE, BODY_HASTA)
    por_id = {}
    for b in bloques:
        if b["id"] and b["id"] not in por_id:
            por_id[b["id"]] = b

    inventario = []          # (ruta, desde, hasta) de parciales sin include dentro
    sustituciones_base = []  # bloques que se sacan del body

    # --- Modales -----------------------------------------------------------
    modales = sorted(
        [b for b in bloques
         if b["id"] and "modal fade" in (b["class"] or "")],
        key=lambda b: b["desde"])
    print(f"MODALES ({len(modales)})")
    for b in modales:
        ruta = f"modales/{_guionizar(b['id'].replace('modal', '', 1))}.html".replace("/-", "/")
        texto = SALTO.join(lineas[b["desde"] - 1:b["hasta"]])
        escribir(ruta, texto)
        inventario.append((ruta, b["desde"], b["hasta"]))
        sustituciones_base.append((b["desde"], b["hasta"], ruta))
        print(f"  {ruta:<44} {b['desde']:>5}-{b['hasta']:<5} {b['hasta'] - b['desde'] + 1:>4} lineas")

    # --- Bloques sueltos ---------------------------------------------------
    print("\nPARCIALES SUELTOS")
    for ident, archivo in SUELTOS.items():
        b = por_id[ident]
        ruta = f"parciales/{archivo}"
        escribir(ruta, SALTO.join(lineas[b["desde"] - 1:b["hasta"]]))
        inventario.append((ruta, b["desde"], b["hasta"]))
        sustituciones_base.append((b["desde"], b["hasta"], ruta))
        print(f"  {ruta:<44} {b['desde']:>5}-{b['hasta']:<5} {b['hasta'] - b['desde'] + 1:>4} lineas")

    # --- Vistas ------------------------------------------------------------
    print("\nVISTAS")
    for ident in VISTAS:
        b = por_id[ident]
        corto = ident.replace("view-", "")
        if ident in A_PARTIR:
            carpeta = A_PARTIR[ident]
            secs = secciones_de(bloques, b)
            subs = []
            for s in secs:
                nombre = nombre_seccion(lineas, s["desde"], s["hasta"])
                ruta = f"vistas/{carpeta}/_{nombre}.html"
                escribir(ruta, SALTO.join(lineas[s["desde"] - 1:s["hasta"]]))
                inventario.append((ruta, s["desde"], s["hasta"]))
                subs.append((s["desde"], s["hasta"], ruta))
            ruta_vista = f"vistas/_{corto}.html"
            escribir(ruta_vista, reemplazar(lineas, b["desde"], b["hasta"], subs))
            print(f"  {ruta_vista:<44} {b['desde']:>5}-{b['hasta']:<5} "
                  f"{b['hasta'] - b['desde'] + 1:>4} lineas -> {len(secs)} secciones")
            for ruta, d, h in [i for i in inventario if i[0].startswith(f'vistas/{carpeta}/')]:
                print(f"      {ruta:<40} {d:>5}-{h:<5} {h - d + 1:>4} lineas")
        else:
            ruta_vista = f"vistas/_{corto}.html"
            escribir(ruta_vista, SALTO.join(lineas[b["desde"] - 1:b["hasta"]]))
            inventario.append((ruta_vista, b["desde"], b["hasta"]))
            print(f"  {ruta_vista:<44} {b['desde']:>5}-{b['hasta']:<5} "
                  f"{b['hasta'] - b['desde'] + 1:>4} lineas")
        sustituciones_base.append((b["desde"], b["hasta"], ruta_vista))

    # --- Cuerpo del body ---------------------------------------------------
    cuerpo = reemplazar(lineas, 582, BODY_HASTA - 6, sorted(sustituciones_base))
    escribir("_cuerpo.html", cuerpo)
    n_cuerpo = len(cuerpo.split(SALTO))
    print(f"\nCUERPO\n  _cuerpo.html{'':<32} 582-{BODY_HASTA - 6}  {n_cuerpo:>4} lineas "
          f"(armazon + {len(sustituciones_base)} include)")

    return inventario


if __name__ == "__main__":
    main()
