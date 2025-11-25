import { openModal, closeModal } from "./modals.js";
import { applyFiltersAndSort } from "./filter.js";
import { initSelection, getSelectedTaskIds } from "./selection.js";
import { loadTasks, saveTasks } from "./storage.js";

// Состояние приложения
const appState = {
    tasks: loadTasks(),
    editingTaskId: null,
    pendingActionTaskId: null
};

// Инициализация
renderTasks();

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показ сообщения об ошибке пользователю
function showError(message) {
    // Создаем красивое уведомление вместо alert
    const existing = document.querySelector('.error-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Показ информационного сообщения
function showInfo(message) {
    const existing = document.querySelector('.info-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'info-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Рендер задач с улучшенной обработкой пустого списка
function renderTasks() {
    const list = document.getElementById("task-list");
    
    if (!list) {
        console.error('Task list element not found');
        return;
    }
    
    // Очищаем список
    list.innerHTML = "";

    // Показываем сообщение для пустого списка
    if (appState.tasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <p style="text-align: center; color: #666; padding: 40px;">
                No tasks yet. Click "New Task" to create one!
            </p>
        `;
        list.appendChild(emptyState);
        return;
    }

    appState.tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task ${task.status}`;
        li.dataset.id = task.id;

        // Безопасная вставка с экранированием
        li.innerHTML = `
            <div class="task-header">
                <span class="task-title">${escapeHtml(task.title)}</span>

                <div class="task-window-buttons">
                    <input type="checkbox" class="task-select-checkbox" aria-label="Select task">
                    <button class="edit-btn" aria-label="Edit task">⋯</button>
                    <button class="delete-btn" aria-label="Delete task">✖</button>
                </div>
            </div>

            <div class="task-data" data-timestamp="${task.createdAt}">
                ${new Date(task.createdAt).toLocaleString()}
            </div>
            <span class="task-description">${escapeHtml(task.description)}</span>

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

// Улучшенная привязка событий с использованием делегирования
function attachTaskEvents() {
    const list = document.getElementById("task-list");
    
    if (!list) return;

    // Удаляем старые обработчики (если есть)
    const oldList = list.cloneNode(false);
    list.parentNode.replaceChild(oldList, list);
    oldList.innerHTML = list.innerHTML;
    
    // Используем делегирование событий - один обработчик для всего списка
    oldList.addEventListener('click', (e) => {
        const task = e.target.closest('.task');
        if (!task) return;

        const id = Number(task.dataset.id);
        if (isNaN(id)) {
            showError('Invalid task ID');
            return;
        }

        // Обработка кнопки удаления
        if (e.target.closest('.delete-btn')) {
            appState.pendingActionTaskId = id;
            openModal("delete-modal");
        }
        // Обработка кнопки завершения
        else if (e.target.closest('.complete-btn')) {
            appState.pendingActionTaskId = id;
            openModal("complete-modal");
        }
        // Обработка кнопки провала
        else if (e.target.closest('.fail-btn')) {
            appState.pendingActionTaskId = id;
            openModal("fail-modal");
        }
        // Обработка кнопки редактирования
        else if (e.target.closest('.edit-btn')) {
            openEditModal(id);
        }
    });
}

// Валидация ввода с более детальными проверками
function validateTaskInput(title, description) {
    if (!title || title.trim().length === 0) {
        return { valid: false, error: "Title is required" };
    }
    if (title.length > 50) {
        return { valid: false, error: "Title is too long (max 50 characters)" };
    }
    if (description && description.length > 300) {
        return { valid: false, error: "Description is too long (max 300 characters)" };
    }
    return { valid: true };
}

// Добавление новой задачи с улучшенной обработкой ошибок
document.getElementById("new-task-save").onclick = () => {
    try {
        const titleInput = document.getElementById("new-task-title");
        const descInput = document.getElementById("new-task-desc");
        
        if (!titleInput || !descInput) {
            showError("Form elements not found");
            return;
        }

        const title = titleInput.value.trim();
        const desc = descInput.value.trim();

        const validation = validateTaskInput(title, desc);
        if (!validation.valid) {
            showError(validation.error);
            return;
        }

        const task = {
            id: Date.now(),
            title,
            description: desc,
            status: "active",
            createdAt: Date.now()
        };

        appState.tasks.push(task);
        
        if (saveTasks(appState.tasks)) {
            closeModal("new-task-modal");
            renderTasks();
            showInfo("Task created successfully!");
            
            // Очищаем поля
            titleInput.value = '';
            descInput.value = '';
        } else {
            // Откатываем изменения при ошибке сохранения
            appState.tasks.pop();
            showError("Failed to save task");
        }
    } catch (error) {
        console.error("Error creating task:", error);
        showError("An error occurred while creating the task");
    }
};

document.getElementById("new-task-cancel").onclick = () => {
    closeModal("new-task-modal");
};

// Редактирование задачи с проверкой существования
function openEditModal(id) {
    try {
        appState.editingTaskId = id;
        const task = appState.tasks.find(t => t.id === id);

        if (!task) {
            showError("Task not found");
            return;
        }

        const titleInput = document.getElementById("edit-task-title");
        const descInput = document.getElementById("edit-task-desc");
        
        if (!titleInput || !descInput) {
            showError("Edit form elements not found");
            return;
        }

        titleInput.value = task.title;
        descInput.value = task.description;

        openModal("edit-modal");
    } catch (error) {
        console.error("Error opening edit modal:", error);
        showError("Failed to open edit dialog");
    }
}

document.getElementById("edit-save").onclick = () => {
    try {
        const task = appState.tasks.find(t => t.id === appState.editingTaskId);

        if (!task) {
            showError("Task not found");
            closeModal("edit-modal");
            return;
        }

        const titleInput = document.getElementById("edit-task-title");
        const descInput = document.getElementById("edit-task-desc");
        
        if (!titleInput || !descInput) {
            showError("Form elements not found");
            return;
        }

        const title = titleInput.value.trim();
        const desc = descInput.value.trim();

        const validation = validateTaskInput(title, desc);
        if (!validation.valid) {
            showError(validation.error);
            return;
        }

        // Сохраняем старые значения для отката при ошибке
        const oldTitle = task.title;
        const oldDescription = task.description;

        task.title = title;
        task.description = desc;

        if (saveTasks(appState.tasks)) {
            closeModal("edit-modal");
            renderTasks();
            showInfo("Task updated successfully!");
        } else {
            // Откатываем изменения
            task.title = oldTitle;
            task.description = oldDescription;
            showError("Failed to save changes");
        }
    } catch (error) {
        console.error("Error saving task:", error);
        showError("An error occurred while saving");
    }
};

document.getElementById("edit-cancel").onclick = () => {
    closeModal("edit-modal");
};

// Подтверждение удаления с проверкой
document.getElementById("delete-confirm").onclick = () => {
    try {
        const selectedIds = getSelectedTaskIds();
        const oldTasks = [...appState.tasks]; // Сохраняем для отката

        if (selectedIds.length > 0) {
            appState.tasks = appState.tasks.filter(t => !selectedIds.includes(t.id));
            
            if (saveTasks(appState.tasks)) {
                closeModal("delete-modal");
                appState.pendingActionTaskId = null;
                renderTasks();
                showInfo(`${selectedIds.length} task(s) deleted`);
            } else {
                appState.tasks = oldTasks;
                showError("Failed to delete tasks");
            }
        } else if (appState.pendingActionTaskId !== null) {
            appState.tasks = appState.tasks.filter(t => t.id !== appState.pendingActionTaskId);
            
            if (saveTasks(appState.tasks)) {
                closeModal("delete-modal");
                appState.pendingActionTaskId = null;
                renderTasks();
                showInfo("Task deleted");
            } else {
                appState.tasks = oldTasks;
                showError("Failed to delete task");
            }
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        showError("An error occurred while deleting");
    }
};

// Подтверждение завершения
document.getElementById("complete-confirm").onclick = () => {
    try {
        const selectedIds = getSelectedTaskIds();
        const modifiedTasks = [];

        if (selectedIds.length > 0) {
            appState.tasks.forEach(t => {
                if (selectedIds.includes(t.id)) {
                    modifiedTasks.push({ task: t, oldStatus: t.status });
                    t.status = "completed";
                }
            });
        } else if (appState.pendingActionTaskId !== null) {
            const task = appState.tasks.find(t => t.id === appState.pendingActionTaskId);
            if (task) {
                modifiedTasks.push({ task, oldStatus: task.status });
                task.status = "completed";
            }
        }

        if (saveTasks(appState.tasks)) {
            closeModal("complete-modal");
            appState.pendingActionTaskId = null;
            renderTasks();
            showInfo(`${modifiedTasks.length} task(s) completed`);
        } else {
            // Откатываем изменения
            modifiedTasks.forEach(({ task, oldStatus }) => {
                task.status = oldStatus;
            });
            showError("Failed to save changes");
        }
    } catch (error) {
        console.error("Error completing task:", error);
        showError("An error occurred");
    }
};

// Подтверждение провала
document.getElementById("fail-confirm").onclick = () => {
    try {
        const selectedIds = getSelectedTaskIds();
        const modifiedTasks = [];

        if (selectedIds.length > 0) {
            appState.tasks.forEach(t => {
                if (selectedIds.includes(t.id)) {
                    modifiedTasks.push({ task: t, oldStatus: t.status });
                    t.status = "failed";
                }
            });
        } else if (appState.pendingActionTaskId !== null) {
            const task = appState.tasks.find(t => t.id === appState.pendingActionTaskId);
            if (task) {
                modifiedTasks.push({ task, oldStatus: task.status });
                task.status = "failed";
            }
        }

        if (saveTasks(appState.tasks)) {
            closeModal("fail-modal");
            appState.pendingActionTaskId = null;
            renderTasks();
            showInfo(`${modifiedTasks.length} task(s) marked as failed`);
        } else {
            // Откатываем изменения
            modifiedTasks.forEach(({ task, oldStatus }) => {
                task.status = oldStatus;
            });
            showError("Failed to save changes");
        }
    } catch (error) {
        console.error("Error marking task as failed:", error);
        showError("An error occurred");
    }
};