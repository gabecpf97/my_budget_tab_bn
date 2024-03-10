import express from "express";
import userController from "./controller/userController";
import passport from "passport";
const router = express.Router();
const auth = passport.authenticate('jwt', { session: false });

// api calls route for user
router.post('/user/create', userController.user_create);
router.delete('/user', auth, userController.user_delete);
router.put('/user', auth, userController.user_edit);
router.get('/user', auth, userController.user_get);
router.post('/user/login', userController.user_login);
router.put('/user/change_password', auth, userController.user_changePassword);

export default router;