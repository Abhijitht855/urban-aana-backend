import cron from 'node-cron';
import Order from '../models/Order';
import User from '../models/User'; 
import { getDTDCStatus } from '../controllers/shipping.controller';
import { sendOrderEmail } from './mail';

const DELIVERED_STATUSES = [
    'delivered', 
    'dlvd', 
    'delivery done', 
    'shipment delivered', 
    'successfully delivered', 
    'recipient received'
];

const CANCELLED_STATUSES = [
    'cancelled', 
    'pickup cancelled', 
    'return as per client instruction', 
    'pcan', 
    'stopdlv'
];

export const startOrderScheduler = () => {
    cron.schedule('0 */6 * * *', async () => {
        const timestamp = new Date().toLocaleString('en-IN');
        console.log(`🚚 [${timestamp}] Scheduler: Starting delivery & cancellation check...`);

        try {
            const checkThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const shippedOrders = await Order.find({
                orderStatus: 'Shipped',
                isPaid: true,
                trackingId: { $exists: true, $ne: '' },
                shippedAt: { $lte: checkThreshold } 
            });

            if (shippedOrders.length === 0) return;

            for (const order of shippedOrders) {
                if (!order.trackingId) continue;

                const rawStatus = await getDTDCStatus(order.trackingId);
                if (!rawStatus) continue;

                const status = rawStatus.toLowerCase().trim();

                if (DELIVERED_STATUSES.includes(status)) {
                    order.orderStatus = 'Delivered';
                    order.isDelivered = true;
                    order.deliveredAt = new Date();
                    await order.save();

                    const user = await User.findById(order.user);
                    if (user && user.email) {
                        await sendOrderEmail(user.email, order, 'DELIVERED');
                    }
                    console.log(`✅ Order ${order._id} updated and Delivery Email sent.`);
                } 
                
                else if (CANCELLED_STATUSES.includes(status)) {
                    order.orderStatus = 'Cancelled';
                    await order.save();
                    console.log(`🚫 Order ${order._id} marked as Cancelled.`);
                }
            }
        } catch (error: any) {
            console.error("❌ [Scheduler Error]:", error.message);
        }
    });

    console.log("🛠️  Order Tracking Scheduler initialized and ready.");
};