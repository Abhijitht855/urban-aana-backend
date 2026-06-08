import cron from 'node-cron';
import Order from '../models/Order';
import { getDTDCStatus } from '../controllers/shipping.controller';

// DTDC status strings — Deepak confirm ചെയ്യുമ്പോൾ add ചെയ്യാം
const DELIVERED_STATUSES = ['delivered', 'dlvd', 'delivery done', 'shipment delivered'];

export const startOrderScheduler = () => {
    cron.schedule('0 */6 * * *', async () => {
        console.log(`🚚 [${new Date().toLocaleString()}] Scheduler running...`);

        try {
            // ✅ Fix: shippedAt use ചെയ്യുന്നു, updatedAt അല്ല
            const checkThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const shippedOrders = await Order.find({
                orderStatus: 'Shipped',
                trackingId: { $exists: true, $ne: '' },
                shippedAt: { $lte: checkThreshold }  // 24hr+ മുൻപ് shipped ആയവ
            }).select('trackingId orderStatus _id');

            console.log(`📦 Found ${shippedOrders.length} orders to check`);
            if (shippedOrders.length === 0) return;

            for (const order of shippedOrders) {
                const rawStatus = await getDTDCStatus(order.trackingId!);
                
                if (!rawStatus) continue;

                console.log(`Order ${order._id} — DTDC Status: "${rawStatus}"`);

                // ✅ Fix: multiple possible DTDC status strings handle ചെയ്യുന്നു
                if (DELIVERED_STATUSES.includes(rawStatus.toLowerCase())) {
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
                    console.log(`✅ Order ${order._id} marked as Delivered`);
                }
            }
        } catch (error: any) {
            console.error('❌ Scheduler Error:', error.message);
        }
    });
};