import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import UserController from '../controllers/UserController.js';
import ProfileController from '../controllers/ProfileController.js';
import authMiddleware from '../middlewares/Authenticate.js';
import NewsController from '../controllers/NewsController.js';

const router = Router();

//  Authentication Routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// Profile Routes
router.get('/profile', authMiddleware, ProfileController.index); // Private Route
router.put('/profile/:id', authMiddleware, ProfileController.update); // Private Route

// User Routes
router.get('/users/:id', UserController.getUser);
router.get('/users/', UserController.getAllUsers);

// News Routes
router.post('/news', authMiddleware, NewsController.store);
router.get('/news', authMiddleware, NewsController.index);
router.get('/news/:id', authMiddleware, NewsController.show);
router.put('/news/:id', authMiddleware, NewsController.update);
router.delete('/news/:id', authMiddleware, NewsController.destroy);

export default router;
