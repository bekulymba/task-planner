function openModal(id){
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id){
    document.getElementById(id).style.display = 'none';
}

// new task modal
document.querySelector('.new-task').addEventListener('click', () => {
    openModal('new-task-modal');
});
document.getElementById('new-task-cancel').addEventListener('click', () => {
    closeModal('new-task-modal');
});


// delete modal
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        openModal('delete-modal');
    });
});
document.getElementById('delete-cancel').addEventListener('click', () => {
    closeModal('delete-modal');
});


// edit modal
document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        openModal('edit-modal');
    });
});
document.getElementById('edit-cancel').addEventListener('click', () => {
    closeModal('edit-modal');
});


// complete modal
document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        openModal('complete-modal');
    });
});
document.getElementById('complete-cancel').addEventListener('click', () => {
    closeModal('complete-modal');
});


// fail modal
document.querySelectorAll('.fail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        openModal('fail-modal');
    });
});
document.getElementById('fail-cancel').addEventListener('click', () => {
    closeModal('fail-modal');
});

// close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.style.display = 'none';
    });
});