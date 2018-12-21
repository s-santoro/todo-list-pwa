//let url = 'http://localhost:3000/api/tasks';
let url = 'https://todo-list-pwa.herokuapp.com/api/tasks';
// needed to set correct id on new task
let taskCount = 0;
let syncCount = 0;

// needed for bootstrap navbar-toggle
window.onload = function () {
  $(function () {
    $('[data-toggle="popover"]').popover();
  });
};

// event-listener for open/closed nav-items
$('#open-tasks').on('click', renderOpenTasks);
$('#closed-tasks').on('click', renderClosedTasks);
// initial fetch
// set taskCounter to task-size + 1
// only show open tasks
fetch(url)
  .then((response) => response.json())
  .then((json) => {
    taskCount = json.length + 1;
    $('.task-item').remove();
    $.each(json, function (key, val) {
      if (val.state.includes('open')) {
        $('#task-list').append(layoutOpenTask(val.id, val.task));
      }
      $('#checkbox' + val.id).on('click', setToDone);
    });
  })
  .catch((err) => console.log(err));

// add a new task to the list
// clear input-element
// post new task to api
$('#addTask').click(function () {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.getRegistration().then(registration => {
      registration.sync.register('tasksPost').then(() => {
        var payload = {
          task: document.getElementById('inputTask').value,
          state: 'post',
        };
        idbKeyval.set(syncCount, payload);
      }).then(() => {
        var task = $('#inputTask').val();
        if ($('#inputTask').val().length <= 3) {
          let id = taskCount;
          if (document.getElementById('open-tasks').classList.contains('active')) {
            $('#task-list').append(layoutOpenTask(id, task));
          }
          $('#inputTask').val('');
          $('#inputTask').attr('placeholder', 'Add a to-do...');
          $('#checkbox' + id).on('click', setToDone);
          // increment counter
          taskCount++;
          syncCount++;
        }
      });
    });
  }
});


// return layout for new task
function layoutOpenTask(id, task) {
  return (layout =
    '<div class="task-item mb-2 h4">' +
    '<span class="badge mr-3"><input id="checkbox' +
    id +
    '" type="checkbox"/></span>' +
    task +
    '</div>');
}

// return layout for closed task
function layoutClosedTask(id, task) {
  return (layout =
    '<div class="task-item ml-3 mb-2 h4">' +
    '<span class="badge mr-3"></span>' +
    '<del>' +
    task +
    '</del></div>');
}


// set task to done
function setToDone() {
  let id = this.id.replace(/checkbox/, '');
  this.parentElement.parentElement.setAttribute('style', 'display: none;');
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.getRegistration().then(registration => {
      registration.sync.register('tasksPut').then(() => {
        var payload = {
          id: id,
          state: 'put',
        };
        idbKeyval.set(syncCount, payload);
        syncCount++;
      });
    });
  }
}

// fetch data with query
// open tasks = ?state=open
// closed tasks = ?state=closed
function fetchAndRenderTasks(state) {
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      $('.task-item').remove();
      $.each(json, function (key, val) {
        if (val.state === state) {
          if (state.includes('open')) {
            $('#task-list').append(layoutOpenTask(val.id, val.task));
          } else if (state.includes('closed')) {
            $('#task-list').append(layoutClosedTask(val.id, val.task));
          }
          $('#checkbox' + val.id).on('click', setToDone);
        }
      });
    })
    .catch((err) => console.log(err));
}

// render new tasks
function renderOpenTasks() {
  let classList = document.getElementById('open-tasks').classList;
  let active = classList.contains('active');
  if (!active) {
    classList.toggle('active');
    document.getElementById('closed-tasks').classList.toggle('active');
    fetchAndRenderTasks('open');
  }
}

// render closed tasks
function renderClosedTasks() {
  let classList = document.getElementById('closed-tasks').classList;
  let active = classList.contains('active');
  if (!active) {
    classList.toggle('active');
    document.getElementById('open-tasks').classList.toggle('active');
    fetchAndRenderTasks('closed');
  }
}

// show or hide offline notification
function showIndicator() {
  document.getElementById('offline').className = 'showOfflineNotification';
}
function hideIndicator() {
  document.getElementById('offline').className = 'hideOfflineNotification';
}
window.addEventListener('online', hideIndicator);
window.addEventListener('offline', showIndicator);


function displayMessageNotification(notificationText) {
  var messageNotification = document.getElementById('message');
  messageNotification.innerHTML = notificationText;
  messageNotification.className = 'showMessageNotification';
}
