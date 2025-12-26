import dbConnect from '../src/lib/mongodb.js';
import AuditLog from '../src/models/AuditLog.js';
import mongoose from 'mongoose';

async function testLogging() {
    console.log('--- Starting Logging Verification ---');

    try {
        await dbConnect();
        console.log('Connected to MongoDB.');

        // 1. Manually create a log entry
        const testLog = new AuditLog({
            action: 'Test Log Action',
            endpoint: '/test-verification',
            method: 'GET',
            ip: '127.0.0.1',
            location: {
                city: 'TestCity',
                country: 'TestCountry'
            },
            userAgent: 'VerificationScript/1.0',
            data: { info: 'This is a test log' }
        });

        await testLog.save();
        console.log('Successfully saved test log entry.');

        // 2. Retrieve the log entry
        const savedLog = await AuditLog.findOne({ action: 'Test Log Action' }).sort({ timestamp: -1 });
        if (savedLog) {
            console.log('Successfully retrieved test log:');
            console.log(`- Action: ${savedLog.action}`);
            console.log(`- IP: ${savedLog.ip}`);
            console.log(`- Location: ${savedLog.location.city}, ${savedLog.location.country}`);
        } else {
            throw new Error('Could not find the saved log entry.');
        }

        // 3. Clean up (optional)
        // await AuditLog.deleteOne({ _id: savedLog._id });
        // console.log('Cleaned up test log entry.');

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        console.log('--- Verification Finished ---');
    }
}

testLogging();
