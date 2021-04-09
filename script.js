const addTaskForm = document.querySelector('.add-task'),
  addTaskInput = document.querySelector('.new-task'),
  deleteAll = document.querySelector('.deleteAll-button'),
  incompletedTasks = document.querySelector('.tasks__incompleted'),
  completedTasks = document.querySelector('.tasks__completed'),
  containers = document.querySelectorAll("[data-container]"),
  summaryStatus = document.querySelector('.tasks__summary'),
  modal = document.querySelector('.tasks__modal'),
  modalButtons = document.querySelectorAll('.modal-buttons'),
  sharebutton = document.querySelector('.share-button');

document.addEventListener("DOMContentLoaded", getDataOnPageReload);
addTaskForm.addEventListener('submit', addTask);
incompletedTasks.addEventListener('click', clickOnTask)
completedTasks.addEventListener('click', clickOnTask);
deleteAll.addEventListener('click', deleteAllTasks)
sharebutton.addEventListener('click', copyUrl)


let tasksList = [];


// ===== Creating tasks

function addTask(e) {
  e.preventDefault();

  if (addTaskInput.value) {
    let task = {};
    task.id = Math.random().toString(36).substr(2, 9);
    task.text = addTaskInput.value;
    task.completed = false;

    tasksList.push(task);
    showTask(task);
    dragAndDrop();
  }
}

function showTask (task) {
  el = document.createElement('div');

  el.classList.add('task');
  el.setAttribute("id", task.id);
  el.setAttribute("draggable", true);

  el.innerHTML = `
    <button class="check-button"></button>
    <p>${task.text}</p>
    <button class="delete-button">
    <img src="https://icons-for-free.com/iconfiles/png/512/delete+remove+trash+trash+bin+trash+can+icon-1320073117929397588.png">
    </button>
  `
  if(task.completed) {
    el.classList.add('task_completed')
    completedTasks.append(el)
  } else {
    incompletedTasks.append(el);
  }
  addTaskForm.reset();
  const lastItem = tasksList[tasksList.length - 1];
  if(task === lastItem) {
    calculateSummary()
  }
}

function calculateSummary() {
  checkPosition()
  const completedTask = tasksList.filter(item => item.completed === true).length
  complPercent = completedTask / tasksList.length * 100
  summaryStatus.classList.add('tasks__summary_active')
  summaryStatus.innerHTML = `
    <div class="hr"></div>
    <p class="status">
      <span class="status__incompleted">
        ${completedTask}
      </span>
      /
      <span class="status__completed"/>
        ${tasksList.length}
      </span>
      (
      <span class="status__percent"/>
        ${complPercent.toFixed(0)}%
      </span>
      done)
    </p>
  `
}

function clickOnTask (e) {
  const task = e.target.parentElement
  if(e.target.closest('.check-button')) {
    changeTaskStatus(task, true)
  } else if(e.target.matches('.delete-button')) {
    openModalWindow(e)
  }
}

function openModalWindow (e) {
  const task = e.target.parentElement
  const modalText = modal.children[0].children[0].children[0]
  modalText.innerText = task.parentElement.children[1].innerText
  task.classList.add('task_selected');
  if(task.classList.contains('task_completed')) {
    modalText.classList.add ( 'completed')
  } else {
    modalText.classList.remove ( 'completed')
  }
  document.body.classList.add('show-modal')
  modal.addEventListener('click', deleteTask)
}

function deleteTask(e) {
  const button = e.target.innerText
  const taskSelected = document.querySelector('.task_selected')
  if(button==='Yes') {
    const taskInArray = tasksList.find(item => item.id === taskSelected.id)
    taskSelected.remove()
    tasksList.splice(tasksList.indexOf(taskInArray), 1)
    calculateSummary()
    if(tasksList.length === 0) {
      summaryStatus.classList.remove('tasks__summary_active')
    }
    document.body.classList.remove('show-modal')
    taskSelected.classList.remove('task_selected')
  } else if(button==='No') {
    document.body.classList.remove('show-modal')
    taskSelected.classList.remove('task_selected')
  }
}

function deleteAllTasks() {
  const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
  window.history.pushState(null, null, url);
  summaryStatus.classList.remove('tasks__summary_active')
  incompletedTasks.innerHTML = '<div class="task-blank">'
  completedTasks.innerHTML = '<div class="task-blank">'
  tasksList = []

}


function changeTaskStatus(task, moveTask) {
  const taskLocal = tasksList.find(item => item.id === task.id)
  if(moveTask) {
    if (task.parentElement === completedTasks) {
      incompletedTasks.append(task)
      task.classList.remove('task_completed');
      taskLocal.completed = false
    } else {
      completedTasks.append(task)
      task.classList.add('task_completed');
      taskLocal.completed = true
    }
  } else {
    if (task.parentElement === completedTasks) {
      task.classList.add('task_completed');
      taskLocal.completed = true
    } else {
      task.classList.remove('task_completed');
      taskLocal.completed = false
    }
  }
  calculateSummary()
}

// ===== Drag & Drop 

function dragAndDrop() {
  const taskElements = document.querySelectorAll('.task')
  taskElements.forEach((element) => {
    element.addEventListener('dragstart', () => {
      element.classList.add('task_selected');
    });

    element.addEventListener('dragend',  checkDragSummary);
  });

  containers.forEach((element) => {
    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      
      const activeElement = document.querySelector('.task_selected');
      const currentElement = e.target;

      if(activeElement !== currentElement) {
        if(currentElement.classList.contains('task-blank')) {
          element.appendChild(activeElement)
        } else if (currentElement.classList.contains('task')) {
          const nextElement = (currentElement === activeElement.nextElementSibling) ?
            currentElement.nextElementSibling :
            currentElement;
          element.insertBefore(activeElement, nextElement);
        }
      }
    });
  });
}

function getDataOnPageReload() {
  const urlSearch = window.location.search.slice(1);
  if(urlSearch < 15) {
    return
  }
  const decodeStr = JSON.parse(window.atob(urlSearch))
  tasksList = decodeStr
  tasksList.forEach(item => {
    showTask (item)
  })
  dragAndDrop()
}

function passQuery (SortedTasks) {
  const encodeStr = window.btoa(JSON.stringify(SortedTasks))
  const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
  window.history.pushState(null, null, url);
  const newUrl = `${url}?${encodeStr}`;
  window.history.pushState(null, null, newUrl);
}
 
function checkPosition () {
  const tasksArrOnPage = [...document.querySelectorAll('.task')].map((item) => {
    return item.id;
  });
  const SortedTasks = tasksArrOnPage.map((itemOld) => {
    let newItem;
    tasksList.forEach((item) => {
      if (item.id == itemOld) {
        newItem = item;
      }
    });
    return newItem;
  });
  passQuery (SortedTasks)
}

function checkDragSummary(e) {
  taskElement = e.target
  taskElement.classList.remove('task_selected');
  
  changeTaskStatus(taskElement)
};

function copyUrl() {
  createShortLink().then((data) => {
    const el = document.createElement('textarea');
    el.value = data.shortUrl;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  })
}

async function createShortLink() {
  const res = await fetch("https://api.rebrandly.com/v1/links", {
    method: "POST",
    headers: {
      apikey: '6447651e84dc4b20ad11b86932fd1359',
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destination: window.location.href,
      domain: { fullName: "rebrand.ly" },
    }),
  })
  return res.json()
}