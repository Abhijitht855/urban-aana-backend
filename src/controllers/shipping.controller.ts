// import { Request, Response } from 'express';
// import axios from 'axios';

// interface ShippingRateResponse {
//     rate: number;
//     etd: string;
//     courier_name: string;
// }

// /**
//  * 1. DTDC (SHIPSY) BOOKING API
//  * Admin "Shipped" status set ചെയ്യുമ്പോൾ ഈ function call ആകും.
//  * API Playground Confirmed: POST https://app.shipsy.in/api/customer/integration/consignment/upload/softdata/v2
//  * Header: api-key: <DTDC_API_KEY>
//  * Success Response: { success: true, reference_number: "E12345678", courier_partner: "..." }
//  */
// export const bookDTDCOrder = async (order: any) => {
//     // Mock Mode
//     if (process.env.USE_MOCK_SHIPPING === 'true') {
//         console.log('🚀 [MOCK] Simulating DTDC Booking for Order:', order._id);
//         return {
//             success: true,
//             reference_number: 'MOCK-DTDC-' + Math.floor(Math.random() * 1000000),
//             courier_partner: 'DTDC Mock'
//         };
//     }

//     try {
//         const payload = {
//             action_type: 'single_pickup',
//             consignment_type: 'forward',
//             movement_type: 'forward',
//             load_type: 'NON-DOCUMENT',
//             description: 'Clothing Apparel - ' + (order.orderItems?.[0]?.name || 'Urban Aana'),
//             customer_code: process.env.DTDC_CUST_CODE,           // OO3964
//             reference_number: order._id.toString(),
//             service_type_id: process.env.DTDC_SERVICE_TYPE_ID,   // portal-ൽ നിന്ന് confirm ചെയ്യണം
//             dimension_unit: 'cm',
//             length: '20',
//             width: '15',
//             height: '5',
//             weight_unit: 'kg',
//             weight: String(order.totalWeight || 0.5),
//             declared_value: order.totalPrice,
//             num_pieces: 1,
//             origin_details: {
//                 name: process.env.ORIGIN_NAME,
//                 phone: process.env.ORIGIN_PHONE,
//                 pincode: process.env.ORIGIN_PINCODE,
//                 address_line_1: process.env.ORIGIN_ADDRESS,
//                 city: process.env.ORIGIN_CITY,
//                 state: process.env.ORIGIN_STATE,
//                 country: 'India'
//             },
//             destination_details: {
//                 name: order.shippingAddress.firstName + ' ' + order.shippingAddress.lastName,
//                 phone: order.shippingAddress.phone,
//                 pincode: order.shippingAddress.postalCode,
//                 address_line_1: order.shippingAddress.address,
//                 city: order.shippingAddress.city,
//                 state: order.shippingAddress.state || 'Kerala',
//                 country: 'India'
//             },
//             pieces_detail: [{
//                 description: 'Apparel',
//                 declared_value: String(order.totalPrice),
//                 weight: String(order.totalWeight || 0.5),
//                 height: '5',
//                 length: '20',
//                 width: '15',
//                 weight_unit: 'kg',
//                 dimension_unit: 'cm'
//             }]
//         };

//         console.log('📦 DTDC Booking Payload:', JSON.stringify(payload, null, 2));

//         const response = await axios.post(
//             'https://app.shipsy.in/api/customer/integration/consignment/upload/softdata/v2',
//             payload,
//             {
//                 headers: {
//                     'api-key': process.env.DTDC_API_KEY,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         console.log('✅ DTDC Booking Response:', JSON.stringify(response.data, null, 2));

//         /**
//          * API Playground Confirmed Response Structure:
//          * { success: true, reference_number: "E12345678", courier_partner: "..." }
//          * NOTE: response.data.reference_number — NO extra .data layer!
//          */
//         if (response.data?.success === true && response.data?.reference_number) {
//             return {
//                 success: true,
//                 reference_number: response.data.reference_number,
//                 courier_partner: response.data.courier_partner || 'DTDC Express'
//             };
//         }

//         // Shipsy success:false ആയി return ചെയ്തു
//         return {
//             success: false,
//             message: response.data?.message || response.data?.error?.message || 'DTDC booking failed — check portal logs'
//         };

//     } catch (error: any) {
//         const errMsg = error.response?.data?.error?.message
//             || error.response?.data?.message
//             || error.message
//             || 'Network error';

//         console.error('❌ DTDC Booking Error:', error.response?.data || error.message);

//         return {
//             success: false,
//             message: errMsg
//         };
//     }
// };

// /**
//  * 2. SHIPPING RATE CHECK (Serviceability)
//  * ഇപ്പോൾ mock mode-ൽ മാത്രം. Live serviceability endpoint Deepak confirm ചെയ്യട്ടെ.
//  * Portal-ൽ Information Centre → Pincode Serviceability UI ഉണ്ട്, but API endpoint unclear.
//  */
// export const getShippingRate = async (
//     delivery_pincode: string,
//     weight: number = 0.5
// ): Promise<ShippingRateResponse | null> => {
//     // Mock Mode
//     if (process.env.USE_MOCK_SHIPPING === 'true') {
//         return { rate: 65, etd: '3-5 Days', courier_name: 'DTDC Mock Express' };
//     }

//     try {
//         // Shipsy Serviceability endpoint (Deepak confirm ചെയ്താൽ uncomment ചെയ്യുക)
//         const response = await axios.get(
//             `https://app.shipsy.in/api/customer/integration/consignment/pincode/serviceability?pincode=${delivery_pincode}`,
//             {
//                 headers: {
//                     'api-key': process.env.DTDC_API_KEY || '',
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         console.log('📦 DTDC Serviceability Response:', response.data);

//         if (!response.data || response.data.success !== true) {
//             return null;
//         }

//         // Rate calculation (DTDC agreement rate)
//         const baseRate = Number(process.env.SHIPPING_BASE_RATE) || 60;
//         const perHalfKg = Number(process.env.SHIPPING_PER_500G) || 15;
//         const calculatedRate = baseRate + (Math.ceil(weight / 0.5) * perHalfKg);

//         return {
//             rate: calculatedRate,
//             etd: '3-5 Days',
//             courier_name: 'DTDC Express'
//         };
//     } catch (error: any) {
//         console.error('❌ DTDC Serviceability Error:', error.response?.data || error.message);
//         return null;
//     }
// };

// /**
//  * 3. DTDC TRACKING (Internal — Scheduler ഉപയോഗിക്കും)
//  * Confirmed by Deepak: POST https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails
//  * Header: x-access-token: OO3964_trk_json:...
//  */
// export const getDTDCStatus = async (referenceNumber: string): Promise<string | null> => {
//     if (process.env.USE_MOCK_SHIPPING === 'true') return 'DELIVERED';

//     try {
//         const response = await axios.post(
//             'https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails',
//             {
//                 trkType: 'cnno',
//                 strcnno: referenceNumber,
//                 addtnlDtl: 'Y'
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'x-access-token': process.env.DTDC_TRACKING_TOKEN
//                 }
//             }
//         );

//         if (response.data?.status === 'SUCCESS' && response.data?.trackDetails?.[0]) {
//             return response.data.trackDetails[0].status;
//         }
//         return null;
//     } catch (error) {
//         return null;
//     }
// };


// /**
//  * 4. SHIPPING LABEL (FIXED PDF RESPONSE)
//  */
// export const getShippingLabel = async (req: Request, res: Response) => {
//     const { referenceNumber } = req.params;

//     if (process.env.USE_MOCK_SHIPPING === 'true') {
//         // 🔥 Fix: ഒരു Minimal Valid PDF Buffer നൽകുന്നു
//         const minimalValidPdf = Buffer.from(
//             '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
//         );
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="mock-label.pdf"`);
//         return res.send(minimalValidPdf);
//     }

//     try {
//         const response = await axios.get(
//             'https://app.shipsy.in/api/customer/integration/consignment/shippinglabel/stream',
//             {
//                 params: { reference_number: referenceNumber },
//                 headers: { 'api-key': process.env.DTDC_API_KEY },
//                 responseType: 'stream'
//             }
//         );

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="dtdc-label-${referenceNumber}.pdf"`);
//         response.data.pipe(res);
//     } catch (error: any) {
//         res.status(500).json({ message: 'Failed to generate label' });
//     }
// };

// /**
//  * 4. LIVE TRACKING (Customer-facing route)
//  * Shipsy tracking also available: GET https://app.shipsy.in/api/customer/integration/consignment/track?reference_number=...
//  */
// export const getLiveTrackingHistory = async (req: Request, res: Response) => {
//     const { trackingId } = req.params;

//     if (process.env.USE_MOCK_SHIPPING === 'true') {
//         return res.json({
//             success: true,
//             trackingData: [
//                 { status: 'Booked', status_location: 'Warehouse', status_date: '2024-06-01' },
//                 { status: 'In Transit', status_location: 'Trivandrum Hub', status_date: '2024-06-02' },
//                 { status: 'Delivered', status_location: 'Destination', status_date: '2024-06-04' }
//             ]
//         });
//     }

//     try {
//         // Primary: DTDC Tracking API (Deepak confirmed)
//         const response = await axios.post(
//             'https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails',
//             {
//                 trkType: 'cnno',
//                 strcnno: trackingId,
//                 addtnlDtl: 'Y'
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'x-access-token': process.env.DTDC_TRACKING_TOKEN
//                 }
//             }
//         );

//         if (response.data?.status === 'SUCCESS') {
//             return res.json({
//                 success: true,
//                 currentStatus: response.data.trackDetails?.[0]?.status,
//                 trackingData: response.data.trackDetails
//             });
//         }

//         res.status(404).json({ message: 'Tracking details not found' });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch live tracking' });
//     }
// };

// /**
//  * 5. SERVICEABILITY CHECK (Route Handler)
//  */
// export const checkServiceability = async (req: Request, res: Response) => {
//     const { delivery_pincode, weight } = req.body;
//     const result = await getShippingRate(delivery_pincode, weight);
//     if (!result) return res.status(404).json({ message: 'DTDC service not available for this pincode' });
//     res.json({ success: true, ...result });
// };
import { Request, Response } from 'express';
import axios from 'axios';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface ShippingRateResponse {
    rate: number;
    etd: string;
    courier_name: string;
}

// ─────────────────────────────────────────────
// 1. DTDC BOOKING API
// Confirmed by Deepak (June 8):
// POST https://dtdcapi.shipsy.io/api/customer/integration/consignment/softdata
// Payload: { consignments: [ {...} ] }  ← array wrapper!
// reference_number: ""  ← DTDC auto-assign
// customer_reference_number: order._id  ← our order ID
// ─────────────────────────────────────────────
export const bookDTDCOrder = async (order: any) => {

    if (process.env.USE_MOCK_SHIPPING?.trim() === 'true') {
        console.log('🚀 [MOCK] Simulating DTDC Booking for Order:', order._id);
        return {
            success: true,
            reference_number: 'MOCK-DTDC-' + Math.floor(Math.random() * 1000000),
            courier_partner: 'DTDC Mock'
        };
    }

    try {
        const payload = {
            consignments: [
                {
                    customer_code: process.env.DTDC_CUST_CODE,
                    service_type_id: process.env.DTDC_SERVICE_TYPE_ID || 'B2C PRIORITY',
                    load_type: 'NON-DOCUMENT',
                    consignment_type: 'Forward',
                    description: 'Clothing Apparel - ' + (order.orderItems?.[0]?.name || 'Urban Aana'),
                    dimension_unit: 'cm',
                    length: '20',
                    width: '15',
                    height: '5',
                    weight_unit: 'kg',
                    weight: String(order.totalWeight || 0.5),
                    declared_value: String(order.totalPrice),
                    num_pieces: '1',
                    reference_number: '',
                    customer_reference_number: order._id.toString(),
                    cod_amount: '',
                    cod_collection_mode: '',
                    commodity_id: '17',
                    origin_details: {
                        name: process.env.ORIGIN_NAME,
                        phone: process.env.ORIGIN_PHONE,
                        alternate_phone: process.env.ORIGIN_PHONE,
                        address_line_1: process.env.ORIGIN_ADDRESS,
                        pincode: process.env.ORIGIN_PINCODE,
                        city: process.env.ORIGIN_CITY,
                        state: process.env.ORIGIN_STATE
                    },
                    destination_details: {
                        name: order.shippingAddress.firstName + ' ' + order.shippingAddress.lastName,
                        phone: order.shippingAddress.phone,
                        alternate_phone: order.shippingAddress.phone,
                        address_line_1: order.shippingAddress.address,
                        pincode: order.shippingAddress.postalCode,
                        city: order.shippingAddress.city,
                        state: order.shippingAddress.state || 'Kerala'
                    }
                }
            ]
        };

        console.log('📦 DTDC Booking Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            'https://dtdcapi.shipsy.io/api/customer/integration/consignment/softdata',
            payload,
            {
                headers: {
                    'api-key': process.env.DTDC_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ DTDC Booking Response:', JSON.stringify(response.data, null, 2));

        // Response: { status: "OK", data: [ { reference_number: "7X...", ... } ] }
        const consignment = Array.isArray(response.data?.data)
            ? response.data.data[0]
            : response.data?.consignments?.[0];

        const refNumber = consignment?.reference_number || consignment?.awb_number;

        if (response.data?.status === 'OK' && refNumber) {
            return {
                success: true,
                reference_number: refNumber,
                courier_partner: consignment?.courier_partner || 'DTDC Express'
            };
        }

        return {
            success: false,
            message: consignment?.message
                || response.data?.message
                || response.data?.error?.message
                || 'DTDC returned empty data'
        };

    } catch (error: any) {
        console.error('❌ DTDC Booking Error:', error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message
                || error.response?.data?.error?.message
                || error.message
                || 'Network error'
        };
    }
};

// ─────────────────────────────────────────────
// 2. SERVICEABILITY & RATE CHECK
// Confirmed by Deepak: POST https://smarttrack-ctbsplus.dtdc.com/ratecalapi/PincodeApiCall
// ─────────────────────────────────────────────
export const getShippingRate = async (
    delivery_pincode: string,
    weight: number = 0.5
): Promise<ShippingRateResponse | null> => {

    if (process.env.USE_MOCK_SHIPPING?.trim() === 'true') {
        return { rate: 65, etd: '3-5 Days', courier_name: 'DTDC Mock Express' };
    }

    try {
        const response = await axios.post(
            'https://smarttrack-ctbsplus.dtdc.com/ratecalapi/PincodeApiCall',
            {
                orgPincode: process.env.ORIGIN_PINCODE,
                desPincode: delivery_pincode
            },
            { headers: { 'Content-Type': 'text/plain' } }
        );

        console.log('📦 DTDC Serviceability Response:', JSON.stringify(response.data, null, 2));

        const zipResponse = response.data?.ZIPCODE_RESP?.[0];
        if (zipResponse?.MESSAGE !== 'SUCCESS' || zipResponse?.SERVFLAG !== 'Y') {
            return null;
        }

        const pinCityInfo = response.data?.PIN_CITY?.find((item: any) => item.PIN === delivery_pincode);
        const destState = pinCityInfo?.STATE_NAME?.toUpperCase() || '';
        const originState = (process.env.ORIGIN_STATE || 'KERALA').toUpperCase();

        const isLocal = destState === originState || destState === '';
        const baseRate = isLocal
            ? (Number(process.env.SHIPPING_BASE_RATE) || 60)
            : (Number(process.env.SHIPPING_BASE_RATE_NATIONAL) || 100);
        const perHalfKg = isLocal
            ? (Number(process.env.SHIPPING_PER_500G) || 15)
            : (Number(process.env.SHIPPING_PER_500G_NATIONAL) || 30);

        const calculatedRate = baseRate + (Math.ceil(weight / 0.5) * perHalfKg);

        return {
            rate: calculatedRate,
            etd: isLocal ? '2-3 Days' : '5-7 Days',
            courier_name: 'DTDC Express'
        };

    } catch (error: any) {
        console.error('❌ DTDC Serviceability Error:', error.message);
        return null;
    }
};

// ─────────────────────────────────────────────
// 3. SHIPPING LABEL DOWNLOAD
// Confirmed by Deepak: GET https://dtdcapi.shipsy.io/.../shippinglabel/stream
// ─────────────────────────────────────────────
export const getShippingLabel = async (req: Request, res: Response) => {
    const referenceNumber = String(req.params.referenceNumber);

    if (process.env.USE_MOCK_SHIPPING?.trim() === 'true') {
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([400, 320]);
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

            page.drawRectangle({ x: 10, y: 10, width: 380, height: 300, borderColor: rgb(0, 0, 0), borderWidth: 2 });
            page.drawRectangle({ x: 10, y: 260, width: 380, height: 50, color: rgb(0.08, 0.08, 0.45) });
            page.drawText('DTDC EXPRESS', { x: 105, y: 284, size: 20, font, color: rgb(1, 1, 1) });
            page.drawText('URBAN AANA', { x: 150, y: 265, size: 11, font: regular, color: rgb(0.85, 0.85, 0.85) });
            page.drawText('AWB NUMBER', { x: 20, y: 242, size: 9, font: regular, color: rgb(0.5, 0.5, 0.5) });
            page.drawText(referenceNumber, { x: 20, y: 222, size: 16, font });
            page.drawLine({ start: { x: 10, y: 212 }, end: { x: 390, y: 212 }, thickness: 1, color: rgb(0, 0, 0) });
            page.drawText('FROM:', { x: 20, y: 196, size: 9, font: regular, color: rgb(0.5, 0.5, 0.5) });
            page.drawText('Urban Aana, Trivandrum - 695581', { x: 20, y: 180, size: 10, font });
            page.drawLine({ start: { x: 10, y: 170 }, end: { x: 390, y: 170 }, thickness: 1, color: rgb(0, 0, 0) });
            page.drawText('TO:', { x: 20, y: 154, size: 9, font: regular, color: rgb(0.5, 0.5, 0.5) });
            page.drawText('Customer Name', { x: 20, y: 138, size: 12, font });
            page.drawText('Delivery Address, City - Pincode', { x: 20, y: 120, size: 10, font: regular });
            page.drawLine({ start: { x: 10, y: 110 }, end: { x: 390, y: 110 }, thickness: 1, color: rgb(0, 0, 0) });
            page.drawText('Service:', { x: 20, y: 92, size: 9, font: regular, color: rgb(0.5, 0.5, 0.5) });
            page.drawText('B2C PRIORITY', { x: 80, y: 92, size: 10, font });
            page.drawText('Weight:', { x: 200, y: 92, size: 9, font: regular, color: rgb(0.5, 0.5, 0.5) });
            page.drawText('0.5 kg', { x: 250, y: 92, size: 10, font });
            page.drawText('Date:', { x: 20, y: 72, size: 9, font: regular, color: rgb(0.5, 0.5, 0.5) });
            page.drawText(new Date().toLocaleDateString('en-IN'), { x: 80, y: 72, size: 10, font });
            page.drawText('[MOCK LABEL — FOR TESTING ONLY]', { x: 68, y: 25, size: 9, font: regular, color: rgb(0.75, 0.75, 0.75) });

            const pdfBytes = await pdfDoc.save();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="mock-label-${referenceNumber}.pdf"`);
            return res.send(Buffer.from(pdfBytes));
        } catch (err: any) {
            console.error('❌ Mock PDF error:', err.message);
            return res.status(500).json({ message: 'Mock label generation failed' });
        }
    }

    try {
        const response = await axios.get(
            'https://dtdcapi.shipsy.io/api/customer/integration/consignment/shippinglabel/stream',
            {
                params: {
                    reference_number: referenceNumber,
                    label_code: 'SHIP_LABEL_4X6',
                    label_format: 'pdf'
                },
                headers: { 'api-key': process.env.DTDC_API_KEY },
                responseType: 'stream'
            }
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="dtdc-label-${referenceNumber}.pdf"`);
        response.data.pipe(res);

        response.data.on('error', (err: any) => {
            console.error('❌ Label stream error:', err.message);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Label stream error' });
            }
        });

    } catch (error: any) {
        console.error('❌ Label Error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Failed to generate shipping label',
            error: error.response?.data?.message || error.message
        });
    }
};

// ─────────────────────────────────────────────
// 4. DTDC TRACKING STATUS (Scheduler use ചെയ്യും)
// ─────────────────────────────────────────────
export const getDTDCStatus = async (referenceNumber: string): Promise<string | null> => {
    if (process.env.USE_MOCK_SHIPPING?.trim() === 'true') return 'DELIVERED';

    try {
        const response = await axios.post(
            'https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails',
            { trkType: 'cnno', strcnno: referenceNumber, addtnlDtl: 'Y' },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': process.env.DTDC_TRACKING_TOKEN
                }
            }
        );

        if (response.data?.status === 'SUCCESS' && response.data?.trackDetails?.[0]) {
            return response.data.trackDetails[0].status;
        }
        return null;
    } catch (error) {
        return null;
    }
};

// ─────────────────────────────────────────────
// 5. LIVE TRACKING HISTORY (Customer-facing)
// ─────────────────────────────────────────────
export const getLiveTrackingHistory = async (req: Request, res: Response) => {
    const { trackingId } = req.params;

    if (process.env.USE_MOCK_SHIPPING?.trim() === 'true') {
        return res.json({
            success: true,
            trackingData: [
                { status: 'Booked', status_location: 'Urban Aana Warehouse', status_date: new Date().toISOString() },
                { status: 'In Transit', status_location: 'Trivandrum Hub', status_date: new Date().toISOString() },
                { status: 'Delivered', status_location: 'Destination', status_date: new Date().toISOString() }
            ]
        });
    }

    try {
        const response = await axios.post(
            'https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails',
            { trkType: 'cnno', strcnno: trackingId, addtnlDtl: 'Y' },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': process.env.DTDC_TRACKING_TOKEN
                }
            }
        );

        if (response.data?.status === 'SUCCESS') {
            return res.json({
                success: true,
                currentStatus: response.data.trackDetails?.[0]?.status,
                trackingData: response.data.trackDetails
            });
        }

        res.status(404).json({ message: 'Tracking details not found' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tracking' });
    }
};

// ─────────────────────────────────────────────
// 6. SERVICEABILITY ROUTE HANDLER
// ─────────────────────────────────────────────
export const checkServiceability = async (req: Request, res: Response) => {
    const { delivery_pincode, weight } = req.body;

    if (!delivery_pincode) {
        return res.status(400).json({ message: 'delivery_pincode is required' });
    }

    const result = await getShippingRate(delivery_pincode, weight || 0.5);

    if (!result) {
        return res.status(404).json({ message: 'DTDC service not available for this pincode' });
    }

    res.json({ success: true, ...result });
};