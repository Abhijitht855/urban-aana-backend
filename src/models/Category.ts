import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { 
      type: String, 
      required: [true, 'Category name is required'], 
      unique: true, 
      trim: true 
    },
    slug: { 
      type: String, 
      unique: true, 
      lowercase: true 
    },
  },
  { timestamps: true }
);

// Category-kum slug automatic aayi generate cheyyaam
categorySchema.pre('validate', function (this: ICategory) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

export default mongoose.model<ICategory>('Category', categorySchema);