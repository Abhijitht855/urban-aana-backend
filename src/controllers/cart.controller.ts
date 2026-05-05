// import { Request, Response } from 'express';
// import Cart from '../models/Cart';

// // @desc    Add item to cart
// // @route   POST /api/cart
// // @access  Private
// export const addToCart = async (req: Request, res: Response) => {
//     try {
//         const { productId, size, color, quantity } = req.body;

//         // ! ഉപയോഗിക്കുന്നത് വഴി TypeScript എറർ മാറും
//         const userId = req.user!._id; 

//         // 1. Check if the same product with same variant already exists in cart
//         let cartItem = await Cart.findOne({
//             user: userId,
//             product: productId,
//             'variant.size': size,
//             'variant.color': color
//         });

//         if (cartItem) {
//             // Undenkil quantity update cheyyuka
//             cartItem.quantity += Number(quantity) || 1;
//             await cartItem.save();
//         } else {
//             // Illengil puthiya item create cheyyuka
//             cartItem = await Cart.create({
//                 user: userId,
//                 product: productId,
//                 variant: { size, color },
//                 quantity: Number(quantity) || 1
//             });
//         }

//         res.status(201).json(cartItem);
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // @desc    Get user cart items
// // @route   GET /api/cart
// // @access  Private
// export const getCart = async (req: Request, res: Response) => {
//     try {
//         // req.user!._id ഉപയോഗിച്ചു
//         const cartItems = await Cart.find({ user: req.user!._id })
//             .populate('product', 'name price mainImage slug'); 

//         res.json(cartItems);
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // @desc    Remove item from cart
// // @route   DELETE /api/cart/:id
// // @access  Private
// export const removeFromCart = async (req: Request, res: Response) => {
//     try {
//         const cartItem = await Cart.findOneAndDelete({
//             _id: req.params.id,
//             user: req.user!._id 
//         });

//         if (cartItem) {
//             res.json({ message: 'Item removed from cart' });
//         } else {
//             res.status(404).json({ message: 'Item not found' });
//         }
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // @desc    Update cart quantity
// // @route   PUT /api/cart/:id
// // @access  Private
// export const updateCartQuantity = async (req: Request, res: Response) => {
//     try {
//         const { quantity } = req.body;
//         const cartItem = await Cart.findOneAndUpdate(
//             { _id: req.params.id, user: req.user!._id },
//             { quantity: Number(quantity) },
//             { new: true }
//         );

//         if (cartItem) {
//             res.json(cartItem);
//         } else {
//             res.status(404).json({ message: 'Cart item not found' });
//         }
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

// import { Request, Response } from 'express';
// import Cart from '../models/Cart';
// import Product from '../models/Product';

// /**
//  * @desc    Add item to cart
//  * @route   POST /api/cart
//  */
// export const addToCart = async (req: Request, res: Response) => {
//     try {
//         const { productId, variantId, quantity } = req.body;
//         const userId = req.user!._id;

//         // 1. പ്രോഡക്റ്റ് നിലവിലുണ്ടോ എന്ന് നോക്കുന്നു
//         const product = await Product.findById(productId);
//         if (!product) {
//             res.status(404).json({ message: 'Product not found' });
//             return;
//         }

//         // 2. Mongoose .id() മെത്തേഡ് ഉപയോഗിച്ച് വേരിയന്റ് കണ്ടെത്തുന്നു
//         const variant = (product.variants as any).id(variantId);

//         if (!variant) {
//             res.status(400).json({ message: 'Selected variant not found' });
//             return;
//         }

//         // 3. സ്റ്റോക്ക് പരിശോധന (പരിഷ്കരിച്ചത്)
//         if (variant.stock <= 0) {
//             res.status(400).json({ message: 'Selected variant is out of stock' });
//             return;
//         }

//         // കസ്റ്റമർ ആവശ്യപ്പെട്ട ക്വാണ്ടിറ്റി സ്റ്റോക്കിനേക്കാൾ കൂടുതലാണോ എന്ന് നോക്കുന്നു
//         if (Number(quantity) > variant.stock) {
//             res.status(400).json({
//                 message: `Only ${variant.stock} items left in stock. You cannot add ${quantity} items.`
//             });
//             return;
//         }

//         // 4. കാർട്ടിൽ ഓൾറെഡി ഈ വേരിയന്റ് ഉണ്ടോ എന്ന് നോക്കുന്നു
//         let cartItem = await Cart.findOne({
//             user: userId,
//             product: productId,
//             variantId: variantId
//         });

//         if (cartItem) {
//             // ഉണ്ടെങ്കിൽ ക്വാണ്ടിറ്റി അപ്ഡേറ്റ് ചെയ്യുന്നു
//             cartItem.quantity += Number(quantity) || 1;
//             await cartItem.save();
//         } else {
//             // ഇല്ലെങ്കിൽ പുതിയ എൻട്രി ഉണ്ടാക്കുന്നു
//             cartItem = await Cart.create({
//                 user: userId,
//                 product: productId,
//                 variantId: variantId,
//                 quantity: Number(quantity) || 1
//             });
//         }

//         res.status(201).json(cartItem);
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

// /**
//  * @desc    Get user cart items
//  * @route   GET /api/cart
//  */
// export const getCart = async (req: Request, res: Response) => {
//     try {
//         const cartItems = await Cart.find({ user: req.user!._id })
//             .populate('product', 'name mainImage slug variants');

//         // 🔥 മാച്ച് ആകുന്ന വേരിയന്റ് മാത്രം ഓരോ ഐറ്റത്തിലും സെറ്റ് ചെയ്യുന്നു
//         const formattedCart = cartItems.map((item: any) => {
//             const productObj = item.product.toObject();

//             // കാർട്ടിലെ variantId വെച്ച് പ്രോഡക്റ്റിലെ വേരിയന്റ് കണ്ടെത്തുന്നു
//             const selectedVariant = productObj.variants.find(
//                 (v: any) => v._id.toString() === item.variantId.toString()
//             );

//             return {
//                 _id: item._id,
//                 productId: productObj._id,
//                 name: productObj.name,
//                 slug: productObj.slug,
//                 mainImage: productObj.mainImage,
//                 quantity: item.quantity,
//                 // ✅ ഇപ്പോൾ ആഡ് ചെയ്ത വേരിയന്റ് മാത്രം ഇവിടെ വരും
//                 selectedVariant: selectedVariant || null
//             };
//         });

//         res.json(formattedCart);
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

// /**
//  * @desc    Update cart quantity
//  * @route   PUT /api/cart/:id
//  */
// export const updateCartQuantity = async (req: Request, res: Response) => {
//     try {
//         const { quantity } = req.body;
//         const requestedQuantity = Number(quantity);

//         if (requestedQuantity < 1) {
//             res.status(400).json({ message: 'Quantity must be at least 1' });
//             return;
//         }

//         // കാർട്ട് ഐറ്റം കണ്ടെത്തുന്നു
//         const cartItem = await Cart.findOne({ _id: req.params.id, user: req.user!._id });
//         if (!cartItem) {
//             res.status(404).json({ message: 'Cart item not found' });
//             return;
//         }

//         // പ്രോഡക്റ്റും വേരിയന്റും ചെക്ക് ചെയ്ത് സ്റ്റോക്ക് ഉറപ്പുവരുത്തുന്നു
//         const product = await Product.findById(cartItem.product);
//         const variant = (product?.variants as any)?.id(cartItem.variantId);

//         if (!variant || requestedQuantity > variant.stock) {
//             res.status(400).json({
//                 message: `Insufficient stock. Only ${variant?.stock || 0} left.`
//             });
//             return;
//         }

//         cartItem.quantity = requestedQuantity;
//         await cartItem.save();

//         res.json(cartItem);
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

// /**
//  * @desc    Remove item from cart
//  * @route   DELETE /api/cart/:id
//  */
// export const removeFromCart = async (req: Request, res: Response) => {
//     try {
//         const cartItem = await Cart.findOneAndDelete({
//             _id: req.params.id,
//             user: req.user!._id
//         });

//         if (cartItem) {
//             res.json({ message: 'Item removed from cart' });
//         } else {
//             res.status(404).json({ message: 'Item not found' });
//         }
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

export const addToCart = async (req: Request, res: Response) => {
    try {
        const { productId, variantId, sizeId, quantity } = req.body;
        const userId = req.user!._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // 1. കളർ വേരിയന്റ് കണ്ടെത്തുന്നു
        const variant = (product.variants as any).id(variantId);
        if (!variant) return res.status(400).json({ message: 'Selected color variant not found' });

        // 2. ആ കളറിനുള്ളിലെ സൈസ് കണ്ടെത്തുന്നു
        const sizeEntry = (variant.sizes as any).id(sizeId);
        if (!sizeEntry) return res.status(400).json({ message: 'Selected size not found' });

        // 3. സ്റ്റോക്ക് പരിശോധന (Size level)
        if (sizeEntry.stock <= 0) {
            return res.status(400).json({ message: 'Selected size is out of stock' });
        }

        if (Number(quantity) > sizeEntry.stock) {
            return res.status(400).json({ message: `Only ${sizeEntry.stock} items left in stock.` });
        }

        // 4. കാർട്ടിൽ ഓൾറെഡി ഉണ്ടോ എന്ന് നോക്കുന്നു (SizeId കൂടി വച്ച്)
        let cartItem = await Cart.findOne({
            user: userId,
            product: productId,
            variantId,
            sizeId
        });

        if (cartItem) {
            cartItem.quantity += Number(quantity) || 1;
            // അപ്ഡേറ്റ് ചെയ്ത ക്വാണ്ടിറ്റി സ്റ്റോക്കിനേക്കാൾ കൂടുന്നുണ്ടോ എന്ന് വീണ്ടും നോക്കുന്നു
            if (cartItem.quantity > sizeEntry.stock) {
                return res.status(400).json({ message: 'Total quantity exceeds available stock' });
            }
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                user: userId,
                product: productId,
                variantId,
                sizeId,
                quantity: Number(quantity) || 1
            });
        }

        res.status(201).json(cartItem);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCart = async (req: Request, res: Response) => {
    try {
        const cartItems = await Cart.find({ user: req.user!._id })
            .populate('product', 'name mainImage slug variants');

        let totalPrice = 0;
        let totalQuantity = 0;

        const formattedCart = cartItems.map((item: any) => {
            const productObj = item.product.toObject();

            const variant = productObj.variants.find(
                (v: any) => v._id.toString() === item.variantId.toString()
            );

            const sizeDetail = variant?.sizes.find(
                (s: any) => s._id.toString() === item.sizeId.toString()
            );

            const price = sizeDetail?.price || 0;
            const subtotal = price * item.quantity;

            // 🔥 accumulate totals
            totalPrice += subtotal;
            totalQuantity += item.quantity;

            return {
                _id: item._id,
                productId: productObj._id,
                variantId: item.variantId,
                sizeId: item.sizeId,
                name: productObj.name,
                slug: productObj.slug,
                mainImage: productObj.mainImage,
                quantity: item.quantity,
                color: variant?.color,
                image: variant?.images[0] || productObj.mainImage,
                size: sizeDetail?.size,
                price,
                stock: sizeDetail?.stock,
                subtotal // ✅ add per item total
            };
        });

        res.json({
            items: formattedCart,
            totalQuantity,
            totalPrice,
            totalItems: formattedCart.length
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCartQuantity = async (req: Request, res: Response) => {
    try {
        const { quantity } = req.body;
        const cartItem = await Cart.findOne({ _id: req.params.id, user: req.user!._id });
        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

        const product = await Product.findById(cartItem.product);
        const variant = (product?.variants as any)?.id(cartItem.variantId);
        const sizeEntry = (variant?.sizes as any)?.id(cartItem.sizeId);

        if (!sizeEntry || Number(quantity) > sizeEntry.stock) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        cartItem.quantity = Number(quantity);
        await cartItem.save();
        res.json(cartItem);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromCart = async (req: Request, res: Response) => {
    try {
        await Cart.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
        res.json({ message: 'Item removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};