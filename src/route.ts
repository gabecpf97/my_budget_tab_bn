import express from "express";
import userController from "./controller/userController";
import passport from "passport";
import itemController from "./controller/itemController";
import listController from "./controller/listController";
const router = express.Router();
const auth = passport.authenticate('jwt', { session: false });

// routes for user api calls
router.get('/user', auth, userController.user_get);
router.put('/user', auth, userController.user_edit);
router.delete('/user', auth, userController.user_delete);
router.post('/user/create', userController.user_create);
router.post('/user/login', userController.user_login);
router.put('/user/change_password', auth, userController.user_changePassword);

// routes for item api calls 
router.get('/item/:id', auth, itemController.item_get);
router.post('/item/create', auth, itemController.item_create);
router.put('/item', auth, itemController.item_edit);
router.delete('/item/:id', auth, itemController.item_delete);

// routes for list api calls 
router.get('/list/:id', auth, listController.list_get);
router.post('/list/create', auth, listController.list_create);
router.put('/list', auth, listController.list_edit);
router.delete('/list/:id', auth, listController.list_delete);

export default router;