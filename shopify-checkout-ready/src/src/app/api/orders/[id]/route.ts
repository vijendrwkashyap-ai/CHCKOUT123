import { NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const order = await getOrder(id);
        if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status } = await req.json();
        const order = await updateOrderStatus(id, status);
        if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
