import bookService from "../services/bookServices.js";
//import userService from "../services/userServices.js";

const postBook = async (req, res, next) => {
     try {
    const book = await bookService.postBook(req.body);
     res.json(book);
     } catch (error) {
     next(error);
      }
    };
    
    const getBook = async (req, res, next) => {
      try {
     const books = await bookService.getBook();
      res.json(books);
      } catch (error) {
      next(error);
       }
     };

     const getBookById = async (req, res, next) => {
      try {
     const books = await bookService.getBookById(req.params.id);
      res.json(books);
      } catch (error) {
      next(error);
       }
     };

    export default {
      getBook,
      postBook,
      getBookById,
    }

    