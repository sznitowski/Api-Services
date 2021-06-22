const mongodb = require("mongodb");
const connURL = "mongodb+srv://sznitowski:a32110804@cluster0.tznzh.mongodb.net/servicestest?authSource=admin&replicaSet=atlas-uryh7n-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";
const mongTopo = { useUnifiedTopology: true };
const dbName = "services";
const UsersCollName = "user";

// buscar varios
const getAllUsers = (sortBy, cbError, cbData) => {
  mongodb.MongoClient.connect(connURL, mongTopo, (err, conn) => {
    if (err) {
      cbError(err);
      return;
    }

    const UsersCollection = conn.db(dbName).collection(UsersCollName);

    let sortObject;

    switch (sortBy) {
      case "service":
        sortObject = { service: 1 };
        break;
      case "img":
        sortObject = { img: 1 };
        break;
      case "name":
        sortObject = { name: 1 };
        break;
      case "location":
        sortObject = { location: 1 };
        break;
      case "contact":
        sortObject = { contact: 1 };
        break;
      default:
        sortObject = {};
        break;
    }

    UsersCollection.find()
      .sort(sortObject)
      .toArray((err, UsersList) => {
        if (err) {
          cbError(err);
          return;
        }

        conn.close();

        cbData(UsersList);
      });
  });
};
// buscar uno
const getUser = (id, cbError, cbData) => {
  mongodb.MongoClient.connect(connURL, mongTopo, (err, conn) => {
    if (err) {
      cbError(err);
      return;
    }

    const UsersCollection = conn.db(dbName).collection(UsersCollName);

    UsersCollection.findOne({ _id: mongodb.ObjectId(id) }, (err, user) => {
      if (err) {
        cbError(err);
        return;
      }

      conn.close();

      cbData(user);
    });
  });
};

// crear
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
  getAllUsers,
  getUser,
  insertUser,
  updateUser,
  deleteUser,
  logUser,
};
