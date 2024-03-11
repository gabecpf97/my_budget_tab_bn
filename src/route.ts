import express from "express";
import userController from "./controller/userController";
import passport from "passport";
import itemController from "./controller/itemController";
const router = express.Router();
const auth = passport.authenticate('jwt', { session: false });

// routes for user api calls
router.post('/user/create', userController.user_create);
router.delete('/user', auth, userController.user_delete);
router.put('/user', auth, userController.user_edit);
router.get('/user', auth, userController.user_get);
router.post('/user/login', userController.user_login);
router.put('/user/change_password', auth, userController.user_changePassword);

// routes for item api calls 
router.get('/item/:id', auth, itemController.item_get);
router.post('/item/create', auth, itemController.item_create);
router.put('/item', auth, itemController.item_edit);
router.delete('/item', auth, itemController.item_delete);

export default router;