// import mongoose, { Document, Schema } from 'mongoose';

// interface IVariant {
//     size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
//     color: string;
//     stock: number;
//     images: string[]; // array[0] frontend-il color selection image aayi upayogikkam
// }

// export interface IProduct extends Document {
//     name: string;
//     slug: string;
//     shortDescription: string;
//     mainDescription: string;
//     price: number;
//     category: mongoose.Types.ObjectId;
//     mainImage: string; // Product list-il kanikkunna primary image
//     variants: IVariant[];
//     isFeatured: boolean;
//     createdAt: Date;
//     updatedAt: Date;
// }

// const productSchema = new Schema<IProduct>(
//     {
//         name: { type: String, required: true, trim: true },
//         slug: { type: String, required: true, unique: true, lowercase: true },
//         shortDescription: { type: String, required: true, maxlength: 200 },
//         mainDescription: { type: String, required: true },
//         price: { type: Number, required: true },
//         category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
//         mainImage: { type: String, required: true },
//         variants: [
//             {
//                 size: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL'], required: true },
//                 color: { type: String, required: true },
//                 stock: { type: Number, default: 0 },
//                 images: {
//                     type: [String],
//                     validate: [(val: string[]) => val.length > 0, 'At least one image per variant is required']
//                 },
//             },
//         ],
//         isFeatured: { type: Boolean, default: false },
//     },
//     { timestamps: true }
// );

// // 'next' parameter remove cheythu Promise-based approach upayogikkunnu
// productSchema.pre('validate', function (this: IProduct) {
//     if (this.isModified('name') || (this.name && !this.slug)) {
//         this.slug = this.name
//             .toLowerCase()
//             .trim()
//             .replace(/[^\w\s-]/g, '')
//             .replace(/[\s_-]+/g, '-')
//             .replace(/^-+|-+$/g, '');
//     }
// });

// export default mongoose.model<IProduct>('Product', productSchema);

import mongoose, { Document, Schema } from 'mongoose';

interface IVariant {
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    color: string;
    stock: number;
    price: number;
    images: string[];
}

export interface IProduct extends Document {
    name: string;
    slug: string;
    shortDescription: string;
    mainDescription: string;
    category: mongoose.Types.ObjectId;
    mainImage: string;
    variants: IVariant[];
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        shortDescription: { type: String, required: true, maxlength: 200 },
        mainDescription: { type: String, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        mainImage: { type: String, required: true },
        variants: {
            type: [
                {
                    size: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL'], required: true },
                    color: { type: String, required: true, trim: true },
                    stock: { type: Number, default: 0 },
                    price: { type: Number, required: true },
                    images: {
                        type: [String],
                        validate: [(val: string[]) => val.length > 0, 'At least one image per variant is required']
                    },
                },
            ],
            // 🔥 BUG FIX: Custom validator to prevent duplicate Size-Color combinations
            validate: {
                validator: function (variants: IVariant[]) {
                    const combinations = variants.map(
                        v => `${v.size}-${v.color.toLowerCase().trim()}`
                    );
                    // Set ഉപയോഗിച്ച് ഡ്യൂപ്ലിക്കേറ്റ് ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു
                    return combinations.length === new Set(combinations).size;
                },
                message: 'Duplicate variant found: Each size and color combination must be unique.'
            }
        },
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Slug auto-generation logic
productSchema.pre('validate', function (this: IProduct) {
    if (this.isModified('name') || (this.name && !this.slug)) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

export default mongoose.model<IProduct>('Product', productSchema);