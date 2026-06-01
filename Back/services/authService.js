import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const register = async (data) => {
  const { nome, email, password, telefone, role } = data;

  if (!nome || !email || !password) {
    const error = new Error("Nome, email e senha são obrigatórios");
    error.statusCode = 400;
    throw error;
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    const error = new Error("Já existe um usuário com esse email");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    nome,
    email,
    password: hashedPassword,
    telefone,
    role: role || "user",
    ativo: true,
  });

  return {
    _id: user._id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    role: user.role,
    ativo: user.ativo,
  };
};

const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    const error = new Error("Email e senha são obrigatórios");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Email ou senha inválidos");
    error.statusCode = 401;
    throw error;
  }

  if (!user.ativo) {
    const error = new Error("Usuário inativo. Entre em contato com a administração");
    error.statusCode = 403;
    throw error;
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (!passwordIsCorrect) {
    const error = new Error("Email ou senha inválidos");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

  return {
    user: {
      _id: user._id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      role: user.role,
      ativo: user.ativo,
    },
    token,
  };
};

export default {
  register,
  login,
};