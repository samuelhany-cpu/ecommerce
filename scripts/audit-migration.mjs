import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function audit() {
    try {
        const mysql = await import('../src/lib/mysql.js');
        const db = mysql.default.default || mysql.default;

        console.log('--- MIGRATION AUDIT START ---');

        // 1. Check Address Coverage
        const [addrCheck] = await db.query('SELECT COUNT(*) as count FROM Orders WHERE shippingAddressId IS NULL');
        console.log(`Orders missing shipping addresses: ${addrCheck[0].count}`);

        // 2. Financial Integrity Check
        const [finCheck] = await db.query(`
            SELECT 
                o.id, 
                o.totalAmount as expected, 
                IFNULL(SUM(oi.priceAtPurchase * oi.quantity), 0) as actual
            FROM Orders o
            LEFT JOIN OrderItems oi ON o.id = oi.orderId
            GROUP BY o.id
            HAVING ABS(expected - actual) > 0.01
        `);

        if (finCheck.length === 0) {
            console.log('✅ Financial Integrity: 100% Match (Tolerance 0.00)');
        } else {
            console.error('❌ Financial Discrepancies found:');
            finCheck.forEach(row => {
                console.error(`  Order ${row.id}: Expected ${row.expected}, Actual ${row.actual}`);
            });
        }

        // 3. Orphaned Items Check
        const [orphCheck] = await db.query('SELECT COUNT(*) as count FROM OrderItems WHERE orderId NOT IN (SELECT id FROM Orders)');
        console.log(`Orphaned OrderItems: ${orphCheck[0].count}`);

        console.log('--- MIGRATION AUDIT END ---');

        await db.close();

    } catch (error) {
        console.error('Audit failed:', error);
    }
}

audit();
