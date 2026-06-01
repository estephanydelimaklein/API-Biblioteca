import Loan from "../models/Loan.js";
import User from "../models/User.js";
import Book from "../models/Book.js";

const createLoan = async (userId, data) => {
  const { bookId } = data;
  const daysToReturn = Number(data.diasParaDevolucao ?? 7);

  if (!bookId) {
    const error = new Error("bookId é obrigatório");
    error.statusCode = 400;
    throw error;
  }

  if (!daysToReturn || daysToReturn <= 0) {
    const error = new Error("diasParaDevolucao precisa ser maior que zero");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!user.ativo) {
    const error = new Error("Usuário inativo não pode pegar livros emprestados");
    error.statusCode = 400;
    throw error;
  }

  const book = await Book.findById(bookId);

  if (!book) {
    const error = new Error("Livro não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!book.ativo) {
    const error = new Error("Livro inativo não pode ser emprestado");
    error.statusCode = 400;
    throw error;
  }

  if (book.quantidadeDisponivel <= 0) {
    const error = new Error("Livro sem quantidade disponível");
    error.statusCode = 400;
    throw error;
  }

  const activeSameBookLoan = await Loan.findOne({
    userId,
    bookId,
    status: "ativo",
  });

  if (activeSameBookLoan) {
    const error = new Error("Usuário já possui empréstimo ativo desse livro");
    error.statusCode = 400;
    throw error;
  }

  const dataEmprestimo = new Date();

  const dataPrevistaDevolucao = new Date(dataEmprestimo);
  dataPrevistaDevolucao.setDate(
    dataPrevistaDevolucao.getDate() + daysToReturn
  );

  const loan = await Loan.create({
    userId,
    bookId,
    dataEmprestimo,
    dataPrevistaDevolucao,
    status: "ativo",
    multa: 0,
  });

  book.quantidadeDisponivel -= 1;
  await book.save();

  return Loan.findById(loan._id).populate("userId").populate("bookId");
};

const getAllLoans = async () => {
  return Loan.find()
    .populate("userId")
    .populate("bookId")
    .sort({ createdAt: -1 });
};

const getMyLoans = async (userId) => {
  return Loan.find({ userId })
    .populate("userId")
    .populate("bookId")
    .sort({ createdAt: -1 });
};

const getLoanById = async (id, currentUser) => {
  const loan = await Loan.findById(id).populate("userId").populate("bookId");

  if (!loan) {
    const error = new Error("Empréstimo não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = loan.userId._id.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("Você não tem permissão para acessar esse empréstimo");
    error.statusCode = 403;
    throw error;
  }

  return loan;
};

const getLoansByUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.statusCode = 404;
    throw error;
  }

  return Loan.find({ userId })
    .populate("userId")
    .populate("bookId")
    .sort({ createdAt: -1 });
};

const getActiveLoans = async () => {
  return Loan.find({ status: "ativo" })
    .populate("userId")
    .populate("bookId")
    .sort({ dataPrevistaDevolucao: 1 });
};

const returnLoan = async (loanId, currentUser) => {
  const loan = await Loan.findById(loanId);

  if (!loan) {
    const error = new Error("Empréstimo não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = loan.userId.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("Você não tem permissão para devolver esse empréstimo");
    error.statusCode = 403;
    throw error;
  }

  if (loan.status === "devolvido") {
    const error = new Error("Esse empréstimo já foi devolvido");
    error.statusCode = 400;
    throw error;
  }

  const book = await Book.findById(loan.bookId);

  if (!book) {
    const error = new Error("Livro não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const dataDevolucao = new Date();

  let diasDeAtraso = 0;
  let multa = 0;

  if (dataDevolucao > loan.dataPrevistaDevolucao) {
    const diferencaEmMilissegundos =
      dataDevolucao.getTime() - loan.dataPrevistaDevolucao.getTime();

    diasDeAtraso = Math.ceil(
      diferencaEmMilissegundos / (1000 * 60 * 60 * 24)
    );

    multa = diasDeAtraso * 2;
  }

  loan.dataDevolucao = dataDevolucao;
  loan.status = "devolvido";
  loan.multa = multa;

  book.quantidadeDisponivel += 1;

  if (book.quantidadeDisponivel > book.quantidadeTotal) {
    book.quantidadeDisponivel = book.quantidadeTotal;
  }

  await loan.save();
  await book.save();

  return Loan.findById(loan._id).populate("userId").populate("bookId");
};

const getOverdueLoans = async () => {
  return Loan.find({
    status: "ativo",
    dataPrevistaDevolucao: { $lt: new Date() },
  })
    .populate("userId")
    .populate("bookId")
    .sort({ dataPrevistaDevolucao: 1 });
};

const simulateFine = async (loanId, currentUser) => {
  const loan = await Loan.findById(loanId).populate("userId").populate("bookId");

  if (!loan) {
    const error = new Error("Empréstimo não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = loan.userId._id.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("Você não tem permissão para simular multa desse empréstimo");
    error.statusCode = 403;
    throw error;
  }

  if (loan.status === "devolvido") {
    return {
      diasDeAtraso: 0,
      multa: loan.multa,
      message: "Empréstimo já devolvido. Multa registrada no empréstimo",
    };
  }

  const dataAtual = new Date();

  let diasDeAtraso = 0;
  let multa = 0;

  if (dataAtual > loan.dataPrevistaDevolucao) {
    const diferencaEmMilissegundos =
      dataAtual.getTime() - loan.dataPrevistaDevolucao.getTime();

    diasDeAtraso = Math.ceil(
      diferencaEmMilissegundos / (1000 * 60 * 60 * 24)
    );

    multa = diasDeAtraso * 2;
  }

  return {
    diasDeAtraso,
    multa,
  };
};

export default {
  createLoan,
  getAllLoans,
  getMyLoans,
  getLoanById,
  getLoansByUser,
  getActiveLoans,
  returnLoan,
  getOverdueLoans,
  simulateFine,
};