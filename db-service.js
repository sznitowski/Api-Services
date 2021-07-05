const mongodb = require("mongodb");
const connURL =
  "mongodb+srv://sznitowski:a32110804@cluster0.tznzh.mongodb.net/servicestest?authSource=admin&replicaSet=atlas-uryh7n-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";
const mongTopo = { useUnifiedTopology: true };
const dbName = "services";
const UsersCollName = "user";

//  consultar en la base de datos por servicios
function getAllUsersByService(service, cbError, cbData) {
  mongodb.MongoClient.connect(connURL, mongTopo, (err, conn) => {
    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }
    const UsersCollection = conn.db(dbName).collection(UsersCollName);

    UsersCollection.find({ service: { $regex: service } }).toArray(
      (err, users) => {
        if (err) {
          console.log("Hubo un error convirtiendo la consulta a Array:", err);
          conn.close();
          return;
        }

        cbData(users);
      }
    );
  });
}

//  consultar en la base de datos por ubicacion, 123 probando
/*   function getAllUsersByLocation(location, cbError, cbData) {
  mongodb.MongoClient.connect(connURL, mongTopo, (err, conn) => {
    if (err) {
      console.log("Hubo un error conectando con el servidor:", err);
      cbError(err);
      return;
    }
    const UsersLocation = conn.db(dbName).collection(UsersCollName);

      UsersLocation.find({ location: {$regex: location} }).toArray(
      (err, data) => {
        if (err) {
          console.log("Hubo un error convirtiendo la consulta a Array:", err);
          conn.close();
          return;
        }

        cbData(data);
      }
    );
  });
} */

// crear usuario
const insertUser = (newUser, cbError, cbOk) => {
  mongodb.MongoClient.connect(connURL, mongTopo, (err, conn) => {
    if (err) {
      cbError(err);
      return;
    }

    const UsersCollection = conn.db(dbName).collection(UsersCollName);

    UsersCollection.insertOne(newUser, (err, result) => {
      if (err) {
        cbError(err);
        return;
      }

      conn.close();

      cbOk();
    });
  });
};

// modificar
const updateUser = (id, newData, cbError, cbOk) => {
  mongodb.MongoClient.connect(connURL, mongTopo, (err, conn) => {
    if (err) {
      cbError(err);
      return;
    }

    const UsersCollection = conn.db(dbName).collection(UsersCollName);

    UsersCollection.updateOne(
      { _id: mongodb.ObjectId(id) },
      {
        $set: {
          service: newData.service,
          img: newData.coverUrl,
          name: newData.name,
          location: newData.location,
          contact: newData.contact,
        },
      },
      (err, result) => {
        if (err) {
          cbError(err);
          return;
        }

        conn.close();

        cbOk();
      }
    );
  });
};

// borrar
const deleteUser = (id, cbError, cbOk) => {
  mongodb.MongoClient.connect(connURL, mongTopo, (err, conn) => {
    if (err) {
      cbError(err);
      return;
    }

    const UsersCollection = conn.db(dbName).collection(UsersCollName);

    UsersCollection.deleteOne({ _id: mongodb.ObjectId(id) }, (err, resul) => {
      if (err) {
        cbError(err);
        return;
      }

      conn.close();

      cbOk();
    });
  });
};

// login
const logUser = (credentials, cbError, cbData) => {
  mongodb.MongoClient.connect(connURL, mongTopo, (err, conn) => {
    if (err) {
      cbError(err);
      return;
    }

    const UsersCollection = conn.db(dbName).collection(UsersCollName);

    UsersCollection.findOne(
      { name: credentials.name, password: credentials.password },
      (err, user) => {
        if (err) {
          cbError(err);
          return;
        }

        conn.close();

        cbData(user);
      }
    );
  });
};

module.exports = {
  getAllUsersByService,
  //getAllUsersByLocation,
  insertUser,
  updateUser,
  deleteUser,
  logUser,
};
