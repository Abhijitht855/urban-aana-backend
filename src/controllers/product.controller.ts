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
    const allowed = [
      'name',
      'shortDescription',
      'mainDescription',
      'productStory',
      'productDetails',
      'category',
      'mainImage',
      'weight',
      'isFeatured',
      'variants'
    ];

    const extraError = checkExtraFields(allowed, req.body);
    if (extraError) return res.status(400).json({ message: extraError });

    const {
      name,
      category,
      variants,
      weight,
      isFeatured,
      productStory,
      productDetails,
      ...rest
    } = req.body;

    // 1. ✅ Require at least one variant
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: 'At least one variant is required' });
    }

    // 2. Category Validation
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ message: 'Invalid Category ID.' });

    // 3. Weight Validation
    if (weight !== undefined && Number(weight) <= 0) {
      return res.status(400).json({ message: 'Weight must be a positive number' });
    }

    // 4. Variants & Sizes Validation
    const colors = variants.map((v: any) => v.color.toLowerCase().trim());
    if (colors.some((c, index) => colors.indexOf(c) !== index)) {
      return res.status(400).json({ message: 'Duplicate colors found in variants' });
    }

    for (const v of variants) {
      // ✅ Each variant must have at least one image
      if (!v.images || !Array.isArray(v.images) || v.images.length === 0) {
        return res.status(400).json({ message: `Each variant must have at least one image (missing for color ${v.color})` });
      }
      // ✅ Each variant must have at least one size
      if (!v.sizes || !Array.isArray(v.sizes) || v.sizes.length === 0) {
        return res.status(400).json({ message: `Each variant must have at least one size (missing for color ${v.color})` });
      }
      for (const s of v.sizes) {
        if (s.price <= 0) return res.status(400).json({ message: `Price must be > 0 for size ${s.size}` });
        if (s.stock < 0) return res.status(400).json({ message: `Stock cannot be negative for size ${s.size}` });
      }
    }

    const product = new Product({
      name,
      category,
      variants,               // now guaranteed non‑empty
      productStory,
      productDetails,
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

// ─── UPDATE PRODUCT (BASIC INFO ONLY) ────────────────────────────────────────
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const allowed = [
      'name',
      'shortDescription',
      'mainDescription',
      'productStory',
      'productDetails',
      'category',
      'isFeatured',
      'weight',
      'mainImage'
    ];

    const extraError = checkExtraFields(allowed, req.body);
    if (extraError) return res.status(400).json({ message: extraError });

    // 2. Destructuring fields
    const {
      category,
      weight,
      isFeatured,
      productStory,
      productDetails,
      ...updateData
    } = req.body;

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

    // 5. Featured Status
    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === true || isFeatured === 'true';
    }

    // 6. പുതിയ ഫീൽഡുകൾ അപ്‌ഡേറ്റ് ചെയ്യുന്നു
    if (productStory !== undefined) product.productStory = productStory;
    if (productDetails !== undefined) product.productDetails = productDetails;

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
    if (!variant || variant.isDeleted) {
      return res.status(404).json({ message: 'Active variant not found' });
    }

    if (color && color.toLowerCase().trim() !== variant.color.toLowerCase().trim()) {
      const colorExists = product.variants.some(
        v => !v.isDeleted && v.color.toLowerCase().trim() === color.toLowerCase().trim()
      );
      if (colorExists) return res.status(400).json({ message: 'Color name already exists' });
      variant.color = color;
    }

    if (images) {
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: 'At least one image is required for a variant' });
      }
      variant.images = images;
    }

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

export const getSitemap = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isDeleted: false }).select('slug updatedAt');

    const baseUrl = 'https://urbanaana.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    xml += `<url><loc>${baseUrl}/</loc><priority>1.0</priority></url>`;

    products.forEach((prod) => {
      xml += `
        <url>
          <loc>${baseUrl}/product/${prod.slug}</loc>
          <lastmod>${prod.updatedAt.toISOString().split('T')[0]}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
};