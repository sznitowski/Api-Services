const express = require("express");
const expHbs = require("express-handlebars");
const path = require("path");
const servicesRouter = require("./services-router");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static(path.join(__dirname, "client")));
// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handlebars
app.engine(
  "handlebars",
  expHbs({
    defaultLayout: "main",
    layoutsDir: "client/views/layouts",
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "client/views"));

// Router
app.use("/users", servicesRouter);

 app.get("/", (req, res) => {
  res.render("home", {
  });
}); 
// login
app.get("/login", (req, res) => {
  res.render("login");
});
//user validation

app.get("/", (req, res) => {
  res.render("regist", { service: "services" });
});
// session
app.use(session({
  secret: "comunidad It",
  resave: false,
  saveUninitialized: false
})) 
app.use(bodyParser.urlencoded({extended: true}));
// port
app.listen(3000, () => {
  console.log("EL Servidor corre en el puerto 3000...");
});
