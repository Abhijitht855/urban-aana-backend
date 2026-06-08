import cron from 'node-cron';
import Order from '../models/Order';
import { getDTDCStatus } from '../controllers/shipping.controller';


const DELIVERED_STATUSES = [
    'delivered', 
    'dlvd', 
    'delivery done', 
    'shipment delivered', 
    'successfully delivered', 
    'recipient received'
];

export const startOrderScheduler = () => {
    cron.schedule('0 */6 * * *', async () => {
        const timestamp = new Date().toLocaleString('en-IN');
        console.log(`🚚 [${timestamp}] Scheduler: Starting delivery status check...`);

        try {
            const checkThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const shippedOrders = await Order.find({
                orderStatus: 'Shipped',
                isPaid: true,
                trackingId: { $exists: true, $ne: '' },
                shippedAt: { $lte: checkThreshold } 
            }).select('trackingId orderStatus _id');

            if (shippedOrders.length === 0) {
                console.log("ℹ️ [Scheduler]: No eligible orders for checking.");
                return;
            }

            console.log(`📦 [Scheduler]: Checking ${shippedOrders.length} shipped orders.`);

            for (const order of shippedOrders) {
                if (!order.trackingId) continue;

                
                const rawStatus = await getDTDCStatus(order.trackingId);
                
                if (!rawStatus) {
                    console.log(`⚠️ [Scheduler]: Could not fetch status for Order ${order._id}`);
                    continue;
                }

                console.log(`🔍 Order ${order._id} -> Current DTDC Status: "${rawStatus}"`);

                if (DELIVERED_STATUSES.includes(rawStatus.toLowerCase().trim())) {
                    await Order.updateOne(
                        { _id: order._id },
                        {
                            $set: {
                                orderStatus: 'Delivered',
                                isDelivered: true,
                                deliveredAt: new Date()
                            }
                        }
                    );
                    console.log(`✅ [Scheduler]: Order ${order._id} marked as DELIVERED in database.`);
                }
            }
        } catch (error: any) {
            console.error("❌ [Scheduler Error]:", error.message);
        }
    });

    console.log("🛠️  Order Tracking Scheduler initialized and ready.");
};