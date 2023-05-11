const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name = _csrf]").val();
}

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

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res = await agent.get("/");
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
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy pc",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const parsedResponse = await agent .get("/") .set("Accept", "application/json");
    const getparsed = JSON.parse(parsedResponse.text);
    const dueTodayCount = getparsed.dueToday.length;
    const latestTodo = getparsed.dueToday[dueTodayCount - 1];
    const bool=latestTodo.completed?false:true;
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: bool,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(bool);
  }); 
    
  test("Marks a todo as incomplete", async () => {
    // Create a todo
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
  
    await agent.post("/todos").send({
      title: "Buy pc",
      dueDate: new Date().toISOString(),
      _csrf: csrfToken,
    });
  
    // Mark the todo as complete and assert it has changed to true
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const parsedResponse = await agent.get("/").set("Accept", "application/json");
    const getparsed = JSON.parse(parsedResponse.text);
    const dueTodayCount = getparsed.dueToday.length;
    const latestTodo = getparsed.dueToday[dueTodayCount - 1];
    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
  
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  
    // Mark the todo as incomplete and assert it has changed to false
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const parsedResponse2 = await agent.get("/").set("Accept", "application/json");
    const getparsed2 = JSON.parse(parsedResponse2.text);
    const dueTodayCount2 = getparsed2.dueToday.length;
    const latestTodo2 = getparsed2.dueToday[dueTodayCount2 - 1];
    const markIncompleteResponse = await agent
      .put(`/todos/${latestTodo2.id}`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });
  
    const parsedUpdateResponse2 = JSON.parse(markIncompleteResponse.text);
    expect(parsedUpdateResponse2.completed).toBe(false);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    // Create a new todo
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy pc",
      dueDate: new Date().toISOString(),
      _csrf: csrfToken,
    });
  
    const parsedResponse = await agent .get("/") .set("Accept", "application/json");
    const parsedID = JSON.parse(parsedResponse.text);
    expect(parsedID.dueToday).toBeDefined();
    const dueTodayCount = parsedID.dueToday.length;
    const presentTodo = parsedID.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const deleted = await agent.delete(`/todos/${presentTodo.id}`).send({
      _csrf: csrfToken,
    });
    const DeletedResponse1 = JSON.parse(deleted.text);

    expect(DeletedResponse1).toBe(true);
  });
});
