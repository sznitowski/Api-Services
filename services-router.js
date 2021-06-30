const express = require("express");
const dbService = require("./db-service");
const utils = require("./utils");
const path = require("path");
//const session = require("express-session");
const router = express.Router();-


// Static
router.use(express.static(path.join(__dirname, "client")));

// buscar por servicio
 router.get("/list", (req, res) => {
  let service = "";
  const findUsersByService =  req.query.service ||"" ;

  dbService.getAllUsersByService(
    findUsersByService.toLowerCase(),

    (err) => {
      res.render("error", {
        error: err,
      });
      return;
    },
    (users) => {
      res.render("services", {
        users: utils.formatUserListForView(users),
        service,
        
      });
      return;
    }
  );
});

// buscar por ubicacion
/* router.get("/list", (req, res) => {
  let location = ""; 
  const findUsersByLocation = { location: { $regex: req.query.location ||"" } };

 dbService.getAllUsersByLocation(
   findUsersByLocation.toLowerCase(),

   (err) => {
     res.render("error", {
       error: err,
     });
     return;
   },
   (data) => {
     res.render("services", {
       data: utils.formatUserListForView(data),
       location,

     });
     return;
   }
 );
}); */

// crear usuario
router.get("/showCreate", (req, res) => {
  res.render("regist", {});
});

router.post("/newService", (req, res) => {
  console.log(req.body);

  if (!utils.isValidUserData(req.body)) {
    res.render("error", {
      error: "Datos no válidos para la creación.",
    });
    return;
  }

  const newUser = {
    service: req.body.service,
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    location: req.body.location,
    contact: req.body.contact,
    img: req.body.coverUrl,
  };

  dbService.insertUser(
    newUser,
    (err) => {
      res.render("error", {
        error: err,
      });
    },
    () => {
      res.redirect("/users/list");
    }
  );
});

// modificar
router.post("/update", (req, res) => {
  if (!req.body.id || !utils.isValidUserData(req.body)) {
    res.render("error", {
      error: "Datos no válidos para la actualización.",
    });
    return;
  }

  dbService.updateUser(
    req.body.id,
    req.body,
    (err) => {
      res.render("error", {
        error: err,
      });
    },
    () => {
      res.redirect("/users/list");
    }
  );
});

// borrar
router.get("/delete", (req, res) => {
  if (!req.query.id) {
    res.render("error", {
      error: "Información no válida",
    });
    return;
  }

  dbService.deleteUser(
    req.query.id,
    (err) => {
      res.render("error", {
        error: err,
      });
    },
    () => {
      res.redirect("/users/list");
    }
  );
});

// login user 
router.post("/login", (req, res) => {
  const date = {name: req.body.name, password: req.body.password};
  let loginValido = false;
  dbService.logUser(
    date, 
    (err) => {
      res.render("error", {
        error: err,
      });
    },
    (user) => {
      console.log(user)
      if(user){
        res.render("user");
      } else {
        res.render("error")
      }
    }
  );
});

module.exports = router;
