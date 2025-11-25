export function applyFiltersAndSort() {
    try {
        const filterSelect = document.getElementById("filter");
        const sortSelect = document.getElementById("sort");
        const list = document.getElementById("task-list");

        if (!filterSelect || !sortSelect || !list) {
            console.error('Required elements not found');
            return;
        }

        const filter = filterSelect.value;
        const sort = sortSelect.value;

        const tasks = Array.from(document.querySelectorAll(".task"));

        // Обработка случая с пустым списком задач
        if (tasks.length === 0) {
            return;
        }

        //filter
        let visibleCount = 0;
        tasks.forEach(task => {
            try {
                const isCompleted = task.classList.contains("completed");
                const isFailed = task.classList.contains("failed");
                const isActive = !isCompleted && !isFailed;

                let show = true;

                switch(filter) {
                    case "completed":
                        show = isCompleted;
                        break;
                    case "failed":
                        show = isFailed;
                        break;
                    case "active":
                        show = isActive;
                        break;
                    case "all":
                    default:
                        show = true;
                }

                task.style.display = show ? "" : "none";
                if (show) visibleCount++;
            } catch (error) {
                console.error('Error filtering task:', error);
                // Показываем задачу при ошибке, чтобы не скрыть её случайно
                task.style.display = "";
            }
        });

        // Показываем сообщение, если все задачи отфильтрованы
        updateEmptyFilterMessage(list, visibleCount);

        // Применяем сортировку
        if (visibleCount > 0) {
            sortTasks(tasks, sort, list);
        }
    } catch (error) {
        console.error('Error in applyFiltersAndSort:', error);
    }
}

function updateEmptyFilterMessage(list, visibleCount) {
    const existingMessage = list.querySelector('.filter-empty-message');
    
    if (visibleCount === 0) {
        if (!existingMessage) {
            const message = document.createElement('div');
            message.className = 'filter-empty-message';
            message.style.cssText = `
                text-align: center;
                color: #666;
                padding: 40px;
                font-size: 14px;
            `;
            message.textContent = 'No tasks match the current filter.';
            list.appendChild(message);
        }
    } else if (existingMessage) {
        existingMessage.remove();
    }
}

// sort
function sortTasks(tasks, sort, list) {
    try {
        let sortedTasks = tasks.slice();

        sortedTasks.sort((a, b) => {
            try {
                const titleElementA = a.querySelector(".task-title");
                const titleElementB = b.querySelector(".task-title");
                const dataElementA = a.querySelector(".task-data");
                const dataElementB = b.querySelector(".task-data");

                if (!titleElementA || !titleElementB || !dataElementA || !dataElementB) {
                    console.warn('Missing task elements during sort');
                    return 0;
                }

                const titleA = titleElementA.textContent.toLowerCase();
                const titleB = titleElementB.textContent.toLowerCase();

                const dateA = parseInt(dataElementA.dataset.timestamp);
                const dateB = parseInt(dataElementB.dataset.timestamp);

                if (isNaN(dateA) || isNaN(dateB)) {
                    console.warn('Invalid timestamp data');
                    return 0;
                }

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
            } catch (error) {
                console.error('Error comparing tasks:', error);
                return 0;
            }
        });

        // Перемещаем элементы в новом порядке
        sortedTasks.forEach(task => {
            try {
                list.appendChild(task);
            } catch (error) {
                console.error('Error reordering task:', error);
            }
        });
    } catch (error) {
        console.error('Error sorting tasks:', error);
    }
}

// Преобразование статуса в число для сортировки
function getStatusValue(task) {
    try {
        if (task.classList.contains("completed")) return 2;
        if (task.classList.contains("failed")) return 1;
        return 0; // active
    } catch (error) {
        console.error('Error getting status value:', error);
        return 0;
    }
}