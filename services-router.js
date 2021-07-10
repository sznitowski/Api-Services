const express = require("express");
const dbService = require("./db-service");
const utils = require("./utils");
const path = require("path");
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

  // user validation
  if (req.body.name && req.body.password && req.body.passwordConfirm) {

    // validate password
    if (req.body.password == req.body.passwordConfirm) {

  const newUser = {
    service: req.body.service,
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    description: req.body.description,
    contact: req.body.contact,
    location: req.body.location,
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
}else{
  (res.render("error", {
    error:"faltan datos.",
    
  }))
}

}else{
 (res.render("error", {
   error:"las contraseñas no coinciden.",
 }))
}
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

// login
router.get("/login", (req, res) => {
  res.render("login", {} );
})

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

// session
/*     router.get("/", (req, res) => {
  user.find((err, user) => {
    console.log(user);
  });
});
router.post("/sessions"), (req, res) => {
  user.findOne({ name: req.body.name, password:req.body.password}), (err, user) => {
    req.session.user_id = user._id
  }
}  */

module.exports = router;