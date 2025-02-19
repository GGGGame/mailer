import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from './logger.js';
dotenv.config();

export class Mailer {

    static transportOptions() {
        return {
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.APP_USER,
                pass: process.env.APP_PASSWORD
            }
        }
    }
    
    constructor(emailDTO) {
        this.name = emailDTO.name;
        this.email = emailDTO.email;
        this.object = emailDTO.object;
        this.context = emailDTO.context;
        this.mailer = nodemailer.createTransport(Mailer.transportOptions());
    }

    options() {
        return {
            from: {
                name: this.name,
                address: process.env.APP_USER
            },
            to: this.email,
            subject: this.object,
            text: this.context
        }
    }

    async sendEmail() {
        try {
            logger.info(`Sending email to: ${this.email}`);
            const info = await this.mailer.sendMail(this.options());
            return { 
                success: true, 
                message: `Email sent! ${info.response}`
            };
        } catch (error) {
            return {
                success: false,
                message: `Error sending email ${error}`
            };
        }
    }
    
}