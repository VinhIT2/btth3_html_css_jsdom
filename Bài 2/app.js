let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let isEditMode = false;

const taskList = document.getElementById('task-list');
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const toastNotification = document.getElementById('toast-notification');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskDeadlineInput = document.getElementById('task-deadline');
const taskPriorityInput = document.getElementById('task-priority');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');

function init() {
    renderTasks();
    setupEventListeners();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskSummary();
}

function updateTaskSummary() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

function showMessage(message) {
    toastNotification.textContent = message;
    toastNotification.classList.remove('hidden');
    setTimeout(() => {
        toastNotification.classList.add('hidden');
    }, 3000);
}

function renderTasks() {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-msg">Danh sách công việc trống. Hãy thêm công việc mới!</div>';
        updateTaskSummary();
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority} ${task.completed ? 'completed-status' : ''}`;
        
        card.innerHTML = `
            <div class="task-header">
                <h4>${task.title}</h4>
                <input type="checkbox" class="status-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
            </div>
            <p>${task.desc || '<i>Không có mô tả</i>'}</p>
            <div class="task-meta">
                <span>Hạn: ${task.deadline}</span> | <span>Ưu tiên: ${task.priority}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-secondary btn-sm edit-btn" data-id="${task.id}">Sửa</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${task.id}">Xóa</button>
            </div>
        `;
        taskList.appendChild(card);
    });

    updateTaskSummary();
}

function resetForm() {
    taskForm.reset();
    taskIdInput.value = '';
    isEditMode = false;
    modalTitle.textContent = "Thêm công việc mới";
}

function setupEventListeners() {
    document.getElementById('btn-open-modal').addEventListener('click', () => {
        resetForm();
        taskModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-modal').addEventListener('click', () => {
        taskModal.classList.add('hidden');
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskData = {
            title: taskTitleInput.value.trim(),
            desc: taskDescInput.value.trim(),
            deadline: taskDeadlineInput.value,
            priority: taskPriorityInput.value,
        };

        if (isEditMode) {
            const idToEdit = parseInt(taskIdInput.value);
            tasks = tasks.map(task => task.id === idToEdit ? { ...task, ...taskData } : task);
            showMessage("Cập nhật công việc thành công!");
        } else {
            const newTask = {
                id: Date.now(),
                ...taskData,
                completed: false
            };
            tasks.push(newTask);
            showMessage("Thêm công việc mới thành công!");
        }

        saveTasks();
        renderTasks();
        taskModal.classList.add('hidden');
    });
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const taskId = parseInt(target.getAttribute('data-id'));
        if (target.classList.contains('delete-btn')) {
            if (confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
                showMessage("Đã xóa công việc!");
            }
        }
        if (target.classList.contains('edit-btn')) {
            const taskToEdit = tasks.find(task => task.id === taskId);
            if (taskToEdit) {
                isEditMode = true;
                modalTitle.textContent = "Cập nhật công việc";
                taskIdInput.value = taskToEdit.id;
                taskTitleInput.value = taskToEdit.title;
                taskDescInput.value = taskToEdit.desc;
                taskDeadlineInput.value = taskToEdit.deadline;
                taskPriorityInput.value = taskToEdit.priority;

                taskModal.classList.remove('hidden');
            }
        }
    });

    taskList.addEventListener('change', (e) => {
        if (e.target.classList.contains('status-checkbox')) {
            const taskId = parseInt(e.target.getAttribute('data-id'));
            tasks = tasks.map(task => {
                if (task.id === taskId) {
                    const newStatus = e.target.checked;
                    return { ...task, completed: newStatus };
                }
                return task;
            });
            saveTasks();
            renderTasks();
            showMessage("Đã cập nhật trạng thái công việc!");
        }
    });
}
init();