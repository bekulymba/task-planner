// ---------------------------
// FILTER + SORT LOGIC
// ---------------------------

// Главная функция, которую вызывает URL.js
function applyFiltersAndSort() {
    const filter = document.getElementById("filter").value;
    const sort = document.getElementById("sort").value;

    const tasks = Array.from(document.querySelectorAll(".task"));
    const list = document.getElementById("task-list");

    // filter
    tasks.forEach(task => {
        const isCompleted = task.classList.contains("completed");
        const isFailed = task.classList.contains("failed");
        const isActive = !isCompleted && !isFailed;

        let show = true;

        if (filter === "completed") show = isCompleted;
        if (filter === "failed") show = isFailed;
        if (filter === "active") show = isActive;
        if (filter === "all") show = true;

        task.style.display = show ? "" : "none";
    });

    // sort
    let sortedTasks = tasks.slice();

    sortedTasks.sort((a, b) => {
        const titleA = a.querySelector(".task-title").textContent.toLowerCase();
        const titleB = b.querySelector(".task-title").textContent.toLowerCase();

        const dateA = new Date(a.querySelector(".task-data").textContent);
        const dateB = new Date(b.querySelector(".task-data").textContent);

        switch (sort) {

            case "alphabet-asc":
                return titleA.localeCompare(titleB);

            case "alphabet-desc":
                return titleB.localeCompare(titleA);

            case "date-asc":
                return dateA - dateB;

            case "date-desc":
                return dateB - dateA;

            case "status-asc":
                return getStatusValue(a) - getStatusValue(b);

            case "status-desc":
                return getStatusValue(b) - getStatusValue(a);

            default:
                return 0;
        }
    });

    // 🔹 3. ПЕРЕРИСОВКА DOM
    sortedTasks.forEach(t => list.appendChild(t));
}


// переводим статус в число (для сортировки)
function getStatusValue(task) {
    if (task.classList.contains("completed")) return 2;
    if (task.classList.contains("failed")) return 1;
    return 0; // active
}
