const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name = _csrf]").val();
}

const login = async (agent, email, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: email,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up",async()=>{
    const res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    const res1 = await agent.post("/users").send({
      firstname:"Test",
      lastName:"User A",
      email:"user.a@test.com",
      password:"12345678",
      _csrf:csrfToken,
    });
    expect(res1.statusCode).toBe(302);
  });

  test("Sign Out", async () => {
    let res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    res = await agent.get("/signout").send({
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const agent=request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy pc",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });


  test("Marks a todo with the given ID as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "buy pc",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const parsedResponse1 = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(parsedResponse1.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  
  test("Marks a todo as incomplete", async () => {
    // Create a todo
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
  
    await agent.post("/todos").send({
      title: "Buy pc",
      dueDate: new Date().toISOString(),
      _csrf: csrfToken,
    });
  
    // Mark the todo as complete and assert it has changed to true
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    let parsedResponse = await agent.get("/todos").set("Accept", "application/json");
    let getparsed = JSON.parse(parsedResponse.text);
    let dueTodayCount = getparsed.dueToday.length;
    let latestTodo = getparsed.dueToday[dueTodayCount - 1];
    let markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });

  let parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
  expect(parsedUpdateResponse.completed).toBe(true);

  // Mark the todo as incomplete and assert it has changed to false
  res = await agent.get("/todos");
  csrfToken = extractCsrfToken(res);
  parsedResponse = await agent.get("/todos").set("Accept", "application/json");
  getparsed = JSON.parse(parsedResponse.text);
  dueTodayCount = getparsed.dueToday.length;
  latestTodo = getparsed.dueToday[dueTodayCount - 1];
  let markIncompleteResponse = await agent
    .put(`/todos/${latestTodo.id}`)
    .send({
      _csrf: csrfToken,
      completed: false,
    });

  let parsedUpdateResponse2 = JSON.parse(markIncompleteResponse.text);
  expect(parsedUpdateResponse2.completed).toBe(false);
});

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    // Create a new todo
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy pc",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
  
    const parsedResponse = await agent.get("/todos").set("Accept", "application/json");
    const parsedID = JSON.parse(parsedResponse.text);
    expect(parsedID.dueToday).toBeDefined();
    const dueTodayCount = parsedID.dueToday.length;
    const presentTodo = parsedID.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const deleted = await agent.delete(`/todos/${presentTodo.id}`).send({
      _csrf: csrfToken,
    });
    const DeletedResponse1 = JSON.parse(deleted.text);

    expect(DeletedResponse1).toBe(true);
  });
});
