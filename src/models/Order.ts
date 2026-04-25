import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string;      
    price: number;
    quantity: number;
    variant: {
        size: string;
        color: string;
    };
    image: string;
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    orderItems: IOrderItem[];
    shippingAddress: {
        address: string;
        landmark?: string;   // Optional landmark
        city: string;
        state: string;       // Added state
        postalCode: string;
        phone: string;
        altPhone?: string;   // Optional alternative phone
    };
    paymentMethod: 'Razorpay' | 'COD';
    paymentResult?: {
        id: string;
        status: string;
    };
    totalPrice: number;
    isPaid: boolean;
    paidAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return_Requested' | 'Returned';
}

const orderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            variant: {
                size: { type: String, required: true },
                color: { type: String, required: true }
            },
            image: { type: String, required: true },
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        phone: { type: String, required: true },
        altPhone: { type: String },
    },
    paymentMethod: { 
        type: String, 
        enum: ['Razorpay', 'COD'], 
        required: true, 
        default: 'COD' 
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
    },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return_Requested', 'Returned'],
        default: 'Pending'
    },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', orderSchema);