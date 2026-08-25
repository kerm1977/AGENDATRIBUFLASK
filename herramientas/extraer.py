# -*- coding: utf-8 -*-
"""
Extractor byte por byte del monolito AGENDATRIBUPRO.html.

Regla fundamental: este script NO reescribe ni reformatea nada. Corta rangos de
lineas exactos del original y los escribe tal cual, preservando UTF-8 sin BOM y
los finales de linea CRLF. Si los bytes de salida son identicos a los de
entrada, la apariencia y el comportamiento no pueden cambiar.
"""
from pathlib import Path

ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")
DESTINO = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")

SALTO = b"\r\n"


def cargar_lineas():
    """Devuelve la lista de lineas como bytes. El indice 0 es la linea 1."""
    return ORIGINAL.read_bytes().split(SALTO)


def cortar(lineas, desde, hasta):
    """Corta las lineas [desde, hasta] en base 1, ambas inclusive."""
    if desde < 1 or hasta > len(lineas) or desde > hasta:
        raise ValueError(f"rango invalido: {desde}-{hasta} (total {len(lineas)})")
    return SALTO.join(lineas[desde - 1:hasta])


SANGRIA = 8


def quitar_sangria(contenido, espacios=SANGRIA):
    """Quita la sangria estructural que el codigo tenia por vivir dentro del
    <style>/<script> del monolito.

    Es seguro: se comprobo con analizar_plantillas.py que las 48 plantillas
    multilinea del original son HTML, donde el espacio entre etiquetas se colapsa.
    Ninguna es texto plano de WhatsApp, que si se veria afectado.

    Devuelve el contenido y el numero de lineas que no encajaban en el patron.
    """
    salida, anomalas = [], 0
    for linea in contenido.split(SALTO):
        if linea.startswith(b" " * espacios):
            salida.append(linea[espacios:])
        elif not linea.strip():
            salida.append(b"")
        else:
            salida.append(linea)
            anomalas += 1
    return SALTO.join(salida), anomalas


def escribir(ruta_relativa, contenido, cabecera=None):
    """Escribe el fragmento. La cabecera es un comentario opcional de trazabilidad."""
    destino = DESTINO / ruta_relativa
    destino.parent.mkdir(parents=True, exist_ok=True)
    cuerpo = contenido
    if cabecera:
        cuerpo = cabecera.encode("utf-8") + SALTO + cuerpo
    destino.write_bytes(cuerpo + SALTO)
    return destino


def extraer(lineas, ruta_relativa, desde, hasta, descripcion):
    """Extrae un rango, le quita la sangria estructural y le agrega cabecera."""
    contenido, anomalas = quitar_sangria(cortar(lineas, desde, hasta))
    cabecera = SALTO.decode("ascii").join([
        f"/* AGENDATRIBUPRO - {descripcion}",
        f"   Origen: AGENDATRIBUPRO.original.html lineas {desde}-{hasta}",
        f"   Extraido sin cambios de codigo (solo se quito la sangria de {SANGRIA} espacios).",
        f"   No editar sin actualizar el original. */",
    ])
    destino = escribir(ruta_relativa, contenido, cabecera)
    n = hasta - desde + 1
    aviso = f"  <- {anomalas} lineas sin sangria de {SANGRIA}" if anomalas else ""
    print(f"  {ruta_relativa:<34} lineas {desde:>5}-{hasta:<5} ({n:>3})  "
          f"{destino.stat().st_size:>7} bytes{aviso}")
    return contenido


# ---------------------------------------------------------------------------
# CSS: el bloque <style> va de la linea 142 (<style>) a la 578 (</style>).
# El contenido real son las lineas 143-577. Cortes en fronteras logicas.
# ---------------------------------------------------------------------------
CORTES_CSS = [
    ("static/css/01-variables.css",   143, 158, "Variables de tema y estilos base"),
    ("static/css/02-layout.css",      159, 268, "Header, navegacion inferior, FAB y vistas"),
    ("static/css/03-tema.css",        269, 350, "Acordeon de ajustes, selector de color y tema oscuro"),
    ("static/css/04-componentes.css", 351, 506, "Recordatorios, directorio, estados, checklist, listas y modales"),
    ("static/css/05-editor.css",      507, 577, "Barra del editor, resultados calculados y utilidades"),
]


def extraer_css(lineas):
    print("\nCSS")
    total = 0
    for ruta, desde, hasta, desc in CORTES_CSS:
        extraer(lineas, ruta, desde, hasta, desc)
        total += hasta - desde + 1
    esperado = 577 - 143 + 1
    print(f"  {'TOTAL':<34} {total} lineas de {esperado} esperadas  ->  "
          f"{'COMPLETO' if total == esperado else 'FALTAN LINEAS'}")
    return total == esperado


def verificar_cobertura_css(lineas):
    """Comprueba que la concatenacion de los CSS equivale al bloque original."""
    original = cortar(lineas, 143, 577)
    partes = [cortar(lineas, d, h) for _, d, h, _ in CORTES_CSS]
    reconstruido = SALTO.join(partes)
    igual = original == reconstruido
    print(f"\n  Invariante CSS: la concatenacion reproduce el original -> {igual}")
    return igual


# ---------------------------------------------------------------------------
# JavaScript: el bloque <script> va de la linea 2889 a la 11779.
#
# Orden de carga: el prefijo numerico manda. 00 a 89 son modulos que solo
# DEFINEN funciones y variables; 99-inicio.js es el unico que EJECUTA, y por eso
# va al final: cuando corre, todo lo demas ya existe. Esto reproduce el orden en
# que el monolito evaluaba el codigo.
#
# Se usan <script> clasicos, no modulos ES, para que todas estas declaraciones
# sigan viviendo en el ambito global y los 140 onclick del HTML las encuentren.
# ---------------------------------------------------------------------------
CORTES_JS = [
    ("static/js/00-estado.js",       2977, 3143, "Constantes de configuracion y estado global compartido"),
    ("static/js/01-datos.js",        3226, 3330, "Capa de datos: loadData y saveData sobre LocalForage"),
    ("static/js/02-navegacion.js",   3331, 3440, "Navegacion entre vistas, titulo y boton flotante"),
    ("static/js/03-utilidades.js",   3441, 3488, "Avisos, confirmaciones y escapado de HTML/JS"),
    ("static/js/04-ajustes.js",      3489, 4187, "Ajustes: normas, instrucciones, cotizador"),
    ("static/js/05-caminatas.js",    4188, 6691, "Caminatas: home, caminantes, buseta"),
    ("static/js/06-directorio.js",   6692, 10671, "Directorio: personas, cumpleanos, historiales"),
    ("static/js/07-notas.js",        10672, 11778, "Notas, oracion, editor de flyers"),
    ("static/js/99-inicio.js",       3145, 3224, "Arranque: modales, listeners y primera carga. Va ultimo"),
]

# Las 87 lineas de comentarios de cabecera del monolito (mapa de modulos y guia
# de migracion) no son codigo, pero son documentacion valiosa: se preservan
# aparte para no perderlas ni inflar los modulos.
CORTES_DOC = [
    ("documentacion/01-mapa-de-modulos.txt",  11, 133, "Mapa de modulos y guia tecnica del monolito"),
    ("documentacion/02-notas-de-migracion.txt", 2890, 2976, "Avisos de codigo protegido y guia de migracion"),
]


def extraer_js(lineas):
    print("\nJavaScript")
    for ruta, desde, hasta, desc in CORTES_JS:
        extraer(lineas, ruta, desde, hasta, desc)
    total = sum(h - d + 1 for _, d, h, _ in CORTES_JS)
    print(f"  {'TOTAL':<34} {total} lineas extraidas de 8891 del bloque <script>")


def extraer_doc(lineas):
    print("\nDocumentacion preservada")
    for ruta, desde, hasta, desc in CORTES_DOC:
        contenido = cortar(lineas, desde, hasta)
        destino = escribir(ruta, contenido)
        n = hasta - desde + 1
        print(f"  {ruta:<40} lineas {desde:>5}-{hasta:<5} ({n:>3})  {destino.stat().st_size:>7} bytes")


if __name__ == "__main__":
    lineas = cargar_lineas()
    print(f"Original: {len(lineas)} lineas, {ORIGINAL.stat().st_size} bytes")
    ok_css = extraer_css(lineas)
    ok_inv = verificar_cobertura_css(lineas)
    extraer_js(lineas)
    extraer_doc(lineas)
    print("\nResultado:", "OK" if (ok_css and ok_inv) else "REVISAR")
