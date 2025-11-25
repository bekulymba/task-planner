let lastSelected = null;

export function initSelection() {
    const list = document.getElementById("task-list");

    list.addEventListener("click", (e) => {
        const task = e.target.closest(".task");
        if (!task) return;

        if (e.target.closest("button")) return;

        toggleSelection(task, e.shiftKey);
    });

// checkbox change
    list.addEventListener("change", (e) => {
        if (!e.target.classList.contains("task-select-checkbox")) return;
        const task = e.target.closest(".task");
        if (!task) return;

        if (e.target.checked) task.classList.add("selected");
        else task.classList.remove("selected");
    });
}

// toggle selection of a task
function toggleSelection(task, isShift) {
    const tasks = [...document.querySelectorAll(".task")];

    if (isShift && lastSelected) {
        const start = tasks.indexOf(lastSelected);
        const end = tasks.indexOf(task);
        const [from, to] = start < end ? [start, end] : [end, start];

        tasks.slice(from, to + 1).forEach(t => {
            t.classList.add("selected");
            t.querySelector(".task-select-checkbox").checked = true;
        });
    } else {
        const checkbox = task.querySelector(".task-select-checkbox");
        if (task.classList.contains("selected")) {
            task.classList.remove("selected");
            if (checkbox) checkbox.checked = false;
        } else {
            task.classList.add("selected");
            if (checkbox) checkbox.checked = true;
        }
    }

    lastSelected = task;
}

export function getSelectedTaskIds() {
    return [...document.querySelectorAll(".task.selected")].map(t => Number(t.dataset.id));
}
