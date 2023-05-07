/* eslint-disable no-unused-vars */
const express = require("express");
var csrf = require("csurf");
// var csrf = require("tiny-csrf");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf({ cookie: true}));
// app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  const overdue = await Todo.overdue();
  const dueToday = await Todo.dueToday();
  const dueLater = await Todo.dueLater();
  const completedItems = await Todo.completedItems();
  const allTodos = await Todo.getTodos();
  if (request.accepts("html")) {
    response.render("index", {
      title: "Todo application",
      overdue,
      dueToday,
      dueLater,
      completedItems,
      allTodos,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      overdue,
      dueToday,
      dueLater,
      completedItems
    });
  }
});

// app.get("/", async (request, response) => {
//   const allTodos = await Todo.getTodos();
//   if (request.accepts("html")) {
//     response.render("index", {
//       allTodos,
//     });
//   } else {
//     response.json({
//       allTodos,
//     });
//   }
// });

app.use(express.static(path.join(__dirname, "public")));

// app.get("/", function (request, response) {
//   response.send("Hello World");
// });

// app.get("/todos", async function (_request, response) {
//   try {
//     const todos = await Todo.findAll();
//     response.send(todos);
//   } catch (error) {
//     console.log(error);
//     return response.status(422).json(error);
//   }
// });

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
// app.put("/todos/:id/markAsCompleted", async function (request, response) {
//   const todo = await Todo.findByPk(request.params.id);
//   try {
//     const updatedTodo = await todo.update({ completed: true });
//     return response.json(updatedTodo);
//   } catch (error) {
//     console.log(error);
//     return response.status(422).json(error);
//   }
// });

app.delete("/todos/:id", async function (request, response) {
  console.log("Delete a Todo with ID: ", request.params.id);
  try{
    await Todo.remove(request.params.id);
    return response.json(true);
  } catch (error) {
    console.log(error);
    response.status(422).json(error);
  }
});

module.exports = app;
