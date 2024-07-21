import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import UserController from '../controllers/UserController.js';
import ProfileController from '../controllers/ProfileController.js';
import authMiddleware from '../middlewares/Authenticate.js';

const router = Router();

//  Authentication Routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// Profile Routes
router.get('/profile', authMiddleware, ProfileController.index); // Private Route

// User Routes
router.get('/users/:id', UserController.getUser);
router.get('/users/', UserController.getAllUsers);

export default router;
