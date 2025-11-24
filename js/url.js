import { applyFiltersAndSort } from "./filter.js";

function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);

    const filter = params.get("filter");
    const sort = params.get("sort");

    if (filter) {
        document.getElementById("filter").value = filter;
    }
    if (sort) {
        document.getElementById("sort").value = sort;
    }

    setTimeout(() => {
        applyFiltersAndSort();
    }, 0);
}

function updateURLState() {
    const filter = document.getElementById("filter").value;
    const sort = document.getElementById("sort").value;

    const params = new URLSearchParams();
    params.set("filter", filter);
    params.set("sort", sort);

    history.replaceState({}, "", "?" + params.toString());
}

document.getElementById("filter").addEventListener("change", () => {
    updateURLState();
    applyFiltersAndSort();
});

document.getElementById("sort").addEventListener("change", () => {
    updateURLState();
    applyFiltersAndSort();
});

loadStateFromURL();