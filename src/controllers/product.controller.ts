// import { Request, Response } from 'express';
// import Product from '../models/Product';

// export const createProduct = async (req: Request, res: Response) => {
//     try {
//         const { name, shortDescription, mainDescription, price, category, isFeatured } = req.body;

//         // 1. Files handle cheyyunnu
//         const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//         // Main Product Image URL
//         const mainImageUrl = files['mainImage'] ? files['mainImage'][0].path : '';

//         // 2. Variants logic
//         // Frontend-il ninnu variants oru JSON string aayi ayakkunnathaanu safest
//         let variants = [];
//         if (req.body.variants) {
//             variants = JSON.parse(req.body.variants);
//         }

//         /* Note: Oro variant-num different images undenkil, 
//            athine backend-il map cheyyunna logic ivide ezhuthanam. 
//            Simple aayi ippo ella variant images-um Cloudinary-il ninnu kittum.
//         */

//         const product = new Product({
//             name,
//             shortDescription,
//             mainDescription,
//             price,
//             category,
//             mainImage: mainImageUrl,
//             variants, // Ippo direct aayi variants array save cheyyunnu
//             isFeatured: isFeatured === 'true' ? true : false,
//         });

//         const savedProduct = await product.save();
//         res.status(201).json(savedProduct);

//     } catch (error: any) {
//         console.error("Product Error:", error);
//         res.status(500).json({ message: error.message });
//     }
// };

// // Ellaa products-um edukkaan
// export const getProducts = async (req: Request, res: Response) => {
//     try {
//         const products = await Product.find().populate('category', 'name');
//         res.json(products);
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };


// // @desc    Update a product
// // @route   PUT /api/products/:id
// // @access  Private/Admin
// export const updateProduct = async (req: Request, res: Response) => {
//   try {
//     const { name, shortDescription, mainDescription, price, category, isFeatured, variants } = req.body;
//     const product = await Product.findById(req.params.id);

//     if (product) {
//       // Images handle cheyyunnu (Puthiya images upload cheythittundenkil mathram)
//       const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//       if (files && files['mainImage']) {
//         product.mainImage = files['mainImage'][0].path;
//       }

//       product.name = name || product.name;
//       product.shortDescription = shortDescription || product.shortDescription;
//       product.mainDescription = mainDescription || product.mainDescription;
//       product.price = price || product.price;
//       product.category = category || product.category;
//       product.isFeatured = isFeatured === 'true' ? true : (isFeatured === 'false' ? false : product.isFeatured);

//       if (variants) {
//         product.variants = JSON.parse(variants);
//       }

//       const updatedProduct = await product.save();
//       res.json(updatedProduct);
//     } else {
//       res.status(404).json({ message: 'Product not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Delete a product
// // @route   DELETE /api/products/:id
// // @access  Private/Admin
// export const deleteProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       await product.deleteOne();
//       res.json({ message: 'Product removed successfully' });
//     } else {
//       res.status(404).json({ message: 'Product not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Get single product by ID
// // @route   GET /api/products/:id
// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id).populate('category', 'name');
//     if (product) {
//       res.json(product);
//     } else {
//       res.status(404).json({ message: 'Product not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// import { Request, Response } from 'express';
// import Product from '../models/Product';

// // @desc    Create a new product
// // @route   POST /api/products
// // @access  Private/Admin
// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     // 1. weight കൂടി ബോഡിയിൽ നിന്ന് എടുക്കുന്നു
//     const { name, shortDescription, mainDescription, category, isFeatured, weight } = req.body;

//     // 2. Files handle cheyyunnu (Main Product Image)
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//     const mainImageUrl = files['mainImage'] ? files['mainImage'][0].path : '';

//     // 3. Variants logic handle cheyyunnu
//     let variants = [];
//     if (req.body.variants) {
//       variants = JSON.parse(req.body.variants);

//       const seen = new Set();
//       for (const v of variants) {
//         const identifier = `${v.size}-${v.color.toLowerCase().trim()}`;
//         if (seen.has(identifier)) {
//           res.status(400).json({
//             message: `Duplicate variant found for Size: ${v.size} and Color: ${v.color}`
//           });
//           return;
//         }
//         seen.add(identifier);
//       }
//     }

//     // 4. പുതിയ Product ഒബ്ജക്റ്റിൽ weight ചേർക്കുന്നു
//     const product = new Product({
//       name,
//       shortDescription,
//       mainDescription,
//       category,
//       mainImage: mainImageUrl,
//       variants,
//       weight: weight ? Number(weight) : 0.5, // 🔥 weight നൽകിയില്ലെങ്കിൽ default 0.5kg
//       isFeatured: isFeatured === 'true' ? true : false,
//     });

//     const savedProduct = await product.save();
//     res.status(201).json(savedProduct);

//   } catch (error: any) {
//     if (error.name === 'ValidationError') {
//       res.status(400).json({ message: error.message });
//       return;
//     }
//     console.error("Product Create Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Get all products
// // @route   GET /api/products
// export const getProducts = async (req: Request, res: Response) => {
//   try {
//     const products = await Product.find()
//       .populate('category', 'name')
//       .sort({ createdAt: -1 });
//     res.json(products);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Get single product by ID
// // @route   GET /api/products/:id
// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id).populate('category', 'name');
//     if (product) {
//       res.json(product);
//     } else {
//       res.status(404).json({ message: 'Product not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Update a product
// // @route   PUT /api/products/:id
// // @access  Private/Admin
// export const updateProduct = async (req: Request, res: Response) => {
//   try {
//     // 1. weight കൂടി ബോഡിയിൽ നിന്ന് എടുക്കുന്നു
//     const { name, shortDescription, mainDescription, category, isFeatured, variants, weight } = req.body;
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       res.status(404).json({ message: 'Product not found' });
//       return;
//     }

//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//     if (files && files['mainImage']) {
//       product.mainImage = files['mainImage'][0].path;
//     }

//     if (variants) {
//       const parsedVariants = JSON.parse(variants);

//       // Duplicate check
//       const seen = new Set();
//       for (const v of parsedVariants) {
//         const identifier = `${v.size}-${v.color.toLowerCase().trim()}`;
//         if (seen.has(identifier)) {
//           res.status(400).json({
//             message: `Duplicate variant found for Size: ${v.size} and Color: ${v.color}`
//           });
//           return;
//         }
//         seen.add(identifier);
//       }

//       // Step 1: _id check
//       const hasVariantWithoutId = parsedVariants.some((v: any) => !v._id);
//       if (hasVariantWithoutId) {
//         res.status(400).json({
//           message: 'All variants must include _id when updating.'
//         });
//         return;
//       }

//       // Step 2: Delete missing variants
//       const incomingIds = parsedVariants.map((v: any) => v._id.toString());
//       product.variants = product.variants.filter(
//         (ev: any) => incomingIds.includes(ev._id.toString())
//       ) as any;

//       // Step 3: In-place update
//       for (const v of parsedVariants) {
//         const existing = product.variants.find(
//           (ev: any) => ev._id.toString() === v._id.toString()
//         );

//         if (!existing) {
//           res.status(400).json({
//             message: `Invalid Variant ID: ${v._id}`
//           });
//           return;
//         }

//         (existing as any).set(v);
//       }
//     }

//     // 2. ഇതര ഫീൽഡുകൾക്കൊപ്പം weight അപ്‌ഡേറ്റ് ചെയ്യുന്നു
//     product.name = name || product.name;
//     product.shortDescription = shortDescription || product.shortDescription;
//     product.mainDescription = mainDescription || product.mainDescription;
//     product.category = category || product.category;

//     // 🔥 weight നൽകിയിട്ടുണ്ടെങ്കിൽ മാത്രം അപ്‌ഡേറ്റ് ചെയ്യുക
//     if (weight !== undefined) {
//       product.weight = Number(weight);
//     }

//     product.isFeatured = isFeatured === 'true' ? true : (isFeatured === 'false' ? false : product.isFeatured);

//     const updatedProduct = await product.save();
//     res.json(updatedProduct);

//   } catch (error: any) {
//     if (error.name === 'ValidationError') {
//       res.status(400).json({ message: error.message });
//       return;
//     }
//     console.error("Product Update Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Delete a product
// // @route   DELETE /api/products/:id
// // @access  Private/Admin
// export const deleteProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       await product.deleteOne();
//       res.json({ message: 'Product removed successfully' });
//     } else {
//       res.status(404).json({ message: 'Product not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// import { Request, Response } from 'express';
// import Product from '../models/Product';
// import Category from '../models/Category';

// // ─── CREATE PRODUCT ──────────────────────────────────────────────────────────
// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const { name, category, variants, weight, isFeatured, ...rest } = req.body;

//     // 1. Category വാലിഡേഷൻ
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//       return res.status(400).json({ message: 'Invalid Category ID. Category does not exist.' });
//     }

//     // 2. Initial Variants നൽകിയിട്ടുണ്ടെങ്കിൽ ഡ്യൂപ്ലിക്കേറ്റ് കളർ ഉണ്ടോ എന്ന് നോക്കുക
//     if (variants && Array.isArray(variants)) {
//       const colors = variants.map((v: any) => v.color.toLowerCase().trim());
//       const isDuplicate = colors.some((c, index) => colors.indexOf(c) !== index);
//       if (isDuplicate) {
//         return res.status(400).json({ message: 'Duplicate colors found in the variants list' });
//       }
//     }

//     const product = new Product({
//       name,
//       category,
//       variants: variants || [],
//       weight: weight ? Number(weight) : 0.5,
//       isFeatured: isFeatured === true || isFeatured === 'true',
//       ...rest
//     });

//     const savedProduct = await product.save();
//     res.status(201).json(savedProduct);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── GET OPERATIONS ──────────────────────────────────────────────────────────
// export const getProducts = async (req: Request, res: Response) => {
//   try {
//     const products = await Product.find().populate('category', 'name').sort({ createdAt: -1 });
//     res.json(products);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id).populate('category', 'name');
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     res.json(product);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── UPDATE PRODUCT (BASIC INFO ONLY) ────────────────────────────────────────
// export const updateProduct = async (req: Request, res: Response) => {
//   try {
//     const { name, shortDescription, mainDescription, category, isFeatured, weight, mainImage } = req.body;

//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     // Category മാറ്റുന്നുണ്ടെങ്കിൽ അത് വാലിഡ് ആണോ എന്ന് നോക്കുക
//     if (category) {
//       const categoryExists = await Category.findById(category);
//       if (!categoryExists) return res.status(400).json({ message: 'Invalid Category ID' });
//       product.category = category;
//     }

//     if (name) product.name = name;
//     if (shortDescription) product.shortDescription = shortDescription;
//     if (mainDescription) product.mainDescription = mainDescription;
//     if (mainImage) product.mainImage = mainImage;
//     if (weight !== undefined) product.weight = Number(weight);
//     if (isFeatured !== undefined) {
//       product.isFeatured = isFeatured === true || isFeatured === 'true';
//     }

//     // ശ്രദ്ധിക്കുക: ഇവിടെ product.variants അപ്‌ഡേറ്റ് ചെയ്യുന്നില്ല.
//     await product.save();
//     res.json(product);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── DELETE PRODUCT ──────────────────────────────────────────────────────────
// export const deleteProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     res.json({ message: 'Product removed successfully' });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── ATOMIC VARIANT OPERATIONS ───────────────────────────────────────────────

// export const addVariant = async (req: Request, res: Response) => {
//   try {
//     const { color, images, sizes } = req.body;
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     // കളർ ഡ്യൂപ്ലിക്കേഷൻ ചെക്ക്
//     const colorExists = product.variants.some(
//       v => v.color.toLowerCase().trim() === color.toLowerCase().trim()
//     );
//     if (colorExists) return res.status(400).json({ message: `Color "${color}" already exists` });

//     product.variants.push({ color, images, sizes });
//     await product.save();
//     res.status(201).json(product);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateVariant = async (req: Request, res: Response) => {
//   try {
//     const { color, images } = req.body; // sizes ഇവിടെ എടുക്കുന്നില്ല
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     const variant = product.variants.id(req.params.variantId as any);
//     if (!variant) return res.status(404).json({ message: 'Variant not found' });

//     // കളർ മാറ്റുന്നുണ്ടെങ്കിൽ അത് മറ്റൊരു വേരിയന്റുമായി ഡ്യൂപ്ലിക്കേറ്റ് ആകുന്നുണ്ടോ എന്ന് നോക്കുക
//     if (color && color.toLowerCase().trim() !== variant.color.toLowerCase().trim()) {
//       const colorExists = product.variants.some(
//         v => v.color.toLowerCase().trim() === color.toLowerCase().trim()
//       );
//       if (colorExists) return res.status(400).json({ message: 'Color name already exists' });
//       variant.color = color;
//     }

//     if (images) variant.images = images;

//     await product.save();
//     res.json(product);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const deleteVariant = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     (product.variants as any).pull(req.params.variantId);
//     await product.save();
//     res.json({ message: 'Variant removed successfully' });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── ATOMIC SIZE OPERATIONS ──────────────────────────────────────────────────

// export const addSize = async (req: Request, res: Response) => {
//   try {
//     const { size, stock, price } = req.body;
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     const variant = product.variants.id(req.params.variantId as any);
//     if (!variant) return res.status(404).json({ message: 'Variant not found' });

//     // സൈസ് ഡ്യൂപ്ലിക്കേഷൻ ചെക്ക്
//     const sizeExists = variant.sizes.some(s => s.size === size);
//     if (sizeExists) return res.status(400).json({ message: `Size "${size}" already exists for this color` });

//     variant.sizes.push({ size, stock, price });
//     await product.save();
//     res.status(201).json(product);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateSize = async (req: Request, res: Response) => {
//   try {
//     const { stock, price, size } = req.body;
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     const variant = product.variants.id(req.params.variantId as any);
//     if (!variant) return res.status(404).json({ message: 'Variant not found' });

//     const sizeEntry = variant.sizes.id(req.params.sizeId as any);
//     if (!sizeEntry) return res.status(404).json({ message: 'Size entry not found' });

//     // സൈസ് മാറ്റുന്നുണ്ടെങ്കിൽ ഡ്യൂപ്ലിക്കേറ്റ് ചെക്ക് (ഉദാ: M-ൽ നിന്ന് L-ലേക്ക് മാറ്റുമ്പോൾ)
//     if (size && size !== sizeEntry.size) {
//       const sizeExists = variant.sizes.some(s => s.size === size);
//       if (sizeExists) return res.status(400).json({ message: 'Size already exists' });
//       sizeEntry.size = size;
//     }

//     if (stock !== undefined) sizeEntry.stock = stock;
//     if (price !== undefined) sizeEntry.price = price;

//     await product.save();
//     res.json(product);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

// --- HELPER: അനുവദനീയമല്ലാത്ത ഫീൽഡുകൾ ഉണ്ടോ എന്ന് പരിശോധിക്കാൻ ---
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

    // 🔥 വെയിറ്റ് വാലിഡേഷൻ
    if (weight !== undefined && Number(weight) <= 0) {
      return res.status(400).json({ message: 'Weight must be a positive number' });
    }

    if (variants && Array.isArray(variants)) {
      const colors = variants.map((v: any) => v.color.toLowerCase().trim());
      if (colors.some((c, index) => colors.indexOf(c) !== index)) {
        return res.status(400).json({ message: 'Duplicate colors found in variants' });
      }

      // 🔥 വകഭേദങ്ങളിലെ വിലയും സ്റ്റോക്കും പരിശോധിക്കുന്നു
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
      // 🔥 മാറ്റം: 'as any' ചേർത്തു
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

    // 🔥 മാറ്റം: 'as any' ചേർത്തു
    const productObj = product.toObject() as any;
    if (productObj.variants) {
      productObj.variants = productObj.variants.filter((v: any) => !v.isDeleted);
    }

    res.json(productObj);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};;


// ─── UPDATE PRODUCT (BASIC INFO ONLY) ────────────────────────────────────────
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

    // 🔥 വെയിറ്റ് 0 ആകാൻ പാടില്ല
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

// ─── DELETE PRODUCT ──────────────────────────────────────────────────────────
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isDeleted = true;

    // 🔥 Slug Conflict ഒഴിവാക്കാൻ ഡിലീറ്റ് ചെയ്യുമ്പോൾ സ്ലഗ് മാറ്റുന്നു
    product.slug = `${product.slug}-deleted-${Date.now()}`;

    await product.save();
    res.json({ message: 'Product archived successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ATOMIC VARIANT OPERATIONS ───────────────────────────────────────────────

export const addVariant = async (req: Request, res: Response) => {
  try {
    const allowed = ['color', 'images', 'sizes'];
    const extraError = checkExtraFields(allowed, req.body);
    if (extraError) return res.status(400).json({ message: extraError });

    const { color, images, sizes } = req.body;

    // 🔥 സുരക്ഷാ പരിശോധന: ഇമേജ് ലിസ്റ്റ് നിർബന്ധമാണ്
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required for a variant' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const colorExists = product.variants.some(
      v => v.color.toLowerCase().trim() === color.toLowerCase().trim()
    );
    if (colorExists) return res.status(400).json({ message: `Color "${color}" already exists` });

    product.variants.push({ color, images, sizes });
    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const allowed = ['color', 'images'];
    const extraError = checkExtraFields(allowed, req.body);
    if (extraError) return res.status(400).json({ message: extraError });

    const { color, images } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const variant = product.variants.id(req.params.variantId as any);

    // 🔥 മാറ്റം: ഡിലീറ്റ് ആയ വേരിയന്റ് അപ്‌ഡേറ്റ് ചെയ്യാൻ സമ്മതിക്കരുത്
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

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const variant = product.variants.id(req.params.variantId as any);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });

    // 🔥 ഡിലീറ്റ് ചെയ്യുന്നതിന് പകരം സ്റ്റാറ്റസ് മാറ്റുന്നു
    variant.isDeleted = true;
    await product.save();

    res.json({ message: 'Variant archived successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ATOMIC SIZE OPERATIONS ──────────────────────────────────────────────────

export const addSize = async (req: Request, res: Response) => {
  try {
    const { size, stock, price } = req.body;

    // 🔥 വാലിഡേഷൻ
    if (price <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
    if (stock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const variant = product.variants.id(req.params.variantId as any);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });

    // സൈസ് ഡ്യൂപ്ലിക്കേഷൻ ചെക്ക്
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
    const sizeEntry = variant?.sizes.id(req.params.sizeId as any);

    if (!sizeEntry) return res.status(404).json({ message: 'Size entry not found' });

    // 🔥 വിലയും സ്റ്റോക്കും പോസിറ്റീവ് ആണെന്ന് ഉറപ്പാക്കുന്നു
    if (price !== undefined && price <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
    if (stock !== undefined && stock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

    // സൈസ് പേര് മാറ്റുകയാണെങ്കിൽ (ഉദാ: M-ൽ നിന്ന് L-ലേക്ക്)
    if (size && size !== sizeEntry.size) {
      if (variant?.sizes.some(s => s.size === size)) return res.status(400).json({ message: 'Size already exists' });
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