let url = 'http://localhost:3000/api/tasks';
// needed to set correct id on new task
let taskCount = 0;

// needed for bootstrap navbar-toggle
window.onload = function() {
  $(function() {
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
    $.each(json, function(key, val) {
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
$('#addTask').click(function() {
  var task = $('#inputTask').val();
  if ($('#inputTask').val().length != 0) {
    let id = taskCount;
    if (document.getElementById('open-tasks').classList.contains('active')) {
      $('#task-list').append(layoutOpenTask(id, task));
    }
    $('#inputTask').val('');
    $('#inputTask').attr('placeholder', 'Add a to-do...');
    $('#checkbox' + id).on('click', setToDone);
    // increment counter
    taskCount++;
    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify({ state: 'open', task: task }),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      success: function() {
        //
      },
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
  let taskUrl = url + this.id.replace(/checkbox/, '/');
  this.parentElement.parentElement.setAttribute('style', 'display: none;');
  fetch(taskUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
    .then()
    .catch((err) => console.log(err));
}

// fetch data with query
// open tasks = ?state=open
// closed tasks = ?state=closed
function fetchAndRenderTasks(query) {
  fetch(url + query)
    .then((response) => response.json())
    .then((json) => {
      $('.task-item').remove();
      $.each(json, function(key, val) {
        if (query.includes('open')) {
          $('#task-list').append(layoutOpenTask(val.id, val.task));
        } else if (query.includes('closed')) {
          $('#task-list').append(layoutClosedTask(val.id, val.task));
        }
        $('#checkbox' + val.id).on('click', setToDone);
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
    fetchAndRenderTasks('?state=open');
  }
}

// render closed tasks
function renderClosedTasks() {
  let classList = document.getElementById('closed-tasks').classList;
  let active = classList.contains('active');
  if (!active) {
    classList.toggle('active');
    document.getElementById('open-tasks').classList.toggle('active');
    fetchAndRenderTasks('?state=closed');
  }
}


var offlineNotification = document.getElementById('offline-message');
function showIndicator() {
    offlineNotification.innerHTML = 'You are currently offline.';
    offlineNotification.className = 'showOfflineNotification';
}
function hideIndicator() {
    offlineNotification.className = 'hideOfflineNotification';
}
window.addEventListener('online',  hideIndicator);
window.addEventListener('offline', showIndicator);