import Book from "../models/book.js";

const postBook = async (data) => {
  const { titulo, autor, categoria, ano, quantidadeTotal } = data;

  if (!titulo || !autor || !categoria || !ano || quantidadeTotal === undefined) {
    const error = new Error("título, autor, categoria, ano, quantidadeTotal são obrigatórios");
    error.statusCode = 400;
    throw error;
  }

  const bookExists = await Book.findOne({ titulo });

  if (bookExists) {
    const error = new Error("Já existe esse livro deste autor");
    error.statusCode = 400;
    throw error;
  }
  
  return await Book.create({
    titulo,
    autor,
    categoria,
    ano,
    quantidadeTotal,
    quantidadeDisponivel: quantidadeTotal,
  });
};

const getBook = async () => {
  return Book.find();
};

const getBookById = async (id) => {
  const book = await Book.findById(id);

  if (!book) {
    const error = new Error("Book não encontrado");
    error.statusCode = 404;
    throw error;
  }

  return book;
};

export default {
  postBook,
  getBook,
  getBookById,
};

