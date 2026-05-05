// import { Request, Response } from 'express';
// import axios from 'axios';

// let cachedToken: string | null = null;

// // 1. Shiprocket Token ജനറേറ്റ് ചെയ്യുന്ന ഫംഗ്‌ഷൻ
// const getShiprocketToken = async () => {
//     try {
//         const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
//             email: process.env.SHIPROCKET_EMAIL,
//             password: process.env.SHIPROCKET_PASSWORD,
//         });
//         cachedToken = response.data.token;
//         return cachedToken;
//     } catch (error: any) {
//         console.error('Shiprocket Auth Error:', error.response?.data || error.message);
//         return null;
//     }
// };

// /**
//  * @desc    Check Serviceability & Get Shipping Rates
//  * @route   POST /api/shipping/check
//  */
// export const checkServiceability = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { delivery_pincode, weight, is_cod } = req.body;

//         if (!cachedToken) {
//             await getShiprocketToken();
//         }

//         const response = await axios.get(
//             `https://apiv2.shiprocket.in/v1/external/courier/serviceability/`,
//             {
//                 params: {
//                     pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE,
//                     delivery_postcode: delivery_pincode,
//                     weight: weight || 0.5, // Default weight 500g
//                     cod: is_cod ? 1 : 0,
//                 },
//                 headers: {
//                     Authorization: `Bearer ${cachedToken}`,
//                 },
//             }
//         );

//         const availableCouriers = response.data.data.available_courier_companies;

//         if (!availableCouriers || availableCouriers.length === 0) {
//             res.status(404).json({ message: 'No shipping service available for this pincode' });
//             return;
//         }

//         // ഏറ്റവും കുറഞ്ഞ റേറ്റ് ഉള്ള കൊറിയറിനെ കണ്ടെത്തുന്നു
//         const cheapestCourier = availableCouriers.reduce((prev: any, curr: any) =>
//             Number(prev.rate) < Number(curr.rate) ? prev : curr
//         );

//         res.json({
//             success: true,
//             shipping_rate: cheapestCourier.rate,
//             estimated_delivery: cheapestCourier.etd,
//             courier_name: cheapestCourier.courier_name
//         });

//     } catch (error: any) {
//         // ടോക്കൺ എക്സ്പയർ ആയതാണെങ്കിൽ (401) വീണ്ടും ടോക്കൺ എടുത്ത് ട്രൈ ചെയ്യുക
//         if (error.response?.status === 401) {
//             cachedToken = null;
//             return checkServiceability(req, res);
//         }
//         res.status(500).json({ message: 'Shipping calculation failed', error: error.message });
//     }
// };

import { Request, Response } from 'express';
import axios from 'axios';

// റിട്ടേൺ ടൈപ്പ് വ്യക്തമാക്കാൻ ഒരു ഇന്റർഫേസ് ഉണ്ടാക്കുന്നു
interface ShippingRateResponse {
    rate: number;
    etd: string;
    courier_name: string;
}

let cachedToken: string | null = null;

// 1. Shiprocket Token ജനറേറ്റ് ചെയ്യുന്ന ഹെൽപ്പർ ഫംഗ്‌ഷൻ
const getShiprocketToken = async (): Promise<string | null> => {
    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        });
        cachedToken = response.data.token;
        return cachedToken;
    } catch (error: any) {
        console.error('Shiprocket Auth Error:', error.response?.data || error.message);
        return null;
    }
};

// 2. ബാക്കെൻഡിന് അകത്ത് മാത്രം ഉപയോഗിക്കാൻ വേണ്ടി (Exported Helper)
// ഇവിടെ Promise<ShippingRateResponse | null> എന്ന് ടൈപ്പ് നൽകി
export const getShippingRate = async (
    delivery_pincode: string, 
    weight: number = 0.5
): Promise<ShippingRateResponse | null> => {
    try {
        if (!cachedToken) {
            await getShiprocketToken();
        }

        const response = await axios.get(
            `https://apiv2.shiprocket.in/v1/external/courier/serviceability/`,
            {
                params: {
                    pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE,
                    delivery_postcode: delivery_pincode,
                    weight: weight,
                    cod: 0,
                },
                headers: {
                    Authorization: `Bearer ${cachedToken}`,
                },
            }
        );

        const availableCouriers = response.data.data.available_courier_companies;

        if (!availableCouriers || availableCouriers.length === 0) {
            return null;
        }

        const cheapestCourier = availableCouriers.reduce((prev: any, curr: any) =>
            Number(prev.rate) < Number(curr.rate) ? prev : curr
        );

        return {
            rate: Number(cheapestCourier.rate),
            etd: cheapestCourier.etd,
            courier_name: cheapestCourier.courier_name
        };
    } catch (error: any) {
        // ടോക്കൺ എക്സ്പയർ ആയതാണെങ്കിൽ (401) ടോക്കൺ റീസെറ്റ് ചെയ്ത് വീണ്ടും ട്രൈ ചെയ്യുക
        if (error.response?.status === 401) {
            cachedToken = null;
            return getShippingRate(delivery_pincode, weight);
        }
        console.error('Shipping Fetch Error:', error.message);
        return null;
    }
};

/**
 * @desc    Check Serviceability & Get Shipping Rates (Route-ന് വേണ്ടി)
 * @route   POST /api/shipping/check
 */
export const checkServiceability = async (req: Request, res: Response): Promise<void> => {
    const { delivery_pincode, weight } = req.body;
    const result = await getShippingRate(delivery_pincode, weight);

    if (!result) {
        res.status(404).json({ message: 'No shipping service available for this pincode' });
        return;
    }

    res.json({ success: true, ...result });
};