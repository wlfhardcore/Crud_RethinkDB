document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('list-container');
    const searchBox = document.getElementById('search-box');
    const searchButton = document.getElementById('search-button');

    const baseURL = 'http://localhost:3000';

    const fetchTasks = () => {
        fetch(`${baseURL}/tasks`)
            .then(response => response.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.textContent = task.name;

                    const deleteImg = document.createElement('img');
                    deleteImg.src = 'img/delete.png';
                    deleteImg.addEventListener('click', () => deleteTask(task.id));
                    li.appendChild(deleteImg);

                    const updateImg = document.createElement('img');
                    updateImg.src = 'img/edit.png';
                    updateImg.addEventListener('click', () => showUpdateTask(task, li));
                    li.appendChild(updateImg);

                    taskList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching tasks:', error));
    };

    const addTask = () => {
        const taskName = taskInput.value;
        if (taskName) {
            fetch(`${baseURL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: taskName })
            })
                .then(response => response.json())
                .then(fetchTasks)
                .catch(error => console.error('Error adding task:', error));
            taskInput.value = '';
        }
    };

    const deleteTask = (id) => {
        fetch(`${baseURL}/tasks/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(fetchTasks)
            .catch(error => console.error('Error deleting task:', error));
    };

    const showUpdateTask = (task, li) => {
        li.innerHTML = '';

        const updateInput = document.createElement('input');
        updateInput.type = 'text';
        updateInput.value = task.name;

        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.addEventListener('click', () => updateTask(task.id, updateInput.value));

        li.appendChild(updateInput);
        li.appendChild(updateButton);
    };

    const updateTask = (id, newName) => {
        if (newName) {
            fetch(`${baseURL}/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName })
            })
                .then(response => response.json())
                .then(fetchTasks)
                .catch(error => console.error('Error updating task:', error));
        }
    };

    const searchTasks = () => {
        const query = searchBox.value.toLowerCase();
        const tasks = taskList.getElementsByTagName('li');
        Array.from(tasks).forEach(task => {
            const taskName = task.textContent.toLowerCase();
            if (taskName.includes(query)) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        });
    };

    addTaskButton.addEventListener('click', addTask);
    searchButton.addEventListener('click', searchTasks);
    fetchTasks();
});
