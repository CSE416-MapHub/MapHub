import express from 'express';
import * as AuthController from '../controllers/auth-controller';

const router = express.Router()

router.post('/register', AuthController.registerUser)
router.get('/users', AuthController.getAllUsers)
// router.post('/login', AuthController.loginUser)
// router.get('/logout', AuthController.logoutUser)
// router.get('/loggedIn', AuthController.getLoggedIn)

export default router;
