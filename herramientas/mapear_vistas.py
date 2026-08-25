# -*- coding: utf-8 -*-
"""
Informe de bloques del <body> usando el anidamiento real (mapear.py).

Compara tambien contra lo que decia el metodo por indentacion, para dejar
constancia de donde ese metodo se equivocaba.
"""
import mapear

BODY_DESDE, BODY_HASTA = 581, 2888

# Lo que reporto el metodo por indentacion, para contrastar.
SEGUN_INDENTACION = {
    "view-home": (667, 690), "view-caminata": (692, 1252),
    "view-directorio": (1254, 1287), "view-notas": (1290, 1299),
    "view-precios": (1301, 1313), "view-settings": (1315, 1768),
    "tarjeta-cuentas-preview": (629, 662), "banner-cumpleanos": (1778, 1790),
}


def main():
    bloques = mapear.mapear(BODY_DESDE, BODY_HASTA)
    print(f"Bloques mapeados con anidamiento real: {len(bloques)}\n")

    por_id = {}
    for b in bloques:
        if b["id"]:
            por_id.setdefault(b["id"], b)

    print("VISTAS Y BLOQUES SUELTOS")
    print(f"  {'id':<26} {'real':>13} {'lineas':>7}   {'indentacion':>13}  {'coincide':>8}")
    for ident, (id_d, id_h) in SEGUN_INDENTACION.items():
        b = por_id.get(ident)
        if not b:
            print(f"  {ident:<26} NO ENCONTRADO")
            continue
        n = b["hasta"] - b["desde"] + 1
        # El metodo viejo incluia el comentario previo; se compara solo el cierre.
        coincide = "si" if b["hasta"] == id_h else "NO"
        print(f"  {ident:<26} {b['desde']:>6}-{b['hasta']:<6} {n:>7}   "
              f"{id_d:>6}-{id_h:<6}  {coincide:>8}")

    modales = sorted([b for b in bloques if b["id"] and b["id"].startswith("modal")],
                     key=lambda b: b["desde"])
    print(f"\nMODALES ({len(modales)})")
    for b in modales:
        n = b["hasta"] - b["desde"] + 1
        marca = "  <-- pasa de 200" if n > 200 else ""
        print(f"  {b['id']:<32} {b['desde']:>5}-{b['hasta']:<5} {n:>4} lineas{marca}")

    print("\nSECCIONES INTERNAS DE LAS VISTAS GRANDES")
    for ident in ("view-caminata", "view-settings"):
        b = por_id[ident]
        print(f"\n  {ident} ({b['desde']}-{b['hasta']}, {b['hasta'] - b['desde'] + 1} lineas)")
        items = [x for x in bloques
                 if "accordion-item" in (x["class"] or "")
                 and b["desde"] < x["desde"] and x["hasta"] < b["hasta"]]
        items = sorted(items, key=lambda x: x["desde"])
        # Solo los de primer nivel entre si.
        top = [x for x in items
               if not any(o is not x and o["desde"] <= x["desde"] and x["hasta"] <= o["hasta"]
                          for o in items)]
        cubierto = 0
        for x in top:
            n = x["hasta"] - x["desde"] + 1
            cubierto += n
            marca = "  <-- pasa de 200" if n > 200 else ""
            print(f"      accordion-item  {x['desde']:>5}-{x['hasta']:<5} {n:>4} lineas{marca}")
        total = b["hasta"] - b["desde"] + 1
        print(f"      {len(top)} secciones, {cubierto} cubiertas, {total - cubierto} de armazon")


if __name__ == "__main__":
    main()
