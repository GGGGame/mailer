export const apps = [
    {
        name: 'server',
        script: './server.js',
        watch: false,
        exec_mode: 'fork',
        args: '--no-daemon',
        restart_delay: 5000,  // Ritardo di 5 secondi prima del riavvio
    },
    {
        name: 'consumer',
        script: './src/workers/consumer.js',
        watch: false,
        exec_mode: 'fork',
        args: '--no-daemon',
        restart_delay: 5000,  // Ritardo di 5 secondi prima del riavvio
    }
];