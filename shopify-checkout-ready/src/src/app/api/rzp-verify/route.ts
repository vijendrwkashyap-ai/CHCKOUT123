import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSettings, getDb, saveDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

        const settings = await getSettings();
        if (!settings.razorpayKeySecret) {
            return NextResponse.json({ error: 'Missing rzp secret' }, { status: 400 });
        }

        const hmac = crypto.createHmac('sha256', settings.razorpayKeySecret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // It's verified! Update our DB
        const db = await getDb();
        const orderIndex = db.orders.findIndex((o: any) => o.id === orderId);

        if (orderIndex !== -1) {
            db.orders[orderIndex].status = 'SUCCESS';
            await saveDb(db);
        }

        return NextResponse.json({ success: true, message: 'Payment verified' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Verification Error' }, { status: 500 });
    }
}
