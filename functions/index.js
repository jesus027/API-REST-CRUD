/* eslint-disable no-unused-vars */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();

const permisos = require("../permisos.json");
admin.initializeApp({
  credential: admin.credential.cert(permisos),
  databaseURL: "http://localhost:5000/book-test-api/us-central1/app",
});

const db = admin.firestore();

app.use(cors({origin: true}));

/* app.post("/api/books", (request, response) => {
  (async () => {
    try {
      await db.collection("books").doc("/" + request.body.id + "/")
          .create({title: request.body.titulo})
          .create({author: request.body.author})
          .create({year: request.body.year})
          .create({description: request.body.description});
      return response.status(200).send();
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  })();
});*/

// eslint-disable-next-line require-jsdoc
function exit(code, input) {
  const today = new Date();
  const date = today.getFullYear()+"-" +
            (today.getMonth()+1)+"-" +
            today.getDate()+"|" +
            today.getHours()+":" +
            today.getMinutes()+":" +
            today.getSeconds();

  if (code === "200") {
    return {
      message: "Proceso Terminado",
      archive: date,
      result: input,
    };
  }

  if (code === "201") {
    return {
      message: "Elemento Creado Satisfactoriamente",
      archive: date,
      result: input,
    };
  }

  if (code === "500") {
    return {
      message: "Ocurrio un detalle en el servidor",
      archive: date,
      result: input,
    };
  }

  return {
    message: "Ocurrio un detalle en el servidor",
    archive: date,
    result: input,
  };
}

/* Crea un nuevo libro con la información proporcionada (id, title,
author, year, description) */

app.post("/api/books", (request, response) => {
  (async () => {
    try {
      await db.collection("books").doc("/" + request.body.id + "/")
          .set({
            title: request.body.title,
            author: request.body.author,
            year: request.body.year,
            description: request.body.description,
          });
      return response.status(200).send(exit("200", "Libro creado"));
    } catch (error) {
      console.log(error);
      return response.status(500).send(exit("500", error));
    }
  })();
});

/* Devuelve una lista de todos los libros almacenados en Firebase
Firestore. */

app.get("/api/books", async (request, res) => {
  try {
    // eslint-disable-next-line prefer-const
    let query = db.collection("books");
    const querySnapshot = await query.get();
    // eslint-disable-next-line prefer-const
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      author: doc.data().author,
      year: doc.data().year,
      description: doc.data().description,
    }));

    return res.status(200).json(exit("200", response));
  } catch (error) {
    return res.status(500).json(exit("500", error));
  }
});

// Devuelve los detalles de un libro específico según su ID

app.get("/api/books/:book_id", (request, res) => {
  (async () => {
    try {
      const doc = db.collection("books").doc(request.params.book_id);
      const item = await doc.get();
      const response = item.data();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).send(exit("500", error));
    }
  })();
});

// Actualiza la información de un libro existente según su ID.

app.put("/api/books/:book_id", async (request, response) => {
  try {
    const document = db.collection("books").doc(request.params.book_id);

    await document.update({
      title: request.body.title,
      author: request.body.author,
      year: request.body.year,
      description: request.body.description,
    });

    return response.status(200).json(exit("200", "Libro Actualizado"));
  } catch (error) {
    return response.status(500).json(exit("500", error));
  }
});

// Elimina un libro específico según su ID.

app.delete("/api/books/:book_id", async (request, response) => {
  try {
    const doc = db.collection("books").doc(request.params.book_id);
    await doc.delete();
    return response.status(200).json(exit("200", "Libro Borrado"));
  } catch (error) {
    return response.status(500).json(exit("500", error));
  }
});

exports.app = functions.https.onRequest(app);

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
// eslint-disable-next-line no-unused-vars
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
