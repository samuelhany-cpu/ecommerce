import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Models
// Note: We'll define schemas directly in the script to avoid dependency issues during migration
const Schemas = {
    User: new mongoose.Schema({}, { strict: false, collection: 'users' }),
    Product: new mongoose.Schema({}, { strict: false, collection: 'products' }),
    Order: new mongoose.Schema({}, { strict: false, collection: 'orders' }),
    OrderItem: new mongoose.Schema({}, { strict: false, collection: 'orderitems' }),
    Cart: new mongoose.Schema({}, { strict: false, collection: 'carts' }),
    Address: new mongoose.Schema({}, { strict: false, collection: 'addresses' }),
    OTP: new mongoose.Schema({}, { strict: false, collection: 'otps' }),
    AuditLog: new mongoose.Schema({}, { strict: false, collection: 'auditlogs' })
};

async function migrate() {
    const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';
    const atlasUri = process.env.MONGODB_URI;

    if (!atlasUri) {
        console.error('❌ MONGODB_URI (Atlas) is missing in .env.local');
        process.exit(1);
    }

    console.log('--- Database Migration Started ---');
    console.log(`Source (Local): ${localUri}`);
    console.log(`Destination (Atlas): ${atlasUri.replace(/:([^:@]+)@/, ':****@')}`); // Hide password

    try {
        // 1. Connect to Local
        console.log('\nConnecting to Local DB...');
        const localConn = await mongoose.createConnection(localUri).asPromise();
        console.log('✅ Connected to Local DB.');

        // 2. Connect to Atlas
        console.log('\nConnecting to Atlas DB...');
        const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
        console.log('✅ Connected to Atlas DB.');

        const collections = Object.keys(Schemas);

        for (const modelName of collections) {
            console.log(`\nMigrating collection: ${modelName}...`);

            const LocalModel = localConn.model(modelName, Schemas[modelName]);
            const AtlasModel = atlasConn.model(modelName, Schemas[modelName]);

            // Fetch all data from local
            const data = await LocalModel.find({}).lean();
            console.log(`- Found ${data.length} documents in local ${modelName}.`);

            if (data.length > 0) {
                // Clear Atlas collection first to avoid duplicates
                await AtlasModel.deleteMany({});
                console.log(`- Cleared Atlas ${modelName} collection.`);

                // Insert into Atlas
                await AtlasModel.insertMany(data);
                console.log(`✅ Successfully migrated ${data.length} documents to Atlas ${modelName}.`);
            } else {
                console.log(`- Skipping ${modelName} (no data).`);
            }
        }

        console.log('\n--- Migration Completed Successfully! ---');

        await localConn.close();
        await atlasConn.close();

    } catch (error) {
        console.error('\n❌ Migration Failed:', error);
    } finally {
        process.exit(0);
    }
}

migrate();
