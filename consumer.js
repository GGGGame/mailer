import amqp from 'amqplib';
import { Mailer } from "./Mailer.js";
import { logger } from './logger.js';

export const consumeEmailQueue = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queue = 'email_queue';
        await channel.assertQueue(queue, { durable: true });

        logger.info('Waiting for messages in email_queue');

        channel.consume(queue, async (message) => {
            if (!message) return;

            try {
                const emailData = JSON.parse(message.content.toString());
                logger.info(`Email consumed: ${emailData.email}`);

                const mailer = new Mailer(emailData);
                const emailSent = await mailer.sendEmail();

                if (emailSent.success) {
                    logger.info(emailSent.message);
                    channel.ack(message);
                } else {
                    logger.error(emailSent.message);
                    channel.nack(message, false, true);
                }
            } catch (error) {
                logger.error(`Error processing message: ${error.message}`);
                channel.nack(message, false, true);
            }
        });
    } catch (error) {
        logger.error(`Error consumer email_queue: ${error.message}`);
    }
}

consumeEmailQueue().catch(error => {
    logger.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
