const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const account = users.find((account) => account.username === username);

  if (!account)
    return response.status(404).json({ "error": "Account not found!" });

  request.account = account;

  return next();
}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const accountExist = users.some((account) => account.username === username);

  if (accountExist) {
    return response.status(400).send({ "error": "Account exists!" });
  }


  const account = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  users.push(account);

  return response.status(201).json(account);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { account } = request;

  return response.json(account.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;
  const { account } = request;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  account.todos.push(todo);

  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { account } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = account.todos.find((todo) => todo.id.toString() === id.toString())

  if (!todo)
    return response.status(404).send({ "error": "Not found todo!" });

  todo.title = title;
  todo.deadline = deadline;

  return response.json(todo).send();

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const { account } = request;
  const { id } = request.params;

  const todo = account.todos.find((todo) => todo.id.toString() === id.toString())

  if (!todo) {
    return response.status(404).send({ "error": "Not found todo!" });
  }

  todo.done = true;

  return response.json(todo).send();

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { account } = request;
  const { id } = request.params;

  const todo = account.todos.find((todo) => todo.id.toString() === id);

  if (!todo)
    return response.status(404).send({ "error": "Mensagem do erro" });

  account.todos.splice(todo, 1);

  return response.status(204).send();

});

module.exports = app;