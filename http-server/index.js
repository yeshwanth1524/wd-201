const http = require("http");
const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2));

const homeContent = fs.readFileSync("home.html", "utf-8");
const projectContent = fs.readFileSync("project.html", "utf-8");
const registrationContent = fs.readFileSync("registration.html", "utf-8");

const server = http.createServer((request, response) => {
  const url = request.url;

  response.setHeader("Content-Type", "text/html");

  switch (url) {
    case "/project":
      response.write(projectContent);
      break;
    case "/registration":
      response.write(registrationContent);
      break;
    default:
      response.write(homeContent);
      break;
  }

  response.end();
});

const port = argv.port || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});