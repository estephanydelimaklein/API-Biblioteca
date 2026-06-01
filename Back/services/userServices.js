import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Loan from "../models/Loan.js";

const getAllUsers = async () => {
  return User.find().sort({ createdAt: -1 });
};

const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateMe = async (userId, data) => {
  delete data.role;
  delete data.ativo;
  delete data.password;

  if (data.email) {
    const emailExists = await User.findOne({
      email: data.email,
      _id: { $ne: userId },
    });

    if (emailExists) {
      const error = new Error("Já existe outro usuário com esse email");
      error.statusCode = 400;
      throw error;
    }
  }

  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateUser = async (id, data) => {
  if (data.email) {
    const emailExists = await User.findOne({
      email: data.email,
      _id: { $ne: id },
    });

    if (emailExists) {
      const error = new Error("Já existe outro usuário com esse email");
      error.statusCode = 400;
      throw error;
    }
  }

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const deactivateUser = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!user.ativo) {
    const error = new Error("Usuário já está desativado");
    error.statusCode = 400;
    throw error;
  }

  const activeLoansCount = await Loan.countDocuments({
    userId: id,
    status: "ativo",
  });

  if (activeLoansCount > 0) {
    const error = new Error(
      "Não é possível desativar usuário com empréstimo ativo"
    );
    error.statusCode = 400;
    throw error;
  }

  user.ativo = false;

  await user.save();

  return user;
};

const activateUser = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (user.ativo) {
    const error = new Error("Usuário já está ativo");
    error.statusCode = 400;
    throw error;
  }

  user.ativo = true;

  await user.save();

  return user;
};

export default {
  getAllUsers,
  getUserById,
  updateMe,
  updateUser,
  deactivateUser,
  activateUser,
};