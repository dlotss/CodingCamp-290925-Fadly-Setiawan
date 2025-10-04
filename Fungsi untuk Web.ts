document.addEventListener('DOMContentLoaded', () => {
    type Task = {
        en: number;
        text: string;
        date: string;
        completed: boolean;
    };

    const todoForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input') as HTMLInputElement | null;
    const dateInput = document.getElementById('date-input') as HTMLInputElement | null;
    const taskList = document.getElementById('task-list');
    const noTasksMsg = document.getElementById('no-tasks-msg');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const themeSwitcher = document.getElementById('theme-switcher');
    const filterBtns = document.querySelectorAll('.filter-controls .control-btn');


    if (!todoForm || !taskInput || !dateInput || !taskList || !noTasksMsg || !deleteAllBtn || !themeSwitcher) {
        console.error("Error: One or more required elements are missing in the HTML.");
        return; 
    }

    let tasks: Task[] = JSON.parse(localStorage.getItem('tasks') ?? '[]');
    let currentFilter = 'all';

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        if (filteredTasks.length === 0) {
            noTasksMsg.textContent = `No ${currentFilter === 'all' ? '' : currentFilter} task found`;
            noTasksMsg.style.display = 'block';
        } else {
            noTasksMsg.style.display = 'none';
            filteredTasks.forEach((task) => {
                const originalIndex = tasks.findIndex(t => t.en === task.en);

                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.dataset.index = String(originalIndex);

                const dueDate = new Date(task.date).toLocaleDateString('en-EN', { day: '2-digit', month: 'short', year: 'numeric'});

                li.innerHTML = `
                    <span class="task-text">${task.text}</span>
                    <span>${dueDate}</span>
                    <span class="task-status ${task.completed ? 'done' : 'pending'}">${task.completed ? 'Done' : 'Pending'}</span>
                    <div class="task-actions">
                        <button class="complete-btn">✅</button>
                        <button class="delete-btn">🗑️</button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }
    };
    
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const date = dateInput.value;
        if (text === '' || date === '') return;
        tasks.push({ en: Date.now(), text, date, completed: false });
        saveTasks();
        renderTasks();
        todoForm.reset();
    });

    taskList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const li = target.closest('.task-item');
        if (!li || !li.dataset.index) return;
        const index = parseInt(li.dataset.index, 10);
        
        if (isNaN(index) || index < 0 || index >= tasks.length) return;

        if (target.classList.contains('complete-btn')) {
            tasks[index].completed = !tasks[index].completed;
        }
        
        if (target.classList.contains('delete-btn')) {
            tasks.splice(index, 1);
        }

        saveTasks();
        renderTasks();
    });
    
    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = (btn as HTMLElement).dataset.filter || 'all';
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            renderTasks();
        });
    });

    const applyTheme = (theme: string) => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            themeSwitcher.textContent = '🌙';
        } else {
            document.body.classList.remove('light-mode');
            themeSwitcher.textContent = '☀️';
        }
    };
    
    themeSwitcher.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    renderTasks();
});

