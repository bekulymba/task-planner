import { applyFiltersAndSort } from "./filter.js";

const VALID_FILTERS = ['all', 'active', 'completed', 'failed'];
const VALID_SORTS = ['date-asc', 'date-desc', 'status-asc', 'status-desc', 'alphabet-asc', 'alphabet-desc'];

function loadStateFromURL() {
    try {
        const params = new URLSearchParams(window.location.search);

        const filter = params.get("filter");
        const sort = params.get("sort");

        const filterSelect = document.getElementById("filter");
        const sortSelect = document.getElementById("sort");

        if (!filterSelect || !sortSelect) {
            console.error('Filter or sort element not found');
            return;
        }

        //filter
        if (filter && VALID_FILTERS.includes(filter)) {
            filterSelect.value = filter;
        } else if (filter) {
            console.warn(`Invalid filter parameter: ${filter}`);
            updateURLState();
        }

        // sort
        if (sort && VALID_SORTS.includes(sort)) {
            sortSelect.value = sort;
        } else if (sort) {
            console.warn(`Invalid sort parameter: ${sort}`);
            updateURLState();
        }

        setTimeout(() => {
            applyFiltersAndSort();
        }, 0);
    } catch (error) {
        console.error('Error loading state from URL:', error);
    }
}

function updateURLState() {
    try {
        const filterSelect = document.getElementById("filter");
        const sortSelect = document.getElementById("sort");

        if (!filterSelect || !sortSelect) {
            console.error('Filter or sort element not found');
            return;
        }

        const filter = filterSelect.value;
        const sort = sortSelect.value;

        if (!VALID_FILTERS.includes(filter) || !VALID_SORTS.includes(sort)) {
            console.error('Invalid filter or sort value');
            return;
        }

        const params = new URLSearchParams();
        params.set("filter", filter);
        params.set("sort", sort);

        history.replaceState({}, "", "?" + params.toString());
    } catch (error) {
        console.error('Error updating URL state:', error);
    }
}

function initFilterAndSortHandlers() {
    const filterSelect = document.getElementById("filter");
    const sortSelect = document.getElementById("sort");

    if (filterSelect) {
        filterSelect.addEventListener("change", () => {
            try {
                updateURLState();
                applyFiltersAndSort();
            } catch (error) {
                console.error('Error handling filter change:', error);
            }
        });
    } else {
        console.error('Filter select element not found');
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            try {
                updateURLState();
                applyFiltersAndSort();
            } catch (error) {
                console.error('Error handling sort change:', error);
            }
        });
    } else {
        console.error('Sort select element not found');
    }
}


try {
    loadStateFromURL();
    initFilterAndSortHandlers();
} catch (error) {
    console.error('Error initializing URL state:', error);
}