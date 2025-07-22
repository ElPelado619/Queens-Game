let stored_selections = {
    "grid": null,
    "visual_help": null,
    "icons_border": null,
    "theme": null,
    "difficulty": null,
    "size": null,
};

const d = document;

export function load_selections() {
    const saved_selections = localStorage.getItem("stored_selections");
    if (saved_selections) {
        try {
            stored_selections = JSON.parse(saved_selections);

            d.getElementById("grid_selector").value = stored_selections.grid;
            d.getElementById("visual_settings").value = stored_selections.visual_help;
            d.getElementById("icon_border_selector").value = stored_selections.icons_border;
            d.getElementById("theme_selector").value = stored_selections.theme;
            d.getElementById("difficulty").value = stored_selections.difficulty;
            d.getElementById("size").value = stored_selections.size;
        } catch (e) {
            console.warn("Error parsing stored selections", e);
        }
    }
}

function store_selections() {
    stored_selections.grid = d.getElementById("grid_selector").value;
    stored_selections.visual_help = d.getElementById("visual_settings").value;
    stored_selections.icons_border = d.getElementById("icon_border_selector").value;
    stored_selections.theme = d.getElementById("theme_selector").value;
    stored_selections.difficulty = d.getElementById("difficulty").value;
    stored_selections.size = d.getElementById("size").value;

    localStorage.setItem("stored_selections", JSON.stringify(stored_selections));
}

window.addEventListener('DOMContentLoaded', load_selections); //also runs on read_boards_file.js

window.addEventListener('beforeunload', store_selections);

d.getElementById("grid_selector").addEventListener("change", store_selections);
d.getElementById("visual_settings").addEventListener("change", store_selections);
d.getElementById("icon_border_selector").addEventListener("change", store_selections);
d.getElementById("theme_selector").addEventListener("change", store_selections);
d.getElementById("difficulty").addEventListener("change", store_selections);
d.getElementById("size").addEventListener("change", store_selections);