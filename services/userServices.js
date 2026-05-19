import User from "../models/users.js";
//import Sale from "../models/Sale.js";

const createUser = async (data) => {
  const { nome, email, telefone, senha, idade } = data;

  if (!nome || !email || !telefone || !senha || idade === undefined) {
    const error = new Error("Nome, email, telefone, senha e idade são obrigatórios");
    error.statusCode = 400;
    throw error;
  }
  const userExists = await User.findOne({ email });

  if (userExists) {
    const error = new Error("Já existe um usuário com esse email");
    error.statusCode = 400;
    throw error;
  }

  return User.create({ nome, email, telefone, senha, idade });
};

const getUser = async () => {
  return User.find();
};

const getUserById = async (id) => {
  return User.findById(id);
};

const putUserById = async (id, data) => {

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return user;
};

const patchUserById = async (id) => {

    const user = await User.findByIdAndUpdate(
      id,
      {  $set: {ativo: false} },
      { new: true, runValidators: true }
    );

  return user;

};

export default {

  createUser,
  getUser,
  getUserById,
  putUserById,
  patchUserById,

}