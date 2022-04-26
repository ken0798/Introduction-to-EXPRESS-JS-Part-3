const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "goodreads.db");

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", (request, response) => {
  const { bookId } = request.params;
  const specificBookQuery = `
    SELECT * FROM book
    WHERE book_id =${bookId};`;
  db.get(specificBookQuery).then((specificBook) => {
    response.send(specificBook);
  });
});

//POST API add Book
app.post("/books", (req, res) => {
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBook = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  db.run(addBook).then((ok) => {
    res.send(ok.lastID);
  });
});

//update Book API
app.put("/books/:bookId", (req, res) => {
  const { bookId } = req.params;
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  db.run(updateBookQuery).then((result) => {
    res.send(result.lastID);
  });
});

//Delete a book
app.delete("/books/:bookID", (req, res) => {
  const { bookID } = req.params;
  const deleteQuery = `DELETE 
  FROM book 
  WHERE 
  book_id=${bookID} ;`;
  db.run(deleteQuery).then((ans) => {
    res.send(`deleted the book with id ${bookID}`);
  });
});

app.listen(3000, () => {
  console.log("Server Running at http://localhost:3000/");
});
