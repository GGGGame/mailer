import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';
import cors from 'cors';
import { logger } from './logger.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import session from 'express-session';

dotenv.config();
const app = express();

const corsOptions = {
    origin: ['http://localhost:3040', 'http://localhost:100', 'http://localhost:5173'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    credentials: true,
}

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10
});

app.use(limiter);

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true, sameSite: 'strict' }
}));

// CSRF Protection
app.use((req, res, next) => {
    try {
        if (!req.session.csrfToken) {
            req.session.csrfToken = crypto.randomBytes(24).toString('hex');
        }
        res.cookie('csrfToken', req.session.csrfToken, { httpOnly: true, secure: true, sameSite: 'strict' });
        req.csrfToken = req.session.csrfToken;
        next();
        logger.info('CSRF token generated');
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken });
});

app.use('/v1', routes);
app.use((req, res, next) => {
    logger.warn(`Attempted Route: ${req.originalUrl}`)
    res.status(404).json({ error:'Route not found'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server started with port: ${PORT}`);
});
