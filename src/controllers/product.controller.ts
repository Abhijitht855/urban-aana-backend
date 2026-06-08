import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

const checkExtraFields = (allowedFields: string[], body: any): string | null => {
  const extraFields = Object.keys(body).filter(key => !allowedFields.includes(key));
  if (extraFields.length > 0) {
    return `Extra fields not allowed: ${extraFields.join(', ')}`;
  }
  return null;
};

// ─── CREATE PRODUCT ──────────────────────────────────────────────────────────
export const createProduct = async (req: Request, res: Response) => {
  try {
    const allowed = ['name', 'shortDescription', 'mainDescription', 'category', 'mainImage', 'weight', 'isFeatured', 'variants'];
    const extraError = checkExtraFields(allowed, req.body);
    if (extraError) return res.status(400).json({ message: extraError });

    const { name, category, variants, weight, isFeatured, ...rest } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ message: 'Invalid Category ID.' });

    if (weight !== undefined && Number(weight) <= 0) {
      return res.status(400).json({ message: 'Weight must be a positive number' });
    }

    if (variants && Array.isArray(variants)) {
      const colors = variants.map((v: any) => v.color.toLowerCase().trim());
      if (colors.some((c, index) => colors.indexOf(c) !== index)) {
        return res.status(400).json({ message: 'Duplicate colors found in variants' });
      }

      for (const v of variants) {
        for (const s of v.sizes) {
          if (s.price <= 0) return res.status(400).json({ message: `Price must be > 0 for size ${s.size}` });
          if (s.stock < 0) return res.status(400).json({ message: `Stock cannot be negative for size ${s.size}` });
        }
      }
    }

    const product = new Product({
      name, category, variants: variants || [],
      weight: weight ? Number(weight) : 0.5,
      isFeatured: isFeatured === true || isFeatured === 'true',
      ...rest
    });

    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET OPERATIONS ──────────────────────────────────────────────────────────
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    const filteredProducts = products.map(product => {
      const obj = product.toObject() as any;
      if (obj.variants) {
        obj.variants = obj.variants.filter((v: any) => !v.isDeleted);
      }
      return obj;
    });

    res.json(filteredProducts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false })
      .populate('category', 'name');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const productObj = product.toObject() as any;
    if (productObj.variants) {
      productObj.variants = productObj.variants.filter((v: any) => !v.isDeleted);
    }

    res.json(productObj);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE PRODUCT ──────────────────────────────────────────────────────────
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const allowed = ['name', 'shortDescription', 'mainDescription', 'category', 'isFeatured', 'weight', 'mainImage'];
    const extraError = checkExtraFields(allowed, req.body);
    if (extraError) return res.status(400).json({ message: extraError });

    const { category, weight, isFeatured, ...updateData } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (category) {
      const exists = await Category.findById(category);
      if (!exists) return res.status(400).json({ message: 'Invalid Category ID' });
      product.category = category;
    }

    if (weight !== undefined) {
      if (Number(weight) <= 0) return res.status(400).json({ message: 'Weight must be greater than 0' });
      product.weight = Number(weight);
    }

    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === true || isFeatured === 'true';
    }

    Object.assign(product, updateData);
    await product.save();
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE PRODUCT (Fixed for Name Reuse) ──────────────────────────────────
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isDeleted = true;

    const timestamp = Date.now();
    product.name = `${product.name} (Archived-${timestamp})`;
    product.slug = `${product.slug}-deleted-${timestamp}`;

    await product.save();
    res.json({ message: 'Product archived successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADD VARIANT (Fixed Duplicate Color Bug) ───────────────────────────────
export const addVariant = async (req: Request, res: Response) => {
  try {
    const allowed = ['color', 'images', 'sizes'];
    const extraError = checkExtraFields(allowed, req.body);
    if (extraError) return res.status(400).json({ message: extraError });

    const { color, images, sizes } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required for a variant' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const colorExists = product.variants.some(
      v => !v.isDeleted && v.color.toLowerCase().trim() === color.toLowerCase().trim()
    );
    if (colorExists) return res.status(400).json({ message: `Color "${color}" already exists` });

    product.variants.push({ color, images, sizes });
    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE VARIANT ──────────────────────────────────────────────────────────
export const updateVariant = async (req: Request, res: Response) => {
  try {
    const allowed = ['color', 'images'];
    const extraError = checkExtraFields(allowed, req.body);
    if (extraError) return res.status(400).json({ message: extraError });

    const { color, images } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const variant = product.variants.id(req.params.variantId as any);
    if (!variant || variant.isDeleted) return res.status(404).json({ message: 'Active variant not found' });

    if (color && color.toLowerCase().trim() !== variant.color.toLowerCase().trim()) {
      const colorExists = product.variants.some(
        v => !v.isDeleted && v.color.toLowerCase().trim() === color.toLowerCase().trim()
      );
      if (colorExists) return res.status(400).json({ message: 'Color name already exists' });
      variant.color = color;
    }

    if (images) variant.images = images;

    await product.save();
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE VARIANT ──────────────────────────────────────────────────────────
export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const variant = product.variants.id(req.params.variantId as any);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });

    variant.isDeleted = true;
    variant.color = `${variant.color}-archived-${Date.now()}`;
    
    await product.save();
    res.json({ message: 'Variant archived successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADD/UPDATE SIZE (Atomic) ────────────────────────────────────────────────
export const addSize = async (req: Request, res: Response) => {
  try {
    const { size, stock, price } = req.body;
    if (price <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
    if (stock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const variant = product.variants.id(req.params.variantId as any);
    if (!variant || variant.isDeleted) return res.status(404).json({ message: 'Active variant not found' });

    if (variant.sizes.some(s => s.size === size)) {
      return res.status(400).json({ message: `Size "${size}" already exists` });
    }

    variant.sizes.push({ size, stock, price });
    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSize = async (req: Request, res: Response) => {
  try {
    const { stock, price, size } = req.body;

    const product = await Product.findById(req.params.id);
    const variant = product?.variants.id(req.params.variantId as any);
    if (!variant || variant.isDeleted) return res.status(404).json({ message: 'Active variant not found' });

    const sizeEntry = variant.sizes.id(req.params.sizeId as any);
    if (!sizeEntry) return res.status(404).json({ message: 'Size entry not found' });

    if (price !== undefined && price <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
    if (stock !== undefined && stock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

    if (size && size !== sizeEntry.size) {
      if (variant.sizes.some(s => s.size === size)) return res.status(400).json({ message: 'Size already exists' });
      sizeEntry.size = size;
    }

    if (stock !== undefined) sizeEntry.stock = stock;
    if (price !== undefined) sizeEntry.price = price;

    await product?.save();
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GLOBAL SEARCH ──────────────────────────────────────────────────────────
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ products: [], categories: [] });

    const products = await Product.find({
      isDeleted: false,
      $or: [
        { name: { $regex: q as string, $options: 'i' } },
        { shortDescription: { $regex: q as string, $options: 'i' } }
      ]
    }).select('name mainImage slug variants').limit(10);

    const categories = await Category.find({
      isDeleted: false,
      name: { $regex: q as string, $options: 'i' }
    }).select('name slug').limit(5);

    res.json({ success: true, results: { products, categories } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};