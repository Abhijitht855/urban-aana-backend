import cron from 'node-cron';
import Order from '../models/Order';
import { getDTDCStatus } from '../controllers/shipping.controller';

export const startOrderScheduler = () => {
    cron.schedule('0 */6 * * *', async () => {
        const now = new Date().toISOString();
        console.log(`🚚 [${now}] Scheduler: Checking delivery status for shipped orders...`);

        try {
            // ലോഡ് കുറയ്ക്കാനും കൃത്യതയ്ക്കും വേണ്ടി: 
            // ഷിപ്പ് ചെയ്ത് കുറഞ്ഞത് 24 മണിക്കൂർ കഴിഞ്ഞ ഓർഡറുകൾ മാത്രം നോക്കുന്നു.
            const checkThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // 'Shipped' ആയതും 24 മണിക്കൂർ കഴിഞ്ഞതുമായ ഓർഡറുകൾ മാത്രം എടുക്കുന്നു.
            // ആവശ്യമുള്ള ഫീൽഡുകൾ മാത്രം സെലക്ട് ചെയ്യുന്നു (.select).
            const shippedOrders = await Order.find({
                orderStatus: 'Shipped',
                updatedAt: { $lte: checkThreshold }
            }).select('trackingId orderStatus');

            if (shippedOrders.length === 0) {
                console.log("ℹ️ [Scheduler]: No eligible orders found for checking.");
                return;
            }

            for (const order of shippedOrders) {
                if (!order.trackingId) continue;

                // 1. DTDC (Shipsy) എപിഐ വഴി നിലവിലെ സ്റ്റാറ്റസ് ചോദിക്കുന്നു
                const currentStatus = await getDTDCStatus(order.trackingId);

                // 2. കൊറിയർ കമ്പനി 'Delivered' എന്ന് പറഞ്ഞാൽ നമ്മുടെ ഡാറ്റാബേസിലും അപ്ഡേറ്റ് ചെയ്യുന്നു.
                // വാല്യൂ കേസ് ഇൻസെൻസിറ്റീവ് (Case-insensitive) ആയി ചെക്ക് ചെയ്യുന്നു.
                if (currentStatus?.toUpperCase() === 'DELIVERED') {
                    order.orderStatus = 'Delivered';
                    order.isDelivered = true;
                    order.deliveredAt = new Date();
                    
                    await order.save();
                    console.log(`✅ [Scheduler]: Order ${order._id} successfully marked as Delivered.`);
                }
            }
        } catch (error) {
            console.error("❌ [Scheduler Error]: Failed to process order status updates.", error);
        }
    });
};