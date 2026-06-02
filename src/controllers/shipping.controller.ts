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

// import { Request, Response } from 'express';
// import axios from 'axios';

// // റിട്ടേൺ ടൈപ്പ് വ്യക്തമാക്കാൻ ഒരു ഇന്റർഫേസ് ഉണ്ടാക്കുന്നു
// interface ShippingRateResponse {
//     rate: number;
//     etd: string;
//     courier_name: string;
// }

// let cachedToken: string | null = null;

// // 1. Shiprocket Token ജനറേറ്റ് ചെയ്യുന്ന ഹെൽപ്പർ ഫംഗ്‌ഷൻ
// const getShiprocketToken = async (): Promise<string | null> => {
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

// // 2. ബാക്കെൻഡിന് അകത്ത് മാത്രം ഉപയോഗിക്കാൻ വേണ്ടി (Exported Helper)
// // ഇവിടെ Promise<ShippingRateResponse | null> എന്ന് ടൈപ്പ് നൽകി
// export const getShippingRate = async (
//     delivery_pincode: string, 
//     weight: number = 0.5
// ): Promise<ShippingRateResponse | null> => {
//     try {
//         if (!cachedToken) {
//             await getShiprocketToken();
//         }

//         const response = await axios.get(
//             `https://apiv2.shiprocket.in/v1/external/courier/serviceability/`,
//             {
//                 params: {
//                     pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE,
//                     delivery_postcode: delivery_pincode,
//                     weight: weight,
//                     cod: 0,
//                 },
//                 headers: {
//                     Authorization: `Bearer ${cachedToken}`,
//                 },
//             }
//         );

//         const availableCouriers = response.data.data.available_courier_companies;

//         if (!availableCouriers || availableCouriers.length === 0) {
//             return null;
//         }

//         const cheapestCourier = availableCouriers.reduce((prev: any, curr: any) =>
//             Number(prev.rate) < Number(curr.rate) ? prev : curr
//         );

//         return {
//             rate: Number(cheapestCourier.rate),
//             etd: cheapestCourier.etd,
//             courier_name: cheapestCourier.courier_name
//         };
//     } catch (error: any) {
//         // ടോക്കൺ എക്സ്പയർ ആയതാണെങ്കിൽ (401) ടോക്കൺ റീസെറ്റ് ചെയ്ത് വീണ്ടും ട്രൈ ചെയ്യുക
//         if (error.response?.status === 401) {
//             cachedToken = null;
//             return getShippingRate(delivery_pincode, weight);
//         }
//         console.error('Shipping Fetch Error:', error.message);
//         return null;
//     }
// };

// /**
//  * @desc    Check Serviceability & Get Shipping Rates (Route-ന് വേണ്ടി)
//  * @route   POST /api/shipping/check
//  */
// export const checkServiceability = async (req: Request, res: Response): Promise<void> => {
//     const { delivery_pincode, weight } = req.body;
//     const result = await getShippingRate(delivery_pincode, weight);

//     if (!result) {
//         res.status(404).json({ message: 'No shipping service available for this pincode' });
//         return;
//     }

//     res.json({ success: true, ...result });
// };


import { Request, Response } from 'express';
import axios from 'axios';

interface ShippingRateResponse {
    rate: number;
    etd: string;
    courier_name: string;
}

/**
 * 1. DTDC (SHIPSY) BOOKING API
 * അഡ്മിൻ 'Shipped' സ്റ്റാറ്റസ് മാറ്റുമ്പോൾ ഈ ഫംഗ്ഷൻ ബാക്കെൻഡ് ഉള്ളിൽ നിന്ന് വിളിക്കും.
 */
export const bookDTDCOrder = async (order: any) => {
    if (process.env.USE_MOCK_SHIPPING === 'true') {
        console.log("🚀 [MOCK MODE] Simulating DTDC Booking for Order:", order._id);
        return {
            success: true,
            reference_number: "MOCK-DTDC-" + Math.floor(Math.random() * 1000000),
            courier_partner: "DTDC Mock"
        };
    }

    try {
        const payload = {
            "action_type": "single_pickup",
            "consignment_type": "forward",
            "movement_type": "forward",
            "load_type": "NON-DOCUMENT",
            "description": "Apparel and Accessories",
            "customer_code": process.env.DTDC_CUST_CODE,
            "reference_number": order._id.toString(),
            "service_type_id": process.env.DTDC_SERVICE_TYPE || "B2C PRIORITY",
            "dimension_unit": "cm",
            "length": "10", "width": "10", "height": "10",
            "weight_unit": "kg",
            "weight": (order.totalWeight || 0.5),
            "declared_value": order.totalPrice,
            "num_pieces": 1,
            "origin_details": {
                "name": process.env.ORIGIN_NAME,
                "phone": process.env.ORIGIN_PHONE,
                "pincode": process.env.ORIGIN_PINCODE,
                "address_line_1": process.env.ORIGIN_ADDRESS,
                "city": process.env.ORIGIN_CITY,
                "state": process.env.ORIGIN_STATE,
                "country": "India"
            },
            "destination_details": {
                "name": order.shippingAddress.firstName + " " + order.shippingAddress.lastName,
                "phone": order.shippingAddress.phone,
                "pincode": order.shippingAddress.postalCode,
                "address_line_1": order.shippingAddress.address,
                "city": order.shippingAddress.city,
                "state": order.shippingAddress.state,
                "country": "India"
            },
            "pieces_detail": [{
                "description": "Package",
                "declared_value": order.totalPrice,
                "weight": (order.totalWeight || 0.5),
                "height": "10", "length": "10", "width": "10",
                "weight_unit": "kg", "dimension_unit": "cm"
            }]
        };

        const response = await axios.post(
            'https://app.shipsy.in/api/customer/integration/consignment/upload/softdata/v2',
            payload,
            { headers: { 'api-key': process.env.DTDC_API_KEY, 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error: any) {
        console.error('DTDC Booking Error:', error.response?.data || error.message);
        return null;
    }
};

/**
 * 2. SHIPPING RATE CHECK
 * ചെക്കൗട്ട് പേജിൽ റേറ്റ് കാണിക്കാൻ.
 */
export const getShippingRate = async (delivery_pincode: string, weight: number = 0.5): Promise<ShippingRateResponse | null> => {
    if (process.env.USE_MOCK_SHIPPING === 'true') {
        return { rate: 65, etd: "3-5 Days", courier_name: "DTDC Mock Express" };
    }

    try {
        const response = await axios.get(
            `https://app.dtdc.in/eCommerce/service/rest/serviceability/pincode/${delivery_pincode}`,
            { headers: { 'x-access-token': process.env.DTDC_API_KEY } }
        );

        if (response.data.status !== 'SUCCESS') return null;

        const baseRate = 60;
        const calculatedRate = baseRate + (Math.ceil(weight / 0.5) * 15);

        return {
            rate: calculatedRate,
            etd: response.data.expected_delivery_date || "4 Days",
            courier_name: "DTDC Express"
        };
    } catch (error) {
        return null;
    }
};

/**
 * @route   POST /api/shipping/check
 */
export const checkServiceability = async (req: Request, res: Response) => {
    const { delivery_pincode, weight } = req.body;
    const result = await getShippingRate(delivery_pincode, weight);
    if (!result) return res.status(404).json({ message: 'Service not available' });
    res.json({ success: true, ...result });
};

/**
 * 3. GET INTERNAL STATUS (For Scheduler)
 * ഷെഡ്യൂളർക്ക് വേണ്ടി മാത്രം സ്റ്റാറ്റസ് സ്ട്രിംഗ് റിട്ടേൺ ചെയ്യുന്നു.
 */
export const getDTDCStatus = async (referenceNumber: string) => {
    if (process.env.USE_MOCK_SHIPPING === 'true') return "DELIVERED"; // ടെസ്റ്റിംഗിന് വേണ്ടി

    try {
        const response = await axios.get(
            `https://app.shipsy.in/api/customer/integration/consignment/track?reference_number=${referenceNumber}`,
            { headers: { 'api-key': process.env.DTDC_API_KEY } }
        );
        if (response.data && response.data.success) {
            return response.data.data[0].last_status_type; 
        }
        return null;
    } catch (error) {
        return null;
    }
};

/**
 * 4. GET LIVE TRACKING HISTORY (For Users)
 * യൂസർക്ക് ഓരോ സ്ഥലത്തെയും അപ്‌ഡേറ്റുകൾ കാണാൻ.
 * @route   GET /api/shipping/track/:trackingId
 */
export const getLiveTrackingHistory = async (req: Request, res: Response) => {
    const { trackingId } = req.params;

    if (process.env.USE_MOCK_SHIPPING === 'true') {
        return res.json({
            success: true,
            trackingData: [
                { status: "Picked up", location: "Warehouse", time: "2024-06-01 10:00" },
                { status: "In Transit", location: "Sorting Hub", time: "2024-06-02 14:00" },
                { status: "Out for delivery", location: "Kochi", time: "2024-06-03 09:00" },
                { status: "Delivered", location: "Customer", time: "2024-06-03 11:30" }
            ]
        });
    }

    try {
        const response = await axios.get(
            `https://app.shipsy.in/api/customer/integration/consignment/track?reference_number=${trackingId}`,
            { headers: { 'api-key': process.env.DTDC_API_KEY } }
        );

        if (response.data && response.data.success) {
            return res.json({
                success: true,
                trackingData: response.data.data[0].scans // മുഴുവൻ ഹിസ്റ്ററിയും അയക്കുന്നു
            });
        }
        res.status(404).json({ message: 'Tracking details not found' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tracking info' });
    }
};