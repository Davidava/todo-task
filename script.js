const addTaskForm = document.querySelector('.add-task');
const deleteAll = document.querySelector('.deleteAll-button');
const incompletedTasks = document.querySelector('.tasks__incompleted');
const completedTasks = document.querySelector('.tasks__completed');
const summaryStatus = document.querySelector('.tasks__summary');
const sharebutton = document.querySelector('.share-button');
const message = document.querySelector('.tasks__message');
const socialurls = [
  document.querySelector('.telegram-button'),
  document.querySelector('.facebook-button'),
  document.querySelector('.linkedin-button'),
  document.querySelector('.whatsapp-button'),
  document.querySelector('.twitter-button'),
];

document.addEventListener('DOMContentLoaded', getDataOnPageReload),
addTaskForm.addEventListener('submit', addTask),
incompletedTasks.addEventListener('click', clickOnTask),
completedTasks.addEventListener('click', clickOnTask),
deleteAll.addEventListener('click', deleteAllTasks),
sharebutton.addEventListener('click', copyUrl);
socialurls.forEach((element) => {
  element.addEventListener('click', socialShareRef);
});

// ===== Creating tasks

function addTask(e) {
  e.preventDefault();

  const addTaskInput = document.querySelector('.new-task');
  if (addTaskInput.value) {
    const taskText = addTaskInput.value;
    showTask(taskText);
    makeTasksList();
    dragAndDrop();
  }
}

function showTask(text, completed) {
  el = document.createElement('div');

  el.classList.add('task');

  el.setAttribute('draggable', true);

  el.innerHTML = `
    <button class="check-button"></button>
    <p>${text}</p>
    <button class="delete-button">
      <i class="far fa-trash-alt"></i>
    </button>
  `;
  if (completed) {
    el.classList.add('task_completed');
    completedTasks.append(el);
  } else {
    incompletedTasks.append(el);
  }
  addTaskForm.reset();
}

// ==== Operations after changing tasks status

function changePercentColor(complPercent) {
  percentElement = document.querySelector('.status__percent');
  if (complPercent > 0 && complPercent < 50) {
    message.innerHTML = '';
    percentElement.style.color = 'red';
  } else if (complPercent >= 50 && complPercent <= 99) {
    message.innerHTML = '';
    percentElement.style.color = 'orange';
  } else if (complPercent === 100) {
    message.innerHTML = '';
    percentElement.style.color = 'green';
    message.innerHTML = `
      <div>🎊</div>
      <div>All done!</div>
      `;
  }
}

function calculateSummary(tasksList) {
  const completedTask = tasksList.filter((item) => item.completed === true).length;
  complPercent = completedTask / tasksList.length * 100;
  summaryStatus.classList.add('tasks__summary_active');
  summaryStatus.innerHTML = `
    <div class="hr"></div>
    <p class="status">
      <span class="status__incompleted">
        ${completedTask}
      </span>
      /
      <span class="status__completed">
        ${tasksList.length}
      </span>
      (
      <span class="status__percent">
        ${complPercent.toFixed(0)}%
      </span>
      done)
    </p>
  `;
  changePercentColor(complPercent);
}

function changeTaskStatus(task, moveTask) {
  if (moveTask) {
    if (task.parentElement.classList.contains('tasks__completed')) {
      incompletedTasks.append(task);
      task.classList.remove('task_completed');
    } else {
      completedTasks.append(task);
      task.classList.add('task_completed');
    }
  } else if (task.parentElement.classList.contains('tasks__completed')) {
    task.classList.add('task_completed');
  } else {
    task.classList.remove('task_completed');
  }
  makeTasksList();
}

// ===== Operations with tasks

function makeTasksList() {
  const tasksOnPage = [...document.querySelectorAll('.task')];

  if (tasksOnPage.length === 0) {
    message.innerHTML = '<div> You don\'t have tasks to do </div>';
    summaryStatus.classList.remove('tasks__summary_active');
    return;
  }

  const sortedTasks = tasksOnPage.map(((item) => {
    const obj = {};
    obj.text = item.outerText;
    if (item.parentNode.classList.contains('tasks__incompleted')) {
      obj.completed = false;
    } else {
      obj.completed = true;
    }
    return obj;
  }));
  message.innerHTML = '';
  passQuery(sortedTasks);
  calculateSummary(sortedTasks);
}

function clickOnTask(e) {
  const task = e.target.parentElement;
  if (e.target.closest('.check-button')) {
    changeTaskStatus(task, true);
  } else if (e.target.matches('.delete-button')) {
    task.classList.add('task_selected');
    openModalWindow();
  }
}

function openModalWindow() {
  const modalWindow = document.querySelector('.tasks__modal');
  const task = document.querySelector('.task_selected');
  const modalText = modalWindow.children[0].children[0].children[0];

  modalText.innerText = task.parentElement.children[1].innerText;

  if (task.classList.contains('task_completed')) {
    modalText.classList.add('completed');
  } else {
    modalText.classList.remove('completed');
  }

  document.body.classList.add('show-modal');

  modalWindow.addEventListener('click', deleteTask);
}

function deleteTask(e) {
  const button = e.target;
  const taskSelected = document.querySelector('.task_selected');
  if (button.tagName === 'BUTTON') {
    if (button.innerText === 'Yes') {
      taskSelected.remove();
      makeTasksList();
    }
    document.body.classList.remove('show-modal');
    taskSelected.classList.remove('task_selected');
  }
}

function deleteAllTasks() {
  const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  window.history.pushState(null, null, url);
  summaryStatus.classList.remove('tasks__summary_active');
  incompletedTasks.innerHTML = '<div class="task-blank">';
  completedTasks.innerHTML = '<div class="task-blank">';
  message.innerHTML = '<div> You don\'t have tasks to do </div>';
}

// ===== Drag & Drop

function dragAndDrop() {
  const taskElements = document.querySelectorAll('.task');
  const containers = document.querySelectorAll('[data-container]');

  taskElements.forEach((element) => {
    element.addEventListener('dragstart', () => {
      element.classList.add('task_selected');
    });

    element.addEventListener('dragend', () => {
      element.classList.remove('task_selected');
      changeTaskStatus(element);
    });
  });

  containers.forEach((element) => {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();

      const activeElement = document.querySelector('.task_selected');
      const currentElement = e.target;

      if (activeElement !== currentElement && element) {
        if (currentElement.classList.contains('task-blank')) {
          element.appendChild(activeElement);
        } else if (currentElement.classList.contains('task')) {
          const nextElement = (currentElement === activeElement.nextElementSibling)
            ? currentElement.nextElementSibling
            : currentElement;
          element.insertBefore(activeElement, nextElement);
        }
      }
    });
  });
}

// ===== Reloading page

function getDataOnPageReload() {
  const urlSearch = window.location.search.slice(1);
  if (urlSearch.length < 10) {
    message.innerHTML = '<div> You don\'t have tasks to do </div>';
    return;
  }
  const tasksList = JSON.parse(decodeURI(window.atob(urlSearch)));
  tasksList.forEach((item) => {
    showTask(item.text, item.completed);
  });
  makeTasksList();
  dragAndDrop();
}

function passQuery(SortedTasks) {
  const codedStr = window.btoa(encodeURI(JSON.stringify(SortedTasks)));
  const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  window.history.pushState(null, null, url);
  const newUrl = `${url}?${codedStr}`;
  window.history.pushState(null, null, newUrl);
}

// ===== Share Url

async function createShortLink() {
  const res = await fetch('https://api.rebrandly.com/v1/links', {
    method: 'POST',
    headers: {
      apikey: '6447651e84dc4b20ad11b86932fd1359',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination: window.location.href,
      domain: { fullName: 'rebrand.ly' },
    }),
  });
  return res.json();
}

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
  });
}

function socialShareRef(e) {
  e.preventDefault();
  const postTitle = encodeURI('Hello! Create your todo list: ');

  button = e.target;

  createShortLink().then((data) => {
    if (button.classList.contains('telegram-button')) {
      window.open(`https://t.me/share/url?url=${data.shortUrl}&title=${postTitle}`, '_blank');
    } else if (button.classList.contains('facebook-button')) {
      window.open(`https://www.facebook.com/sharer.php?u=${data.shortUrl}`, '_blank');
    } else if (button.classList.contains('linkedin-button')) {
      window.open(`https://www.linkedin.com/shareArticle?url=${data.shortUrl}&title=${postTitle}`, '_blank');
    } else if (button.classList.contains('whatsapp-button')) {
      window.open(`https://api.whatsapp.com/send?text=${postTitle} ${data.shortUrl}`, '_blank');
    } else if (button.classList.contains('twitter-button')) {
      window.open(`https://twitter.com/share?url=${data.shortUrl}&text=${postTitle}`, '_blank');
    }
  });
}
