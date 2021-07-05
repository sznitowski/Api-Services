const express = require("express");
const expHbs = require("express-handlebars");
const path = require("path");
const servicesRouter = require("./services-router");
//const session = require("express-session");


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
  /* partialsDir: "client/views/partials", */
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

// Configuración de sesiones
/* app.use(session({
  secret: "asd123asd123",
  resave: false,
  saveUninitialized: false
}))  */


// buscar
 app.get("/list", (req, res) => {
  res.render("services");
}); 


// port
app.listen(3000, () => {
  console.log("EL Servidor corre en el puerto 3000...");
});
