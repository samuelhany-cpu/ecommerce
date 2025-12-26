import dbConnect from './mongodb';
import AuditLog from '@/models/AuditLog';

/**
 * Logs an action to the AuditLog collection.
 * @param {Object} logData - The data to log.
 * @param {string} logData.userId - ID of the user (optional).
 * @param {string} logData.action - Description of the action.
 * @param {string} logData.endpoint - API endpoint or page URL.
 * @param {string} logData.method - HTTP method.
 * @param {string} logData.ip - User's IP address.
 * @param {Object} logData.location - User's location data.
 * @param {string} logData.userAgent - User's browser signature.
 * @param {Object} logData.data - Additional metadata about the action.
 */
export async function logAudit(logData) {
    try {
        await dbConnect();
        const logEntry = new AuditLog(logData);
        await logEntry.save();
    } catch (error) {
        // We don't want to crash the request if logging fails, but we should know about it.
        console.error('Audit Logging Failed:', error);
    }
}

/**
 * Attempts to get geolocation data based on IP.
 * Since we don't have geoip-lite installed, we'll look for common headers
 * provide by CDNs/Cloud providers, or use a placeholder for local testing.
 * @param {Request} request 
 * @returns {Object} location data
 */
export function getGeoLocation(request) {
    // Vercel/Cloudflare often provide these headers
    const city = request.headers.get('x-vercel-ip-city') || 'Unknown';
    const region = request.headers.get('x-vercel-ip-country-region') || 'Unknown';
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const latitude = request.headers.get('x-vercel-ip-latitude');
    const longitude = request.headers.get('x-vercel-ip-longitude');

    return {
        city,
        region,
        country,
        ll: latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : []
    };
}

/**
 * Extracts the IP address from a request.
 * @param {Request} request 
 * @returns {string} IP address
 */
export function getIP(request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return '127.0.0.1'; // Default for local dev or if not found
}
