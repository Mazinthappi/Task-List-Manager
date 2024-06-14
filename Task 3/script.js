document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);

let btnelemnt = document.getElementById('add-btn');
let clrbtnelemnt = document.getElementById('clear-btn');
let inputelemnt = document.getElementById('todo-input');
let ullist = document.getElementById('todo-items-list');
let editingTask = null;
let taskText;

let allTasksBtn = document.getElementById('all-tasks-btn');
let pendingTasksBtn = document.getElementById('pending-tasks-btn');
let completedTasksBtn = document.getElementById('completed-tasks-btn');

allTasksBtn.addEventListener('click', () => filterTasks('all'));
pendingTasksBtn.addEventListener('click', () => filterTasks('pending'));
completedTasksBtn.addEventListener('click', () => filterTasks('completed'));



inputelemnt.addEventListener('input', function(event) {
    const firstChar = inputelemnt.value.charAt(0);
    const regex = /[\s!@#$%^&*(),.?":{}|<>]/;
    if (regex.test(firstChar)) {
        inputelemnt.value = inputelemnt.value.substring(1);
        showToast('Task cannot start with a space or special character');
    }
});

inputelemnt.addEventListener('input', function(event) {
    const firstChar = inputelemnt.value.charAt(0);
    const regex = /[^a-zA-Z0-9 ]/;
    if (regex.test(firstChar)) {
        inputelemnt.value = inputelemnt.value.substring(1);
        showToast('Task cannot start with a space or special character');
    }
});

function addTaskToDOM(taskText, completed = false, backgroundColor = '') {
    let li = document.createElement("li");
    if (backgroundColor === 'completed') {
        li.classList.add('completed');
    }

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.addEventListener('change', markComplete);
    li.appendChild(checkbox);

    let spanEl = document.createElement("span");
    spanEl.innerText = taskText;
    li.appendChild(spanEl);

    li.style.cssText = 'animation-name:slideIn;';
    ullist.appendChild(li);

    let editbtn = document.createElement('img');
    editbtn.src = 'icons8-edit-26.png';
    editbtn.alt = 'Edit';
    editbtn.classList.add('fa-edit');
    li.appendChild(editbtn);

    let trashbtn = document.createElement('img');
    trashbtn.src = 'icons8-delete-30.png';
    trashbtn.alt = 'Delete';
    trashbtn.classList.add('fa-trash');
    li.appendChild(trashbtn);

    inputelemnt.value = "";
    inputelemnt.focus();

    saveTasksToLocalStorage();  // Save tasks whenever a new task is added
    updateTaskCounts();
    filterTasks(getCurrentFilter()); // Apply the current filter
}

let originalTaskText = '';

function editElementWithConfirmation(event) {
    if (event.target.classList.contains('fa-edit')) {
        editingTask = event.target.parentElement;
        originalTaskText = editingTask.querySelector("span").innerText;
        inputelemnt.value = originalTaskText;
        inputelemnt.focus();
        btnelemnt.innerHTML = 'Save';
    }
}

btnelemnt.addEventListener("click", function() {
    let inputdata = inputelemnt.value.trim().replace(/\s{2,}/g, ' ');

    if (!inputdata) {
        showToast('Task cannot be empty');
        inputelemnt.focus();
        return;
    }
    if (editingTask && editingTask.querySelector("span").innerText === inputdata) {
        btnelemnt.innerHTML = 'Add';
        editingTask = null;
        successToast('No changes made to the task');
        inputelemnt.value = "";
        inputelemnt.focus();
        return;
    }

    if (isDuplicateTask(inputdata)) {
        showToast('Duplicate task name is not allowed');
        inputelemnt.focus();
        return;
    }
    if (containsSpecialCharacters(inputdata)) {
        showToast('Task cannot contain special characters');
        return;
    }

    if (editingTask) {
        editingTask.querySelector("span").innerText = inputdata;
        ullist.prepend(editingTask); // Move the edited task to the top
        btnelemnt.innerHTML = 'Add';
        editingTask = null;
        
        successToast(`Task Edited Successfully`);
        saveTasksToLocalStorage();
    } else {
        if (isDuplicateTask(inputdata)) {
            showToast('Duplicate task name is not allowed');
            inputelemnt.focus();
            return;
        }

        successToast('Task added Successfully');
        addTaskToDOM(inputdata);
    }

    inputelemnt.value = "";
    inputelemnt.focus();
});

ullist.addEventListener("click", function(event) {
    if (event.target.classList.contains('fa-trash')) {
        deleteElementWithConfirmation(event);
    } else if (event.target.classList.contains('fa-edit')) {
        editElementWithConfirmation(event);
    }
});

function isDuplicateTask(inputdata) {
    const items = ullist.getElementsByTagName('li');
    for (let item of items) {
        if (item.querySelector('span').innerText === inputdata) {
            return true;
        }
    }
    return false;
}

function containsSpecialCharacters(inputdata) {
    const regex = /[^a-zA-Z0-9 ]/;
    return regex.test(inputdata);
}

// function markComplete(event) {
//     let item = event.target.parentElement;

//     function confirmCompletion() {
//         item.classList.add("completed");
//         successToast("Task successfully Completed");
//         saveTasksToLocalStorage();
//     }

//     function confirmIncomplete() {
//         item.classList.remove("completed");
//         showToast("Task Incomplete");
//         saveTasksToLocalStorage();
//     }

//     if (event.target.checked) {
//         taskText = item.querySelector("span").innerText;

//         Toasts(`<h3>Are you sure you want to mark this task "${taskText}" as complete?</h3>`, (confirmed) => {
//             if (confirmed) {
//                 confirmCompletion();
//             } else {
//                 event.target.checked = !event.target.checked;
//             }
//             updateTaskCounts();
//             filterTasks(getCurrentFilter()); // Apply the current filter
//         });
//     } else {
//         taskText = item.querySelector("span").innerText;
//         Toasts(`<h3>Are you sure you want to mark this task "${taskText}" as incomplete?</h3>`, (confirmed) => {
//             if (confirmed) {
//                 confirmIncomplete();
//             } else {
//                 event.target.checked = !event.target.checked;
//             }
//             updateTaskCounts();
//             filterTasks(getCurrentFilter()); // Apply the current filter
//         });
//     }
// }
function markComplete(event) {
    let item = event.target.parentElement;

    function confirmCompletion() {
        item.classList.add("completed");
        successToast("Task successfully Completed");
        saveTasksToLocalStorage();
    }

    function confirmIncomplete() {
        item.classList.remove("completed");
        showToast("Task Incomplete");
        saveTasksToLocalStorage();
    }

    if (event.target.checked) {
        taskText = item.querySelector("span").innerText;

        Toasts(`<h3>Are you sure you want to mark this task "${taskText}" as complete?</h3>`, (confirmed) => {
            if (confirmed) {
                confirmCompletion();
            } else {
                event.target.checked = !event.target.checked;
            }
            updateTaskCounts();
            filterTasks(getCurrentFilter()); // Apply the current filter
        });
    } else {
        taskText = item.querySelector("span").innerText;
        Toasts(`<h3>Are you sure you want to mark this task "${taskText}" as incomplete?</h3>`, (confirmed) => {
            if (confirmed) {
                confirmIncomplete();
            } else {
                event.target.checked = !event.target.checked;
            }
            updateTaskCounts();
            filterTasks(getCurrentFilter()); // Apply the current filter
        });
    }
}

function Toasts(message, callback) {
    document.getElementById('main-container').classList.add('blur');
    let toastContainer = document.getElementById('yes');
    let toast = document.createElement('div');
    toast.className = 'deletetoast';
    toast.innerHTML = `
        ${message}
        <div class="yesornobtn">
            <button class="yes-btn">Yes</button>
            <button class="no-btn">No</button>
        </div>
    `;
    toastContainer.appendChild(toast);

    toast.querySelector('.yes-btn').addEventListener('click', () => {
        callback(true);
        toast.remove();
        document.getElementById('main-container').classList.remove('blur');
    });

    toast.querySelector('.no-btn').addEventListener('click', () => {
        callback(false);
        toast.remove();
        document.getElementById('main-container').classList.remove('blur');
    });
}

function showToast(message) {
    let toastContainer = document.getElementById('toast-container');
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<img class="cross" src="cross.png" aria-hidden="true"></img> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 1500);
}

function successToast(message) {
    let toastContainer = document.getElementById('toast-container');
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<img class="check" src="check.png" aria-hidden="true"></img> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3800);
}

function deleteElementWithConfirmation(event) {
    if (event.target.classList.contains('fa-trash')) {
        let item = event.target.parentElement;
        taskText = item.querySelector("span").innerText;
        Toasts(`<h3>Are you sure you want to delete the task "${taskText}"?</h3>`, (confirmed) => {
            if (confirmed) {
                item.classList.add("slideout");
                item.addEventListener("transitionend", function () {
                    item.remove();
                    saveTasksToLocalStorage();
                });
                successToast('Task Deleted Successfully');
            }
        });
    }
    updateTaskCounts();
}

inputelemnt.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        btnelemnt.click(); // Trigger the click event on the add button
    }
});

clrbtnelemnt.addEventListener("click", clearr);

function clearr() {
    inputelemnt.value = "";
    inputelemnt.focus();
}

function saveTasksToLocalStorage() {
    const tasks = [];
    const items = ullist.getElementsByTagName('li');
    for (let item of items) {
        const task = {
            text: item.querySelector("span").innerText,
            completed: item.querySelector("input[type=checkbox]").checked,
            backgroundColor: item.classList.contains('completed') ? 'completed' : ''
        };
        tasks.push(task);
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskCounts();
}

function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    for (let task of tasks) {
        addTaskToDOM(task.text, task.completed, task.backgroundColor);
    }
    updateTaskCounts();
}

function filterTasks(filter) {
    const items = ullist.getElementsByTagName('li');
    for (let item of items) {
        switch (filter) {
            case 'all':
                item.style.display = 'flex';
                break;
            case 'pending':
                if (item.querySelector('input[type=checkbox]').checked) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
                break;
            case 'completed':
                if (item.querySelector('input[type=checkbox]').checked) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
                break;
        }
    }
    updateTaskCounts();
}

let filterButtons = [allTasksBtn, pendingTasksBtn, completedTasksBtn];

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveButton(button);
        filterTasks(button.id.replace('-tasks-btn', ''));
    });
});

function setActiveButton(activeButton) {
    filterButtons.forEach(button => {
        button.classList.remove('selected');
    });
    activeButton.classList.add('selected');
}

function getCurrentFilter() {
    if (allTasksBtn.classList.contains('selected')) {
        return 'all';
    } else if (pendingTasksBtn.classList.contains('selected')) {
        return 'pending';
    } else if (completedTasksBtn.classList.contains('selected')) {
        return 'completed';
    }
    return 'all';
}

function updateTaskCounts() {
    const allTasksCount = ullist.getElementsByTagName('li').length;
    const pendingTasksCount = Array.from(ullist.getElementsByTagName('li')).filter(li => !li.querySelector('input[type=checkbox]').checked).length;
    const completedTasksCount = Array.from(ullist.getElementsByTagName('li')).filter(li => li.querySelector('input[type=checkbox]').checked).length;

    document.getElementById('all-task-count').innerText = `(${allTasksCount})`;
    document.getElementById('pending-task-count').innerText = `(${pendingTasksCount})`;
    document.getElementById('completed-task-count').innerText = `(${completedTasksCount})`;
}

// Initially set the "All" tasks button as active
setActiveButton(allTasksBtn);
