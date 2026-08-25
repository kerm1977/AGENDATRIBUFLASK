function formatNameAndSearch(input) {
    const rawValue = input.value;
    const errorMsg = document.getElementById('name-error');
    
    // Validación: Solo letras y espacios
    const validRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (!validRegex.test(rawValue)) {
        errorMsg.style.display = 'block';
        // Eliminar caracteres inválidos
        input.value = rawValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else {
        errorMsg.style.display = 'none';
    }

    // Title Case: Primera letra mayúscula
    let words = input.value.split(' ');
    for (let i = 0; i < words.length; i++) {
        if (words[i]) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
        }
    }
    input.value = words.join(' ');

    // Autocompletado (Buscar en base global)
    const query = input.value.toLowerCase().trim();
    const suggList = document.getElementById('suggestions-list');
    
    if (query.length > 1) {
        const matches = personasGlobales.filter(p => p.toLowerCase().includes(query) && p !== input.value);
        suggList.innerHTML = '';
        if(matches.length > 0) {
            matches.slice(0, 5).forEach(match => { // max 5
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-action py-2 px-3 small';
                li.innerText = match;
                li.onclick = () => {
                    input.value = match;
                    suggList.style.display = 'none';
                };
                suggList.appendChild(li);
            });
            suggList.style.display = 'block';
        } else {
            suggList.style.display = 'none';
        }
    } else {
        suggList.style.display = 'none';
    }
}
