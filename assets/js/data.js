function fetchAndRender (name, transform, afterRender) {
    fetch(name + '.json')
        .then(response => response.json())
        .then(data => {
            if (transform) data = transform(data);
            const mysource = document.getElementById(name + '-template').innerHTML;
            const mytemplate = Handlebars.compile(mysource);
            const myresult = mytemplate(data);
            document.getElementById(name).innerHTML = myresult;
            if (afterRender) afterRender();
        });
}

// Wrap a legacy flat apps list into a single uncategorized group
function normalizeApps (data) {
    if (data.apps.length && !Array.isArray(data.apps[0].apps)) {
        return { apps: [{ flat: true, apps: data.apps }] };
    }
    return data;
}

// Distribute app categories over columns (count set by --apps-columns in CSS),
// placing each category, in order, into the currently shortest column
let appCategories = [];
let appColumnCount = 0;

function layoutApps () {
    const loop = document.getElementById('apps_loop');
    if (!loop) return;
    if (!appCategories.length) {
        appCategories = Array.from(loop.querySelectorAll('.apps_category:not(.apps_category--flat)'));
        if (!appCategories.length) return;
    }
    const count = parseInt(getComputedStyle(loop).getPropertyValue('--apps-columns')) || 4;
    if (count === appColumnCount) return;
    appColumnCount = count;

    const columns = Array.from({ length: count }, () => {
        const column = document.createElement('div');
        column.className = 'apps_column';
        return column;
    });
    loop.replaceChildren(...columns);
    appCategories.forEach(category => {
        const shortest = columns.reduce((a, b) => b.offsetHeight < a.offsetHeight ? b : a);
        shortest.appendChild(category);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRender('apps', normalizeApps, layoutApps);
    fetchAndRender('links');
    fetchAndRender('providers');
});

window.addEventListener('resize', layoutApps);
