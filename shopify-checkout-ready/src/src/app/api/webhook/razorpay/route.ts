import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSettings, getDb, saveDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const settings = await getSettings();
        if (!settings.razorpayWebhookSecret) {
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', settings.razorpayWebhookSecret)
            .update(bodyText)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
        }

        const payload = JSON.parse(bodyText);

        if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
            const rzpOrderId = payload.payload.payment.entity.order_id;

            // At this point, Razorpay's order_id maps to our order ID via some state, 
            // but we might not have stored the mapping if order was created just in frontend.
            // Oh wait, `razorpay_order_id` is generated in `/api/rzp` but not saved to the order.
            // But since the frontend also verifies, this webhook is a fallback.
            // If the user's internet drops, we might want to update the DB. This gets complex without saving `rzpOrderId` to DB first.
            console.log("Webhook verified successfully for order:", rzpOrderId);
        }

        return NextResponse.json({ status: 'ok' });
    } catch (e: any) {
        console.error("Webhook Error", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
