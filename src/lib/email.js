import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const commonStyles = `
  body { font-family: 'Outfit', sans-serif; color: #2D2D2D; line-height: 1.6; background: #FAF9F6; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
  .header { background: #1A1A1A; color: #FAF9F6; padding: 40px 20px; text-align: center; }
  .logo { font-size: 28px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
  .content { padding: 40px; }
  .order-title { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #1A1A1A; }
  .item-list { width: 100%; border-collapse: collapse; margin: 20px 0; }
  .item-row { border-bottom: 1px solid #EEEEEE; }
  .item-name { padding: 12px 0; font-weight: 500; }
  .item-price { text-align: right; padding: 12px 0; font-family: monospace; }
  .total-row { font-size: 18px; font-weight: 700; border-top: 2px solid #1A1A1A; }
  .footer { background: #F3F1ED; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
  .button { display: inline-block; padding: 12px 24px; background: #C5A059; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
`;

export async function sendOrderEmail(customerEmail, orderData) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Skipping email sending: No credentials provided');
    return;
  }

  const items = orderData && (typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items) || [];

  const itemsHtml = (Array.isArray(items) ? items : []).map(item => `
    <tr class="item-row">
      <td class="item-name">${item.name} (x${item.quantity})</td>
      <td class="item-price">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">LuxeLeather</h1>
          </div>
          <div class="content">
            <h2 class="order-title">Thank you for your order!</h2>
            <p>Hi there,</p>
            <p>Your order <strong>#${orderData.id || 'N/A'}</strong> has been received and is being prepared with care by our craftsmen.</p>
            
            <table class="item-list">
              ${itemsHtml}
              <tr class="total-row">
                <td style="padding: 15px 0;">Total Amount</td>
                <td class="item-price" style="padding: 15px 0;">$${Number(orderData?.totalAmount || 0).toFixed(2)}</td>
              </tr>
            </table>

            <p>We'll notify you as soon as your organic leather piece is on its way.</p>
            <a href="#" class="button">View Order Status</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LuxeLeather. Handcrafted Sustainability.<br/>
            You are receiving this because you placed an order on luxeleather.com
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Send to Customer
  console.log('=== EMAIL DELIVERY DEBUG ===');
  console.log('Customer Email:', customerEmail);
  console.log('Admin Email (EMAIL_USER):', process.env.EMAIL_USER);
  console.log('Order ID:', orderData.id);

  try {
    await transporter.sendMail({
      from: `"LuxeLeather" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      replyTo: process.env.EMAIL_USER,
      subject: `Order Confirmation #${orderData.id} - LuxeLeather`,
      html: emailHtml,
    });
    console.log(`✅ SUCCESS: Customer confirmation sent to ${customerEmail}`);
  } catch (error) {
    console.error('❌ Customer Email Error:', error);
  }

  // 2. Send Alert to Admin
  try {
    await transporter.sendMail({
      from: `"LuxeLeather System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Admin email (using the authenticated one as default)
      replyTo: customerEmail, // Admin can reply directly to customer
      subject: `New Sale Alert: Order #${orderData.id}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #C5A059;">New Order Received!</h2>
          <p><strong>Customer:</strong> ${customerEmail}</p>
          <p><strong>Total:</strong> $${orderData.totalAmount.toFixed(2)}</p>
          <hr/>
          <p>Log in to the Admin Dashboard to fulfill this order.</p>
        </div>
      `,
    });
    console.log(`✅ SUCCESS: Admin alert sent to ${process.env.EMAIL_USER}`);
  } catch (error) {
    console.error('❌ Admin Alert Error:', error);
  }
}

export async function sendOTPEmail(email, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Skipping OTP email: No credentials provided');
    return;
  }

  const emailHtml = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">LuxeLeather</h1>
          </div>
          <div class="content" style="text-align: center;">
            <h2 class="order-title">Verify Your Account</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 48px; font-weight: 800; color: #C5A059; margin: 30px 0; letter-spacing: 15px;">
              ${otp}
            </div>
            <p style="font-size: 14px; opacity: 0.6;">This code will expire in 10 minutes.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LuxeLeather. Handcrafted Sustainability.
          </div>
        </div>
      </body>
    </html>
    `;

  try {
    await transporter.sendMail({
      from: `"LuxeLeather" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm Your Email - LuxeLeather',
      html: emailHtml,
    });
    console.log(`✅ Success: OTP sent to ${email}`);
  } catch (error) {
    console.error('❌ OTP Email Error:', error);
  }
}
