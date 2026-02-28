import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSettings } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const settings = await getSettings();

        if (!settings.razorpayKeyId || !settings.razorpayKeySecret) {
            return NextResponse.json({ error: 'Razorpay credentials missing in admin panel' }, { status: 400 });
        }

        const body = await req.json();
        const { amount, receipt } = body;

        // amount is in INR, Razorpay expects paise
        const amountInPaise = Math.round(Number(amount) * 100);

        const instance = new Razorpay({
            key_id: settings.razorpayKeyId,
            key_secret: settings.razorpayKeySecret,
        });

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: receipt || `rcpt_${Date.now()}`
        };

        const order = await instance.orders.create(options);

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            keyId: settings.razorpayKeyId
        });
    } catch (error: any) {
        console.error("RZP Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to create razorpay order' }, { status: 500 });
    }
}
