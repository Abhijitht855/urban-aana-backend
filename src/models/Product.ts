import mongoose, { Document, Schema, Types } from 'mongoose';

// Size Entry Interface
interface ISizeEntry extends Types.Subdocument {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  stock: number;
  price: number;
}

// Variant Interface
interface IVariant extends Types.Subdocument {
  color: string;
  images: string[];
  sizes: Types.DocumentArray<ISizeEntry>;
  isDeleted: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  shortDescription: string;
  mainDescription: string;
  productStory?: string;
  productDetails?: string[];
  category: mongoose.Types.ObjectId;
  mainImage: string;
  variants: Types.DocumentArray<IVariant>; // Changed to DocumentArray
  weight: number;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sizeEntrySchema = new Schema<ISizeEntry>(
  {
    size: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], required: true },
    stock: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const variantSchema = new Schema<IVariant>(
  {
    color: { type: String, required: true, trim: true },
    images: { type: [String], required: true },
    sizes: [sizeEntrySchema],
    isDeleted: { type: Boolean, default: false },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, required: true, maxlength: 200 },
    mainDescription: { type: String, required: true },
    productStory: { type: String, trim: true },
    productDetails: { type: [String], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    mainImage: { type: String, required: true },
    weight: { type: Number, default: 0.5 },
    variants: {
      type: [variantSchema],
      validate: {
        validator: function (v: any) {
          const colors = v.map((item: any) => item.color.toLowerCase().trim());
          return colors.length === new Set(colors).size;
        },
        message: 'Duplicate color variants are not allowed'
      }
    },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.pre('validate', function (this: IProduct) {
  if (this.isModified('name') || (this.name && !this.slug)) {
    this.slug = this.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  }
});

export default mongoose.model<IProduct>('Product', productSchema);