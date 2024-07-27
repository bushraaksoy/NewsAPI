import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import fileUpload from 'express-fileupload';
import { limiter } from './config/ratelimiter.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(fileUpload());
app.use(express.json());
app.use(express.static('public'));
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(limiter);

app.get('/', (req, res) => {
    res.json({ message: 'its working' });
});

// Import routes
import ApiRoutes from './routes/api.js';
import rateLimit from 'express-rate-limit';
app.use('/api', ApiRoutes);

app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
