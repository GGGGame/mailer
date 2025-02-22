import amqp from 'amqplib';
import { logger } from '../utils/logger.js';

export const queueEmail = async (emailData) => {
    let connection;
    try {
        connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
    
        const queue = 'email_queue';
        await channel.assertQueue(queue, { durable: true });
    
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(emailData)), { persistent: true });
        logger.info(`Email queued: ${emailData.email}`);
    } catch (error) {
        logger.error(`Error email_queue: ${error.message}`);
    } finally {
        if (connection) {
            setTimeout(() => connection.close(), 1000); 
        }
    }
}
