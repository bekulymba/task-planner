import { openModal,  closeModal } from "./modals.js";
import { applyFiltersAndSort } from "./filter.js";
import { initSelection, getSelectedTaskIds } from "./selection.js";


// localstorage
function loadTasks() {
    return JSON.parse(localStorage.getItem("tasks") || "[]");
}

function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

let tasks = loadTasks();
renderTasks();


// render tasks
function renderTasks() {
    const list = document.getElementById("task-list");
    list.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task ${task.status}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-header">
                <span class="task-title">${task.title}</span>

                <div class="task-window-buttons">
                    <input type="checkbox" class="task-select-checkbox">
                    <button class="edit-btn">⋯</button>
                    <button class="delete-btn">✖</button>
                </div>
            </div>

            <div class="task-data" data-timestamp="${task.createdAt}">
                ${new Date(task.createdAt).toLocaleString()}
            </div>
            <span class="task-description">${task.description}</span>

            <div class="task-actions">
                <button class="complete-btn">Complete</button>
                <button class="fail-btn">Fail</button>
            </div>
        `;

        list.appendChild(li);
    });

    attachTaskEvents();
    applyFiltersAndSort();
    initSelection();
}

// event for tasks
function attachTaskEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = e => {
            const id = e.target.closest(".task").dataset.id;

            openModal("delete-modal");
            
            window.deletingTaskId = id;
        };
    });

    document.querySelectorAll(".complete-btn").forEach(btn => {
        btn.onclick = e => {
            const id = e.target.closest(".task").dataset.id;
            
            openModal("complete-modal");
            window.completingTaskId = id;
        };
    });

    document.querySelectorAll(".fail-btn").forEach(btn => {
        btn.onclick = e => {
            const id = e.target.closest(".task").dataset.id;
            
            openModal("fail-modal");
            window.failingTaskId = id;
        };
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = e => {
            const id = e.target.closest(".task").dataset.id;
            openEditModal(id);
        };
    });
}


// add task
document.getElementById("new-task-save").onclick = () => {
    const title = document.getElementById("new-task-title").value.trim();
    const desc = document.getElementById("new-task-desc").value.trim();

    if (!title) return alert("Title is required");

    const task = {
        id: Date.now(),
        title,
        description: desc,
        status: "active",
        createdAt: Date.now() 
    };
    
    tasks.push(task);
    saveTasks(tasks);

    closeModal("new-task-modal");
    renderTasks();
};

document.getElementById("new-task-cancel").onclick = () => closeModal("new-task-modal");


// edit task
let editingTaskId = null;

function openEditModal(id) {
    editingTaskId = id;
    const task = tasks.find(t => t.id == id);

    document.getElementById("edit-task-title").value = task.title;
    document.getElementById("edit-task-desc").value = task.description;

    openModal("edit-modal");
}

document.getElementById("edit-save").onclick = () => {
    const task = tasks.find(t => t.id == editingTaskId);

    task.title = document.getElementById("edit-task-title").value.trim();
    task.description = document.getElementById("edit-task-desc").value.trim();

    saveTasks(tasks);
    closeModal("edit-modal");
    renderTasks();
};

document.getElementById("edit-cancel").onclick = () => closeModal("edit-modal");

// confirm delete
document.getElementById("delete-confirm").onclick = () => {
    const selectedIds = getSelectedTaskIds();

    if (selectedIds.length > 0) {
        tasks = tasks.filter(t => !selectedIds.includes(t.id));
    } else {
        tasks = tasks.filter(t => t.id != window.deletingTaskId);
    }
    saveTasks(tasks);
    closeModal("delete-modal");
    renderTasks();
};

// confirm complete
document.getElementById("complete-confirm").onclick = () => {
        const selectedIds = getSelectedTaskIds();

    if (selectedIds.length > 0) {
        tasks.forEach(t => {
            if (selectedIds.includes(t.id)) t.status = "completed";
        });
    } else {
        const task = tasks.find(t => t.id == window.completingTaskId);
        if (task) task.status = "completed";
    };

    saveTasks(tasks);
    closeModal("complete-modal");
    renderTasks();
};


// confirm fail
document.getElementById("fail-confirm").onclick = () => {
    const selectedIds = getSelectedTaskIds();

    if (selectedIds.length > 0) {
        tasks.forEach(t => {
            if (selectedIds.includes(t.id)) t.status = "failed";
        });
    } else {
        const task = tasks.find(t => t.id == window.failingTaskId);
        if (task) task.status = "failed";
    }
    saveTasks(tasks);
    closeModal("fail-modal");
    renderTasks();
};