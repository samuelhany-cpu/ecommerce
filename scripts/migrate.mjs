import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables IMMEDIATELY
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const action = process.argv[2] || 'up';

(async () => {
    try {
        // Dynamically import sequelize AFTER dotenv
        const mysql = await import('../src/lib/mysql.js');
        const db = mysql.default.default || mysql.default;

        const umzug = new Umzug({
            migrations: { glob: 'migrations/*.mjs' },
            context: db.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize: db }),
            logger: console,
        });

        if (action === 'up') {
            await umzug.up();
        } else if (action === 'down') {
            await umzug.down();
        } else if (action === 'status') {
            const pending = await umzug.pending();
            const executed = await umzug.executed();
            console.log('Pending:', pending.map(m => m.name));
            console.log('Executed:', executed.map(m => m.name));
        } else {
            console.error('Unknown action:', action);
        }
    } catch (error) {
        console.error('Migration action failed:', error);
        process.exit(1);
    }
})();
