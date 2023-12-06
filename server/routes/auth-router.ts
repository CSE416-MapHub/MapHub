import express from 'express';
import * as AuthController from '../controllers/auth-controller';
import auth from '../auth';

const router = express.Router();

router.post('/register', AuthController.registerUser);
router.get('/users', AuthController.getAllUsers);
router.get('/exists', AuthController.getExists);
router.get('/id', AuthController.getUserById);
router.get('/profile-picture', AuthController.getProfilePic);
router.get('/verify', AuthController.getVerify);
router.post('/username', auth.verify, AuthController.postUsername);
router.post('/login', AuthController.loginUser);
router.post('/logout', AuthController.logoutUser);
// router.get('/loggedIn', AuthController.getLoggedIn)

router.post('/request-reset-password', AuthController.getResetPasswordLink);
router.post('/reset-password/:token', AuthController.handlePasswordResetting);

export default router;
