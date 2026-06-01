import Book from "../models/Book.js";
import Loan from "../models/Loan.js";

const createBook = async (data) => {
  const { titulo, autor, categoria, ano, quantidadeTotal } = data;

  if (!titulo || !autor || quantidadeTotal === undefined) {
    const error = new Error("Título, autor e quantidadeTotal são obrigatórios");
    error.statusCode = 400;
    throw error;
  }

  if (quantidadeTotal <= 0) {
    const error = new Error("quantidadeTotal precisa ser maior que zero");
    error.statusCode = 400;
    throw error;
  }

  const book = await Book.create({
    titulo,
    autor,
    categoria,
    ano,
    quantidadeTotal,
    quantidadeDisponivel: quantidadeTotal,
    ativo: true,
  });

  return book;
};

const getAllBooks = async () => {
  return Book.find().sort({ createdAt: -1 });
};

const getBookById = async (id) => {
  const book = await Book.findById(id);

  if (!book) {
    const error = new Error("Livro não encontrado");
    error.statusCode = 404;
    throw error;
  }

  return book;
};

const searchBooksByTitle = async (title) => {
  return Book.find({
    titulo: { $regex: title, $options: "i" },
  }).sort({ titulo: 1 });
};

const getBooksByCategory = async (category) => {
  return Book.find({
    categoria: { $regex: `^${category}$`, $options: "i" },
  }).sort({ titulo: 1 });
};

const getAvailableBooks = async () => {
  return Book.find({
    ativo: true,
    quantidadeDisponivel: { $gt: 0 },
  }).sort({ titulo: 1 });
};

const updateBook = async (id, data) => {
  const book = await Book.findById(id);

  if (!book) {
    const error = new Error("Livro não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (data.quantidadeTotal !== undefined) {
    if (data.quantidadeTotal <= 0) {
      const error = new Error("quantidadeTotal precisa ser maior que zero");
      error.statusCode = 400;
      throw error;
    }

    const borrowedQuantity = book.quantidadeTotal - book.quantidadeDisponivel;

    if (data.quantidadeTotal < borrowedQuantity) {
      const error = new Error(
        "Não é possível deixar quantidadeTotal menor que a quantidade já emprestada"
      );
      error.statusCode = 400;
      throw error;
    }

    book.quantidadeTotal = data.quantidadeTotal;
    book.quantidadeDisponivel = data.quantidadeTotal - borrowedQuantity;
  }

  if (data.titulo !== undefined) {
    book.titulo = data.titulo;
  }

  if (data.autor !== undefined) {
    book.autor = data.autor;
  }

  if (data.categoria !== undefined) {
    book.categoria = data.categoria;
  }

  if (data.ano !== undefined) {
    book.ano = data.ano;
  }

  await book.save();

  return book;
};

const deactivateBook = async (id) => {
  const book = await Book.findById(id);

  if (!book) {
    const error = new Error("Livro não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!book.ativo) {
    const error = new Error("Livro já está desativado");
    error.statusCode = 400;
    throw error;
  }

  const activeLoansCount = await Loan.countDocuments({
    bookId: id,
    status: "ativo",
  });

  if (activeLoansCount > 0) {
    const error = new Error(
      "Não é possível desativar livro com empréstimos ativos"
    );
    error.statusCode = 400;
    throw error;
  }

  book.ativo = false;

  await book.save();

  return book;
};

const activateBook = async (id) => {
  const book = await Book.findById(id);

  if (!book) {
    const error = new Error("Livro não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (book.ativo) {
    const error = new Error("Livro já está ativo");
    error.statusCode = 400;
    throw error;
  }

  book.ativo = true;

  await book.save();

  return book;
};

export default {
  createBook,
  getAllBooks,
  getBookById,
  searchBooksByTitle,
  getBooksByCategory,
  getAvailableBooks,
  updateBook,
  deactivateBook,
  activateBook,
};