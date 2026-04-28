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

import { Request, Response } from 'express';
import Product from '../models/Product';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
  try {
    // 1. weight കൂടി ബോഡിയിൽ നിന്ന് എടുക്കുന്നു
    const { name, shortDescription, mainDescription, category, isFeatured, weight } = req.body;

    // 2. Files handle cheyyunnu (Main Product Image)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const mainImageUrl = files['mainImage'] ? files['mainImage'][0].path : '';

    // 3. Variants logic handle cheyyunnu
    let variants = [];
    if (req.body.variants) {
      variants = JSON.parse(req.body.variants);

      const seen = new Set();
      for (const v of variants) {
        const identifier = `${v.size}-${v.color.toLowerCase().trim()}`;
        if (seen.has(identifier)) {
          res.status(400).json({
            message: `Duplicate variant found for Size: ${v.size} and Color: ${v.color}`
          });
          return;
        }
        seen.add(identifier);
      }
    }

    // 4. പുതിയ Product ഒബ്ജക്റ്റിൽ weight ചേർക്കുന്നു
    const product = new Product({
      name,
      shortDescription,
      mainDescription,
      category,
      mainImage: mainImageUrl,
      variants,
      weight: weight ? Number(weight) : 0.5, // 🔥 weight നൽകിയില്ലെങ്കിൽ default 0.5kg
      isFeatured: isFeatured === 'true' ? true : false,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error("Product Create Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
  try {
    // 1. weight കൂടി ബോഡിയിൽ നിന്ന് എടുക്കുന്നു
    const { name, shortDescription, mainDescription, category, isFeatured, variants, weight } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files && files['mainImage']) {
      product.mainImage = files['mainImage'][0].path;
    }

    if (variants) {
      const parsedVariants = JSON.parse(variants);

      // Duplicate check
      const seen = new Set();
      for (const v of parsedVariants) {
        const identifier = `${v.size}-${v.color.toLowerCase().trim()}`;
        if (seen.has(identifier)) {
          res.status(400).json({
            message: `Duplicate variant found for Size: ${v.size} and Color: ${v.color}`
          });
          return;
        }
        seen.add(identifier);
      }

      // Step 1: _id check
      const hasVariantWithoutId = parsedVariants.some((v: any) => !v._id);
      if (hasVariantWithoutId) {
        res.status(400).json({
          message: 'All variants must include _id when updating.'
        });
        return;
      }

      // Step 2: Delete missing variants
      const incomingIds = parsedVariants.map((v: any) => v._id.toString());
      product.variants = product.variants.filter(
        (ev: any) => incomingIds.includes(ev._id.toString())
      ) as any;

      // Step 3: In-place update
      for (const v of parsedVariants) {
        const existing = product.variants.find(
          (ev: any) => ev._id.toString() === v._id.toString()
        );

        if (!existing) {
          res.status(400).json({
            message: `Invalid Variant ID: ${v._id}`
          });
          return;
        }

        (existing as any).set(v);
      }
    }

    // 2. ഇതര ഫീൽഡുകൾക്കൊപ്പം weight അപ്‌ഡേറ്റ് ചെയ്യുന്നു
    product.name = name || product.name;
    product.shortDescription = shortDescription || product.shortDescription;
    product.mainDescription = mainDescription || product.mainDescription;
    product.category = category || product.category;

    // 🔥 weight നൽകിയിട്ടുണ്ടെങ്കിൽ മാത്രം അപ്‌ഡേറ്റ് ചെയ്യുക
    if (weight !== undefined) {
      product.weight = Number(weight);
    }

    product.isFeatured = isFeatured === 'true' ? true : (isFeatured === 'false' ? false : product.isFeatured);

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error("Product Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};