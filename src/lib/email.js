import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendOrderEmail(order, userEmail) {
    try {
        if (!process.env.EMAIL_USER) {
            console.log('Skipping email sending: No credentials provided');
            return;
        }

        // Email to User
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Order Confirmation #${order.id}`,
            html: `
        <h1>Thank you for your order!</h1>
        <p>Order ID: ${order.id}</p>
        <p>Total: $${order.totalAmount}</p>
        <p>We will notify you when it ships.</p>
      `,
        });

        // Email to Admin
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Sending to self/admin
            subject: `New Order Received #${order.id}`,
            html: `
        <h1>New Order</h1>
        <p>User: ${userEmail}</p>
        <p>Total: $${order.totalAmount}</p>
        <p>Items: ${JSON.stringify(order.items)}</p>
      `,
        });
    } catch (error) {
        console.error('Email Error:', error);
    }
}
