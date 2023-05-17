const express = require("express");
var csrf = require("csurf");
// var csrf = require("tiny-csrf");
const app = express();
const { Todo,User} = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf({ cookie: true}));
// app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

const passport = require('passport') 
const connectEnsureLogin = require('connect-ensure-login'); 
const session = require('express-session'); 
const LocalStrategy = require('passport-local');


const bcrypt = require('bcrypt');
const flash = require("connect-flash");
app.set("views", path.join(__dirname, "views"));
app.use(flash());
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "my-secret-key-123456",
  cookie: {
    maxAge: 24*60*60*1000 //24 hrs
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (username, password, done) => {
  User.findOne({ where: {email: username}})
   .then(async(user) => {
      const result = await bcrypt.compare(password, user.password)
      if(result){
        return done(null, user);
      } else {
        return done("Invalid password");
      }    
   }).catch((error) => {
    return (error)
   })
}));

passport.serializeUser((user,done) => {
  console.log("Serializing user in session", user.id)
  done(null, user.id)
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
  .then(user => {
    done(null, user)
  })
  .catch(error => {
    done(error, null)
  })
});

app.get("/", async (request, response) => {
    response.render("index", {
      title: "Todo application",
      csrfToken: request.csrfToken(),
    });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const loggedInUser = request.user.id;
  const overdue = await Todo.overdue(loggedInUser);
  const dueToday = await Todo.dueToday(loggedInUser);
  const dueLater = await Todo.dueLater(loggedInUser);
  const completedItems = await Todo.completedItems(loggedInUser);
  const allTodos = await Todo.getTodos(loggedInUser);
  if (request.accepts("html")) {
    response.render("todos", {
      title: "Todo application",
      overdue,
      dueToday,
      dueLater,
      completedItems,
      
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      overdue,
      dueToday,
      dueLater,
      allTodos,
      completedItems
    });
  }
});

app.get("/signup", (request, response) => {
  response.render("signup", {title: "Signup", csrfToken: request.csrfToken()})
})

app.post("/users", async (request,response) => {
  
  const hashedpwd = await bcrypt.hash(request.body.password, saltRounds)
  try {
    const user = await User.create({
    firstname: request.body.firstname,
    lastname: request.body.lastname,
    email: request.body.email,
    password: hashedpwd
  });
  request.login(user, (err) => {
    if(err) {
      console.log(err);
      response.redirect("/login");
    }
    response.redirect("/todos");
  });
  } catch (error) {
    request.flash("error", error.message);
    return response.redirect("/signup");
  }
})

app.get("/login", (request, response) => {
  response.render("login", { title: "login", csrfToken: request.csrfToken()});
})

app.post("/session", passport.authenticate('local', { failureRedirect: "/login", failureFlash: true}), (request, response) => {
  response.redirect("/todos");
})

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if(err){
      return next(err);
    }
    response.redirect("/");
  })
})

app.get("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      userId: request.user.id
    });
    return response.redirect("/todos");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
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
