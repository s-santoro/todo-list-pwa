var express = require('express');
var router = express.Router();

// require local task-data
let tasks = require('../data.json');
if (tasks) console.log('Tasks were loaded');

/* GET home page */
router.get('/', function(req, res, next) {
  let options = { root: __dirname + '/../public/' };
  let fileName = 'index.html';
  res.sendFile(fileName, options, function(err) {
    if (err) next(err);
    else console.log('Sent:', fileName);
  });
});

/* GET tasks filtered by open or closed or get all tasks */
/* tasks?state=closed OR tasks?state=open */
router.get('/api/tasks', (req, res) => {
  if (!tasks) return res.status(404).send('Tasks were not found!');
  if (req.query.state == undefined) return res.send(tasks);
  let tasksFiltered = [];
  tasksFiltered = tasks.filter((task) => task.state === req.query.state);
  if (!tasksFiltered) return res.status(404).send('Tasks were not found!');
  res.send(tasksFiltered);
});

/* GET task with given id */
router.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find((task) => task.id === parseInt(req.params.id));
  if (!task)
    return res
      .status(404)
      .send('The task with id ' + req.params.id + ' was not found!');
  res.send(task);
});

/* POST task, count id up and set state to open */
router.post('/api/tasks', (req, res) => {
  if (req.body.task.length <= 3 || !req.body.task)
    return res.status(400).send('Bad request, task is invalid');
  const newTask = {
    id: tasks.length + 1,
    state: 'open',
    task: req.body.task,
  };
  tasks.push(newTask);
  res.send(newTask);
});

/* UPDATE task, set state from open to closed */
router.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find((task) => task.id === parseInt(req.params.id));
  if (!task)
    return res
      .status(404)
      .send('The task with id ' + req.params.id + ' was not found!');
  if (task.state === 'closed')
    return res
      .status(404)
      .send('The task with id ' + req.params.id + ' is already closed!');
  task.state = 'closed';
  res.send(task);
});

module.exports = router;
