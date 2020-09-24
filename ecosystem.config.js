module.exports = {
    apps: [
        {
            name: 'BOT',
            script: 'dist/main.js'
        }
    ],
    deploy: {
        production: {
            user: 'pi',
            host: ['10.0.0.2'],
            ref: 'origin/master',
            repo: 'git@github.com:WDaan/Discord-Bot.git',
            path: '/home/pi/Documents/Github/Discord-Bot',
            'pre-deploy-local': '',
            'post-deploy':
                'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
}
