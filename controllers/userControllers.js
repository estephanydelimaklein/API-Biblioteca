import userService from "../services/userServices.js";

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUser();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const putUserById = async (req, res, next) => {
  try {
    const user = await userService.putUserById(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const patchUserById = async (req, res, next) => {
  try {
    const user = await userService.patchUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};


export default {

  createUser,
  getUser,
  getUserById,
  putUserById,
  patchUserById,

}