// Безопасная обертка для работы с localStorage
const STORAGE_KEY = 'tasks';

export function loadTasks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        
        const tasks = JSON.parse(data);
        
        // Валидация загруженных данных
        if (!Array.isArray(tasks)) {
            console.error('Invalid tasks data format');
            return [];
        }
        
        // Проверка структуры каждой задачи
        return tasks.filter(task => {
            return task && 
                   typeof task.id === 'number' &&
                   typeof task.title === 'string' &&
                   typeof task.description === 'string' &&
                   typeof task.status === 'string' &&
                   typeof task.createdAt === 'number';
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

export function saveTasks(tasks) {
    try {
        if (!Array.isArray(tasks)) {
            throw new Error('Tasks must be an array');
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error('Error saving tasks:', error);
        alert('Failed to save tasks. Please try again.');
        return false;
    }
}

export function clearTasks() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing tasks:', error);
        return false;
    }
}