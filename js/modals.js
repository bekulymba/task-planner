export function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Закрытие модальных окон при клике вне их содержимого
function setupModalClickOutside() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Закрытие модальных окон по клавише Escape
function setupEscapeKey() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: flex"]');
            if (openModal) {
                openModal.style.display = 'none';
            }
        }
    });
}

// Инициализация обработчиков для новой задачи
function initNewTaskModal() {
    const newTaskBtn = document.querySelector('.new-task');
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', () => {
            // Очищаем поля перед открытием
            const titleInput = document.getElementById('new-task-title');
            const descInput = document.getElementById('new-task-desc');
            
            if (titleInput) titleInput.value = '';
            if (descInput) descInput.value = '';
            
            openModal('new-task-modal');
        });
    }
}

// Инициализация всех обработчиков модальных окон
function initModalHandlers() {
    // Кнопки отмены
    const cancelButtons = [
        { id: 'new-task-cancel', modal: 'new-task-modal' },
        { id: 'delete-cancel', modal: 'delete-modal' },
        { id: 'edit-cancel', modal: 'edit-modal' },
        { id: 'complete-cancel', modal: 'complete-modal' },
        { id: 'fail-cancel', modal: 'fail-modal' }
    ];

    cancelButtons.forEach(({ id, modal }) => {
        const btn = document.getElementById(id);
        if (btn) {
            // Удаляем старые обработчики, если они есть
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', () => {
                closeModal(modal);
            });
        }
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setupModalClickOutside();
    setupEscapeKey();
    initNewTaskModal();
    initModalHandlers();
});

export { initModalHandlers };