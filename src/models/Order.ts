// import mongoose, { Schema, Document } from 'mongoose';

// export interface IOrder extends Document {
//     user: mongoose.Types.ObjectId;
//     orderItems: {
//         product: mongoose.Types.ObjectId;
//         variantId: mongoose.Types.ObjectId;
//         name: string;
//         size: string;
//         color: string;
//         quantity: number;
//         image: string;
//         price: number;
//     }[];
//     shippingAddress: {
//         firstName: string;
//         lastName: string;
//         address: string;
//         city: string;
//         state: string;
//         postalCode: string;
//         phone: string;
//     };
//     paymentMethod: string;
//     taxPrice: number;
//     shippingPrice: number;
//     totalPrice: number;
//     isPaid: boolean;
//     paidAt?: Date;
//     isDelivered: boolean;
//     deliveredAt?: Date;
//     razorpayOrderId?: string;
//     razorpayPaymentId?: string;
//     razorpaySignature?: string;

//     // 🚚 Logistics Fields
//     courierPartner?: string;
//     trackingId?: string;
//     orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
//     fromCart: boolean;
// }

// const orderSchema = new Schema<IOrder>(
//     {
//         user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//         orderItems: [
//             {
//                 product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
//                 variantId: { type: Schema.Types.ObjectId, required: true },
//                 name: { type: String, required: true },
//                 size: { type: String, required: true },
//                 color: { type: String, required: true },
//                 quantity: { type: Number, required: true },
//                 image: { type: String, required: true },
//                 price: { type: Number, required: true },
//             },
//         ],
//         shippingAddress: {
//             firstName: { type: String, required: true },
//             lastName: { type: String, required: true },
//             address: { type: String, required: true },
//             city: { type: String, required: true },
//             state: { type: String, required: true },
//             postalCode: { type: String, required: true },
//             phone: { type: String, required: true },
//         },
//         paymentMethod: { type: String, required: true, default: 'Razorpay' },
//         taxPrice: { type: Number, required: true, default: 0.0 },
//         shippingPrice: { type: Number, required: true, default: 0.0 },
//         totalPrice: { type: Number, required: true, default: 0.0 },
//         isPaid: { type: Boolean, required: true, default: false },
//         paidAt: { type: Date },
//         isDelivered: { type: Boolean, required: true, default: false },
//         deliveredAt: { type: Date },
//         razorpayOrderId: { type: String },
//         razorpayPaymentId: { type: String },
//         razorpaySignature: { type: String }, // വെരിഫിക്കേഷനായി സൂക്ഷിക്കാം

//         fromCart: { type: Boolean, required: true, default: false },
//         courierPartner: { type: String, default: '' },
//         trackingId: { type: String, default: '' },
//         orderStatus: {
//             type: String,
//             required: true,
//             default: 'Processing',
//             enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled']
//         }
//     },
//     { timestamps: true }
// );

// export default mongoose.model<IOrder>('Order', orderSchema);

// import mongoose, { Schema, Document } from 'mongoose';

// export interface IOrder extends Document {
//     user: mongoose.Types.ObjectId;
//     orderItems: {
//         product: mongoose.Types.ObjectId;
//         variantId: mongoose.Types.ObjectId;
//         sizeId: mongoose.Types.ObjectId;
//         name: string;
//         size: string;
//         color: string;
//         quantity: number;
//         image: string;
//         price: number;
//     }[];
//     shippingAddress: {
//         firstName: string;
//         lastName: string;
//         address: string;
//         city: string;
//         state: string;
//         postalCode: string;
//         phone: string;
//     };
//     paymentMethod: string;
//     taxPrice: number;
//     shippingPrice: number;
//     totalPrice: number;
//     isPaid: boolean;
//     paidAt?: Date;
//     isDelivered: boolean;
//     deliveredAt?: Date;
//     razorpayOrderId?: string;
//     razorpayPaymentId?: string;
//     razorpaySignature?: string;
//     courierPartner?: string;
//     trackingId?: string;
//     orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
//     fromCart: boolean;
// }

// const orderSchema = new Schema<IOrder>(
//     {
//         user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//         orderItems: [
//             {
//                 product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
//                 variantId: { type: Schema.Types.ObjectId, required: true },
//                 sizeId: { type: Schema.Types.ObjectId, required: true },
//                 name: { type: String, required: true },
//                 size: { type: String, required: true },
//                 color: { type: String, required: true },
//                 quantity: { type: Number, required: true },
//                 image: { type: String, required: true },
//                 price: { type: Number, required: true },
//             },
//         ],
//         shippingAddress: {
//             firstName: { type: String, required: true },
//             lastName: { type: String, required: true },
//             address: { type: String, required: true },
//             city: { type: String, required: true },
//             state: { type: String, required: true },
//             postalCode: { type: String, required: true },
//             phone: { type: String, required: true },
//         },
//         paymentMethod: { type: String, required: true, default: 'Razorpay' },
//         taxPrice: { type: Number, required: true, default: 0.0 },
//         shippingPrice: { type: Number, required: true, default: 0.0 },
//         totalPrice: { type: Number, required: true, default: 0.0 },
//         isPaid: { type: Boolean, required: true, default: false },
//         paidAt: { type: Date },
//         isDelivered: { type: Boolean, required: true, default: false },
//         deliveredAt: { type: Date },
//         razorpayOrderId: {
//             type: String,
//             unique: true,
//             sparse: true
//         },
//         razorpayPaymentId: { type: String },
//         razorpaySignature: { type: String },
//         fromCart: { type: Boolean, required: true, default: false },
//         courierPartner: { type: String, default: '' },
//         trackingId: { type: String, default: '' },
//         orderStatus: {
//             type: String,
//             required: true,
//             default: 'Processing',
//             enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled']
//         }
//     },
//     { timestamps: true }
// );

// export default mongoose.model<IOrder>('Order', orderSchema);


import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    orderItems: {
        product: mongoose.Types.ObjectId;
        variantId: mongoose.Types.ObjectId;
        sizeId: mongoose.Types.ObjectId;
        name: string;
        size: string;
        color: string;
        quantity: number;
        image: string;
        price: number;
    }[];
    shippingAddress: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        phone: string;
    };
    paymentMethod: string;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    courierPartner?: string;
    trackingId?: string;
    orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    fromCart: boolean;
}

const orderSchema = new Schema<IOrder>(
    {
        user: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        orderItems: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                variantId: { type: Schema.Types.ObjectId, required: true },
                sizeId: { type: Schema.Types.ObjectId, required: true },
                name: { type: String, required: true },
                size: { type: String, required: true },
                color: { type: String, required: true },
                quantity: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
            },
        ],
        shippingAddress: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true, default: 'Kerala' },
            postalCode: { type: String, required: true },
            phone: { type: String, required: true },
        },
        paymentMethod: { 
            type: String, 
            required: true, 
            default: 'Razorpay' 
        },
        taxPrice: { type: Number, required: true, default: 0.0 },
        shippingPrice: { type: Number, required: true, default: 0.0 },
        totalPrice: { type: Number, required: true, default: 0.0 },
        isPaid: { type: Boolean, required: true, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, required: true, default: false },
        deliveredAt: { type: Date },
        
        razorpayOrderId: { 
            type: String, 
            unique: true, // ഇതിലൂടെ Mongoose ഒരു ഇൻഡക്സ് ഓട്ടോമാറ്റിക് ആയി ഉണ്ടാക്കും
            sparse: true 
        },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        
        fromCart: { type: Boolean, required: true, default: false },
        courierPartner: { type: String, default: '' },
        trackingId: { type: String, default: '' },
        orderStatus: {
            type: String,
            required: true,
            default: 'Processing',
            enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled']
        }
    },
    { timestamps: true }
);

// യൂസർ ഐഡി വെച്ച് സെർച്ച് ചെയ്യുന്നത് വേഗത്തിലാക്കാൻ ഇത് നിലനിർത്താം
orderSchema.index({ user: 1, createdAt: -1 });

// 🔥 ഡ്യൂപ്ലിക്കേഷൻ ഒഴിവാക്കാൻ razorpayOrderId ഇൻഡക്സ് ഇവിടുന്ന് നീക്കം ചെയ്തു

export default mongoose.model<IOrder>('Order', orderSchema);