// import mongoose, { Document, Schema } from 'mongoose';
// import bcrypt from 'bcryptjs';

// export interface IUserDocument extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: 'user' | 'admin';
//   createdAt: Date;
//   updatedAt: Date;
//   comparePassword(password: string): Promise<boolean>;
// }

// const userSchema = new Schema<IUserDocument>(
//   {
//     name: {
//       type: String,
//       required: [true, 'Name is required'],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, 'Email is required'],
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: [true, 'Password is required'],
//       minlength: 6,
//       select: false,
//     },
//     role: {
//       type: String,
//       enum: ['user', 'admin'],
//       default: 'user',
//     },
//   },
//   { timestamps: true }
// );

// userSchema.pre('save', async function () {
//   if (!this.isModified('password')) return;
//   this.password = await bcrypt.hash(this.password, 12);
// });

// userSchema.methods.comparePassword = async function (
//   candidatePassword: string
// ): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// export default mongoose.model<IUserDocument>('User', userSchema);

import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. അഡ്രസ്സ് സ്ട്രക്ചറിനുള്ള ഇന്റർഫേസ്
interface IAddress {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

// 2. യൂസർ ഡോക്യുമെന്റിനുള്ള ഇന്റർഫേസ്
export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  addresses: Types.DocumentArray<IAddress & Types.Subdocument>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// 3. അഡ്രസ്സ് സ്കീമ
const addressSchema = new Schema<IAddress>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, default: 'Kerala' },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

// 4. മെയിൻ യൂസർ സ്കീമ
const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// 5. പാസ്‌വേഡ് ഹാഷിംഗ് (Updated: Removed next() to fix TS error)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw new Error(error);
  }
});

// 6. പാസ്‌വേഡ് താരതമ്യം ചെയ്യാനുള്ള മെത്തേഡ്
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!candidatePassword || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserDocument>('User', userSchema);