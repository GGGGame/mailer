import express from 'express';
import { EmailDTO } from './DTO/EmailDTO.js';
import { Mailer } from './Mailer.js';
import { logger } from './logger.js';
import dotenv from 'dotenv';
import { queueEmail } from './publisher.js';
dotenv.config();

const router = express.Router();

const csrfProtection = (req, res, next) => {
    const csrfToken = req.cookies.csrfToken;
    const csrfTokenHeader = req.headers['x-csrf-token'];
    const origin = req.headers.origin || req.headers.referer;

    if (!csrfToken || !csrfTokenHeader) {
        logger.error('CSRF token missing');
        return res.status(403).json({ error: 'CSRF token missing' });
    }

    if (csrfToken !== csrfTokenHeader) {
        logger.error('Invalid CSRF token');
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    // if (origin !== `${process.env.ALLOWED_ORIGIN}`) {
    //     logger.error('Invalid origin');
    //     return res.status(403).json({ error: 'Invalid origin' });
    // }

    next();
};

router.post('/api/data', csrfProtection, async (req, res, next) => {
    try {
        const { name, email, object, context } = req.body;

        if (!email || !object || !context) {
            logger.error('Missing required fields');
            return res.status(400).send('Missing required fields');
        }

        const emailDTO = new EmailDTO(name, email, object, context);
        await emailDTO.validate();

        await queueEmail(emailDTO);
        logger.info('Email queued');

        res.send({ message: 'Email queued'});
        
        // const mailer = new Mailer(emailDTO);
        // const emailSent = await mailer.sendEmail();

        // if (emailSent.success) {
        //     logger.info(emailSent.message);
        //     res.send(emailSent.message);
        // } else {
        //     logger.error(emailSent.message);
        //     res.status(500).send(emailSent.message);
        // }

    } catch (error) {
        logger.error(error.message);
        res.status(400).send(error.message);
    }
});

export default router;