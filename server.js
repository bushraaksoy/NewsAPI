import express from 'express';
import 'dotenv/config';
import fileUpload from 'express-fileupload';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(fileUpload());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.json({ message: 'its working' });
});

// Import routes
import ApiRoutes from './routes/api.js';
app.use('/api', ApiRoutes);

app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
