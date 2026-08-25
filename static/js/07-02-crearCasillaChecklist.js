function crearCasillaChecklist() {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'casilla-checklist';
    input.addEventListener('change', function() {
        if (this.checked) this.setAttribute('checked', 'checked');
        else this.removeAttribute('checked');
        actualizarProgresoNota();
    });
    return input;
}

function insertarChecklistNota() {
    const editor = document.getElementById('nota-contenido');
    const ul = document.createElement('ul');
    ul.className = 'checklist-nota';
    ul.style.listStyle = 'none';
    ul.style.paddingLeft = '0';

    const li = document.createElement('li');
    li.style.marginBottom = '6px';
    li.appendChild(crearCasillaChecklist());
    const texto = document.createElement('span');
    texto.contentEditable = 'true';
    texto.style.outline = 'none';
    texto.innerText = 'Tarea';
    li.appendChild(texto);
    ul.appendChild(li);

    editor.appendChild(ul);

    const range = document.createRange();
    range.selectNodeContents(texto);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    editor.focus();
}

function convertirSeleccionAChecklist() {
    const sel = window.getSelection();
    if (!sel.rangeCount) {
        insertarChecklistNota();
        return;
    }

    const editor = document.getElementById('nota-contenido');
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
        insertarChecklistNota();
        return;
    }

    const fragment = range.extractContents();
    const ul = document.createElement('ul');
    ul.className = 'checklist-nota';
    ul.style.listStyle = 'none';
    ul.style.paddingLeft = '0';

    const div = document.createElement('div');
    div.appendChild(fragment);
    const lineas = div.innerText.split('\n').filter(l => l.trim() !== '');

    if (lineas.length === 0) {
        insertarChecklistNota();
        return;
    }

    lineas.forEach(texto => {
        const li = document.createElement('li');
        li.style.marginBottom = '6px';
        li.appendChild(crearCasillaChecklist());
        const span = document.createElement('span');
        span.contentEditable = 'true';
        span.style.outline = 'none';
        span.innerText = texto.trim();
        li.appendChild(span);
        ul.appendChild(li);
    });

    range.insertNode(ul);
    sel.removeAllRanges();
    editor.focus();
}

function manejarEnterChecklist(e) {
    const editor = document.getElementById('nota-contenido');
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const nodo = sel.getRangeAt(0).startContainer;
    let li = nodo.nodeType === Node.ELEMENT_NODE ? nodo : nodo.parentElement;

    while (li && li.tagName !== 'LI') {
        li = li.parentElement;
        if (li && li.id === 'nota-contenido') {
            li = null;
            break;
        }
    }

    if (!li) return;

    const ul = li.parentElement;
    if (!ul || !ul.classList.contains('checklist-nota')) return;

    const textoSpan = li.querySelector('span[contenteditable="true"]');
    const estaVacio = !textoSpan || (textoSpan.innerText || '').trim() === '';

    if (e.key === 'Enter') {
        e.preventDefault();
        const esUltimo = !li.nextElementSibling;

        if (estaVacio && esUltimo) {
            // Salir del checklist al final
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            ul.after(p);
            li.remove();
            if (ul.children.length === 0) ul.remove();

            const range = document.createRange();
            range.selectNodeContents(p);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            editor.focus();
            return;
        }

        const nuevoLi = document.createElement('li');
        nuevoLi.style.marginBottom = '6px';
        nuevoLi.appendChild(crearCasillaChecklist());
        const texto = document.createElement('span');
        texto.contentEditable = 'true';
        texto.style.outline = 'none';
        texto.innerHTML = '<br>';
        nuevoLi.appendChild(texto);
        li.after(nuevoLi);

        const range = document.createRange();
        range.selectNodeContents(texto);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        editor.focus();
    }

    if (e.key === 'Backspace' && estaVacio) {
        e.preventDefault();
        const prevLi = li.previousElementSibling;
        li.remove();
        if (ul.children.length === 0) {
            ul.remove();
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            editor.appendChild(p);
            const range = document.createRange();
            range.selectNodeContents(p);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (prevLi) {
            const span = prevLi.querySelector('span[contenteditable="true"]');
            if (span) {
                const range = document.createRange();
                range.selectNodeContents(span);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        editor.focus();
    }
}

function transformarTextoNota(tipo) {
    const editor = document.getElementById('nota-contenido');
    const sel = window.getSelection();
    let range = (sel.rangeCount && !sel.isCollapsed) ? sel.getRangeAt(0) : notaSavedRange;
    if (!range) { editor.focus(); return; }
    notaSavedRange = range.cloneRange();

    const texto = range.toString();
    let nuevoTexto = texto;

    if (tipo === 'uppercase') nuevoTexto = texto.toUpperCase();
    if (tipo === 'lowercase') nuevoTexto = texto.toLowerCase();
    if (tipo === 'titlecase') nuevoTexto = texto.toLowerCase().replace(/(?:^|\s)\S/g, s => s.toUpperCase());

    range.deleteContents();
    const newNode = document.createTextNode(nuevoTexto);
    range.insertNode(newNode);
    const newRange = document.createRange();
    newRange.selectNode(newNode);
    sel.removeAllRanges();
    sel.addRange(newRange);
    notaSavedRange = newRange.cloneRange();
    editor.focus();
}
