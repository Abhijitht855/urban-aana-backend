import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


export const sendOrderEmail = async (
    userEmail: string,
    order: any,
    type: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED'
) => {
    const orderId = order._id.toString().slice(-8).toUpperCase();
    const logoUrl = "https://res.cloudinary.com/deatp5t8n/image/upload/q_auto:best,f_png,b_white,w_500/v1781436147/urban-aana/products/1781436142407-Logo.png";

    let subject = "";
    let title = "";
    let message = "";
    let accentColor = "#dc2626"; // Urban Aana Red

    if (type === 'CONFIRMED') {
        subject = `Order Confirmed! #${orderId}`;
        title = "Order Confirmed";
        message = "Your payment was successful, and we've started preparing your order for shipment.";
    } else if (type === 'SHIPPED') {
        subject = `Your Order has been Shipped! #${orderId}`;
        title = "Package Dispatched";
        message = `Exciting news! Your Urban Aana package has been handed over to DTDC. Tracking ID: <b>${order.trackingId}</b>`;
        accentColor = "#000000"; // Black
    } else if (type === 'DELIVERED') {
        subject = `Order Delivered! #${orderId}`;
        title = "Successfully Delivered";
        message = "Your order has been delivered. We hope you love your new outfit from Urban Aana!";
        accentColor = "#16a34a"; // Green
    }

    const mailOptions = {
        from: `"Urban Aana" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: subject,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .content-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .content-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
          .item-img { width: 50px; height: 60px; border-radius: 4px; object-fit: cover; }
        </style>
      </head>
      <body style="background-color: #f6f6f6; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
          
          <!-- Header Logo -->
          <div style="padding: 30px; text-align: center; background-color: #ffffff;">
            <img src="${logoUrl}" alt="Urban Aana" width="150" style="width: 150px; height: auto; display: block; margin: 0 auto;">
          </div>

          <!-- Status Banner -->
          <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;">
            <h2 style="margin: 0; color: ${accentColor}; text-transform: uppercase; font-size: 20px; letter-spacing: 1px;">${title}</h2>
            <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Order ID: #${orderId}</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px;">
            <p style="font-size: 15px; color: #333;">Hi <b>${order.shippingAddress.firstName}</b>,</p>
            <p style="font-size: 14px; color: #555; line-height: 1.5;">${message}</p>

            <h4 style="margin: 30px 0 10px; font-size: 12px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h4>
            <table class="content-table">
              ${order.orderItems.map((item: any) => `
                <tr>
                  <td style="width: 60px;">
                    <img src="${item.image}" class="item-img" alt="">
                  </td>
                  <td>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #333;">${item.name}</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${item.color} / ${item.size} × ${item.quantity}</p>
                  </td>
                  <td style="text-align: right; font-weight: bold; font-size: 14px;">
                    ₹${item.price * item.quantity}
                  </td>
                </tr>
              `).join('')}
            </table>

            <!-- Totals -->
            <div style="border-top: 2px solid #333; padding-top: 15px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #666;">Subtotal</td>
                  <td style="text-align: right; color: #333;">₹${order.totalPrice - (order.shippingPrice || 0)}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 5px 0;">Shipping</td>
                  <td style="text-align: right; color: #333;">${order.shippingPrice === 0 ? 'FREE' : '₹' + order.shippingPrice}</td>
                </tr>
                <tr style="font-size: 18px; font-weight: bold;">
                  <td style="padding-top: 10px; color: #000;">Total</td>
                  <td style="padding-top: 10px; text-align: right; color: #dc2626;">₹${order.totalPrice}</td>
                </tr>
              </table>
            </div>

            <!-- Shipping Info -->
            <div style="margin-top: 40px; padding: 20px; background-color: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 8px;">
              <h4 style="margin: 0 0 10px; font-size: 12px; color: #aaa; text-transform: uppercase;">Shipping Address</h4>
              <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.4;">
                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}<br/>
                ${order.shippingAddress.address}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br/>
                Phone: ${order.shippingAddress.phone}
              </p>
            </div>

            <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="font-size: 13px; color: #888;">If you have any questions, reply to this email or contact us at <a href="mailto:urbanaana2026@gmail.com" style="color: #dc2626; text-decoration: none;">urbanaana2026@gmail.com</a></p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px; background-color: #000000; text-align: center;">
            <p style="margin: 0; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">© 2024 Urban Aana. Premium Apparel.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Notification email [${type}] sent to: ${userEmail}`);

        if (type === 'CONFIRMED') {
            const adminUrl = `${process.env.ADMIN_PANEL_URL}/orders/${order._id}`;

            await transporter.sendMail({
                from: `"Urban Aana System" <${process.env.EMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `🚨 New Paid Order Received: #${orderId}`,
                html: `
            <!DOCTYPE html>
            <html>
            <body style="background-color: #f4f4f4; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <div style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header Logo -->
                    <div style="padding: 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                        <img src="${logoUrl}" alt="Urban Aana" width="100" style="width: 100px; height: auto;">
                    </div>

                    <!-- Alert Banner -->
                    <div style="background-color: #000000; padding: 15px; text-align: center;">
                        <h2 style="margin: 0; color: #ffffff; font-size: 16px; text-transform: uppercase; letter-spacing: 2px;">New Order Alert</h2>
                    </div>

                    <!-- Order Quick Summary -->
                    <div style="padding: 30px;">
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">A new payment has been successfully verified via Razorpay. Below are the shipment details:</p>
                        
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
                            <tr>
                                <td style="padding: 10px 0; color: #888;">Order ID:</td>
                                <td style="padding: 10px 0; font-weight: bold; text-align: right;">#${orderId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #888;">Customer:</td>
                                <td style="padding: 10px 0; font-weight: bold; text-align: right;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #888;">Revenue:</td>
                                <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #dc2626; font-size: 18px;">₹${order.totalPrice}</td>
                            </tr>
                        </table>

                        <!-- Action Button -->
                        <div style="text-align: center; margin-top: 35px;">
                            <a href="${adminUrl}" style="background-color: #dc2626; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.3);">
                                View Order Details
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding: 15px; background-color: #fafafa; text-align: center; border-top: 1px solid #f0f0f0;">
                        <p style="margin: 0; color: #aaa; font-size: 11px;">This is an automated system notification.</p>
                    </div>
                </div>
            </body>
            </html>
        `
            });
        }
    } catch (error) {
        console.error("❌ Email failed:", error);
    }
};