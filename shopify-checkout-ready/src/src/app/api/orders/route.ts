import { NextResponse } from 'next/server';
import { getOrders, createOrder, generateUniqueDiscount, getSettings } from '@/lib/db';

export async function GET() {
    try {
        const orders = await getOrders();
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const originalAmount = body.originalAmount || 500;

        // 1. Generate unique decimal discount for TODAY on Server side
        const uniqueDiscount = await generateUniqueDiscount();
        const finalAmount = parseFloat((originalAmount - uniqueDiscount).toFixed(2));

        // 2. We can automatically create a PENDING order on Shopify if credentials exist
        const settings = await getSettings();
        let shopifyOrderId = "";

        if (settings.shopifyDomain && settings.shopifyAccessToken) {
            try {
                const [firstName, ...lastNameParts] = (body.customerName || "").split(" ");
                const lastName = lastNameParts.join(" ");

                let rawPhone = (body.phone || "").trim();
                let cleanPhone = rawPhone.replace(/\D/g, ''); // Extract only digits

                // Strip leading zero if present for 10+ digit Indian numbers (e.g. 09711...)
                if (cleanPhone.startsWith("0") && cleanPhone.length > 10) {
                    cleanPhone = cleanPhone.substring(1);
                }

                let finalPhone = "";
                // Only send phone to Shopify if it has enough digits to be somewhat valid
                if (cleanPhone.length >= 7) {
                    finalPhone = cleanPhone.length === 10 ? "+91" + cleanPhone : "+" + cleanPhone;
                    if (!finalPhone.startsWith("+")) finalPhone = "+" + finalPhone; // Fallback
                }

                const shopifyPayload = {
                    order: {
                        line_items: [
                            {
                                title: "Custom Checkout Order",
                                price: originalAmount.toString(),
                                quantity: 1
                            }
                        ],
                        customer: {
                            first_name: firstName || "Customer",
                            last_name: lastName || "User",
                            email: body.email || "",
                            ...(finalPhone ? { phone: finalPhone } : {})
                        },
                        shipping_address: {
                            address1: body.address || "No Address Provided",
                            city: body.city || "Delhi",
                            province: body.state || "Delhi",
                            zip: body.pincode || "110001",
                            country: "India",
                            first_name: firstName || "Customer",
                            last_name: lastName || "User",
                            ...(finalPhone ? { phone: finalPhone } : {})
                        },
                        billing_address: {
                            address1: body.address || "No Address Provided",
                            city: body.city || "Delhi",
                            province: body.state || "Delhi",
                            zip: body.pincode || "110001",
                            country: "India",
                            first_name: firstName || "Customer",
                            last_name: lastName || "User",
                            ...(finalPhone ? { phone: finalPhone } : {})
                        },
                        discount_codes: [
                            {
                                code: "UPI Verification Code",
                                amount: uniqueDiscount.toString(),
                                type: "fixed_amount"
                            }
                        ],
                        financial_status: "pending",
                        tags: "UPI_Pending, Custom_Checkout",
                        note: "Waiting for EXACT UPI Payment: ₹" + finalAmount
                    }
                };

                const domainUrl = settings.shopifyDomain.includes('myshopify.com')
                    ? settings.shopifyDomain
                    : `${settings.shopifyDomain}.myshopify.com`;

                const response = await fetch(`https://${domainUrl}/admin/api/2024-01/orders.json`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': settings.shopifyAccessToken
                    },
                    body: JSON.stringify(shopifyPayload)
                });

                const data = await response.json();
                if (data && data.order) {
                    shopifyOrderId = data.order.id.toString();
                } else {
                    console.error("Shopify API Error:", data);
                    shopifyOrderId = "ERROR: " + JSON.stringify(data.errors || data);
                }
            } catch (shopifyErr: any) {
                console.error("Failed to push to Shopify:", shopifyErr);
                shopifyOrderId = "ERROR_CATCH: " + shopifyErr.message;
            }
        }

        // 3. Save to our database
        const orderData = {
            ...body,
            discountAmount: uniqueDiscount,
            finalAmount: finalAmount,
            shopifyOrderId: shopifyOrderId || "LOCAL_ORDER_" + Date.now()
        };

        const order = await createOrder(orderData);

        // Send back the dynamically generated amounts + settings (UPI URL)
        return NextResponse.json({
            ...order,
            upiId: settings.upiId,
            merchantName: settings.merchantName,
            razorpayEnabled: !!settings.razorpayKeyId
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
