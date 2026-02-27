import fs from 'fs/promises';
import path from 'path';

export interface Order {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    status: 'PENDING' | 'SUCCESS' | 'REJECTED';
    createdAt: number;
    shopifyOrderId?: string;
}

export interface Settings {
    upiId: string;
    merchantName: string;
    shopifyDomain: string;
    shopifyAccessToken: string;
}

interface Database {
    orders: Order[];
    settings: Settings;
}

const dbPath = path.join(process.cwd(), 'orders.json');

async function getDb(): Promise<Database> {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            const initialDb: Database = {
                orders: [],
                settings: {
                    upiId: "merchant@upi",
                    merchantName: "YourBrand",
                    shopifyDomain: "",
                    shopifyAccessToken: ""
                }
            };
            await fs.writeFile(dbPath, JSON.stringify(initialDb, null, 2));
            return initialDb;
        }
        throw error;
    }
}

async function saveDb(data: Database) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

// ---- ORDERS ----

export async function getOrders() {
    const db = await getDb();
    return db.orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getOrder(id: string) {
    const db = await getDb();
    return db.orders.find(o => o.id === id);
}

export async function generateUniqueDiscount(): Promise<number> {
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all discounts used today
    const usedDiscounts = new Set(
        db.orders
            .filter(o => o.createdAt >= today.getTime())
            .map(o => o.discountAmount)
    );

    let newDiscount = 0;
    let isUnique = false;

    // Keep generating until we find a unique discount for today
    while (!isUnique) {
        newDiscount = parseFloat((Math.random() * (9.99 - 1.00) + 1.00).toFixed(2));
        if (!usedDiscounts.has(newDiscount)) {
            isUnique = true;
        }
    }

    return newDiscount;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) {
    const db = await getDb();
    const newOrder: Order = {
        ...orderData,
        id: Math.random().toString(36).substring(2, 10),
        status: 'PENDING',
        createdAt: Date.now(),
    };
    db.orders.push(newOrder);
    await saveDb(db);
    return newOrder;
}

export async function updateOrderStatus(id: string, status: 'SUCCESS' | 'REJECTED') {
    const db = await getDb();
    const orderIndex = db.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) return null;
    db.orders[orderIndex].status = status;
    await saveDb(db);
    return db.orders[orderIndex];
}

// ---- SETTINGS ----

export async function getSettings(): Promise<Settings> {
    const db = await getDb();
    return db.settings || {
        upiId: "merchant@upi",
        merchantName: "YourBrand",
        shopifyDomain: "",
        shopifyAccessToken: ""
    };
}

export async function updateSettings(newSettings: Partial<Settings>) {
    const db = await getDb();
    db.settings = { ...db.settings, ...newSettings };
    await saveDb(db);
    return db.settings;
}
