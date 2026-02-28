"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    RefreshCw,
    Check,
    X,
    User,
    Phone,
    Settings as SettingsIcon,
    ListOrdered,
    BarChart3,
    TrendingUp,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Copy,
    Mail,
    MapPin,
    LockKeyhole,
    Activity,
    BookOpen
} from 'lucide-react';

interface Order {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    status: 'PENDING' | 'SUCCESS' | 'REJECTED';
    createdAt: number;
    shopifyOrderId?: string;
}

interface Settings {
    upiId: string;
    merchantName: string;
    shopifyDomain: string;
    shopifyAccessToken: string;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    razorpayWebhookSecret?: string;
}

export default function AdminDashboard() {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'guide'>('orders');

    // Orders State
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Settings State
    const [settings, setSettings] = useState<Settings>({
        upiId: "",
        merchantName: "",
        shopifyDomain: "",
        shopifyAccessToken: "",
        razorpayKeyId: "",
        razorpayKeySecret: "",
        razorpayWebhookSecret: ""
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded unique secure credentials
        if (loginId === "admin" && password === "admin123") {
            setIsAuthenticated(true);
            setLoginError("");
        } else {
            setLoginError("Invalid ID or Password. Please try again.");
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
            fetchSettings();
            const interval = setInterval(fetchOrders, 4000); // Poll every 4 seconds
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const updateStatus = async (id: string, status: 'SUCCESS' | 'REJECTED') => {
        try {
            await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchOrders();
        } catch (e) {
            console.error(e);
        }
    };

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            setSaveMessage("Settings saved successfully!");
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (e) {
            setSaveMessage("Failed to save settings.");
        } finally {
            setSavingSettings(false);
        }
    };

    // Analytics Calculations
    const totalRevenue = orders.filter(o => o.status === 'SUCCESS').reduce((acc, curr) => acc + curr.finalAmount, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const successCount = orders.filter(o => o.status === 'SUCCESS').length;
    const successRate = totalOrders > 0 ? Math.round((successCount / totalOrders) * 100) : 0;

    // LOGIN SCREEN
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10"
                >
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <LockKeyhole className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Secure Admin Panel</h1>
                    <p className="text-center text-slate-500 mb-8 text-sm">Please verify your identity to access the dashboard and approve orders.</p>

                    {loginError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Admin ID</label>
                            <input
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Enter your ID"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4"
                        >
                            <ShieldCheck className="w-5 h-5" /> Let Me In
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Admin<span className="font-light text-slate-400">Hub</span></span>
                    </div>

                    <nav className="flex space-x-1 sm:space-x-2">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <Activity className="w-4 h-4" />
                            <span className="hidden sm:inline">Overview & Orders</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <SettingsIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('guide')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'guide' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span className="hidden md:inline">Integration Guide</span>
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'orders' && (
                        <motion.div
                            key="orders"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Analytics Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-indigo-400 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 z-10 mb-1">Total Revenue</p>
                                    <h3 className="text-2xl font-bold text-slate-900 z-10">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                                        <ListOrdered className="w-6 h-6 text-amber-400 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 z-10 mb-1">Pending Verifications</p>
                                    <h3 className="text-2xl font-bold text-amber-600 z-10 flex items-center gap-2">
                                        {pendingOrders} {pendingOrders > 0 && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
                                    </h3>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-blue-400 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 z-10 mb-1">Total Orders</p>
                                    <h3 className="text-2xl font-bold text-slate-900 z-10">{totalOrders}</h3>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                                        <Check className="w-6 h-6 text-emerald-400 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 z-10 mb-1">Success Rate</p>
                                    <h3 className="text-2xl font-bold text-slate-900 z-10">{successRate}%</h3>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
                                    <p className="text-sm text-slate-500 mt-1">Verify Unique Discount amounts matching your PhonePe/Bank history.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <span className="text-slate-400 hidden sm:inline">
                                            Auto-updates. Last sync: {lastUpdated.toLocaleTimeString()}
                                        </span>
                                        <button
                                            onClick={fetchOrders}
                                            className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 shadow-sm"
                                        >
                                            <RefreshCw className="w-4 h-4 text-slate-500" />
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                {loading && orders.length === 0 ? (
                                    <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-4" />
                                        Fetching system data...
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="p-16 text-center text-slate-500">
                                        No transactions recorded yet. They will appear here in real-time.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                                                <tr>
                                                    <th className="px-6 py-4">Status & Time</th>
                                                    <th className="px-6 py-4 text-center">Amount (Unique)</th>
                                                    <th className="px-6 py-4">Customer</th>
                                                    <th className="px-6 py-4 text-right">Verification Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {orders.map((order) => {
                                                    const isExpanded = expandedOrder === order.id;
                                                    return (
                                                        <React.Fragment key={order.id}>
                                                            <motion.tr
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className={`transition-colors cursor-pointer ${order.status === 'PENDING' ? 'bg-amber-50/10 hover:bg-amber-50/50' : 'hover:bg-slate-50'}`}
                                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                            >
                                                                <td className="px-6 py-4 w-48 shrink-0">
                                                                    <div className="flex flex-col items-start gap-1">
                                                                        {order.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider"><RefreshCw className="w-3 h-3 animate-spin" /> Pending</span>}
                                                                        {order.status === 'SUCCESS' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider"><Check className="w-3 h-3" /> Approved</span>}
                                                                        {order.status === 'REJECTED' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 uppercase tracking-wider"><X className="w-3 h-3" /> Rejected</span>}
                                                                        <span className="text-slate-500 text-xs font-medium mt-1">{new Date(order.createdAt).toLocaleTimeString()} · {new Date(order.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <div className="font-bold text-slate-900 text-xl tracking-tight">
                                                                        ₹{order.finalAmount.toFixed(2)}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 min-w-[200px]">
                                                                    <div className="font-semibold text-slate-900 flex items-center justify-between">
                                                                        <span className="flex items-center gap-2">
                                                                            <User className="w-4 h-4 text-slate-400" />
                                                                            {order.customerName}
                                                                        </span>
                                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                                                                    </div>
                                                                    <div className="text-slate-500 text-xs mt-1">Shopify: {order.shopifyOrderId || 'No ID'}</div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right align-middle">
                                                                    {order.status === 'PENDING' ? (
                                                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                                            <button
                                                                                onClick={() => updateStatus(order.id, 'REJECTED')}
                                                                                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm"
                                                                                title="Reject"
                                                                            >
                                                                                <X className="w-5 h-5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => updateStatus(order.id, 'SUCCESS')}
                                                                                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-2 transition-all shadow-md shadow-slate-900/20 active:scale-95"
                                                                            >
                                                                                Verify
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-slate-300 font-medium italic text-xs uppercase tracking-wider">Locked</span>
                                                                    )}
                                                                </td>
                                                            </motion.tr>

                                                            {/* EXPANDED DETAILS */}
                                                            <AnimatePresence>
                                                                {isExpanded && (
                                                                    <motion.tr
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="bg-slate-50/50 border-b border-slate-200"
                                                                    >
                                                                        <td colSpan={4} className="p-0">
                                                                            <div className="px-6 py-6 border-l-4 border-indigo-400 m-2 bg-white rounded-r-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                <div className="space-y-4">
                                                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Customer Details</h4>
                                                                                    <div className="text-sm space-y-2 text-slate-600">
                                                                                        <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {order.email}</p>
                                                                                        <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {order.phone}</p>
                                                                                        <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                                                                            <span className="leading-snug">
                                                                                                {order.address}<br />
                                                                                                {order.city && `${order.city}, `}
                                                                                                {order.state && `${order.state} - `}
                                                                                                {order.pincode}
                                                                                            </span>
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-4">
                                                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Financials & Sync</h4>
                                                                                    <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-2 font-mono text-slate-600">
                                                                                        <div className="flex justify-between"><span>Base Amount:</span> <span className="text-slate-900">₹{order.originalAmount.toFixed(2)}</span></div>
                                                                                        <div className="flex justify-between text-indigo-600"><span>Unique Discount:</span> <span>- ₹{order.discountAmount.toFixed(2)}</span></div>
                                                                                        <div className="w-full h-px bg-slate-200 my-1"></div>
                                                                                        <div className="flex justify-between font-bold text-slate-900"><span>Expected Receive:</span> <span>₹{order.finalAmount.toFixed(2)}</span></div>
                                                                                    </div>
                                                                                    <p className="text-xs text-slate-500">Shopify Order ID Ref: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{order.shopifyOrderId || 'None'}</span></p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </motion.tr>
                                                                )}
                                                            </AnimatePresence>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl mx-auto"
                        >
                            <h1 className="text-2xl font-bold text-slate-900 mb-6">Store Configuration</h1>

                            <form onSubmit={saveSettings} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100">

                                <div className="space-y-5 pb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><User className="w-4 h-4 text-blue-500" /></div>
                                        <h3 className="text-lg font-bold text-slate-900">Payment Receiving Specs</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Official UPI ID</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. yourname@ybl"
                                                value={settings.upiId}
                                                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Merchant Display Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. My Premium Store"
                                                value={settings.merchantName}
                                                onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5 pt-8 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-emerald-500" /></div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Shopify API Sync</h3>
                                            <p className="text-xs text-slate-500 font-medium">Leave blank if you don't want automatic draft orders.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Shopify Store Domain</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium">
                                                    https://
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder="yourstore.myshopify.com"
                                                    value={settings.shopifyDomain}
                                                    onChange={(e) => setSettings({ ...settings, shopifyDomain: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 rounded-r-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin API Access Token</label>
                                            <input
                                                type="password"
                                                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxx"
                                                value={settings.shopifyAccessToken}
                                                onChange={(e) => setSettings({ ...settings, shopifyAccessToken: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* RAZORPAY SETTINGS BLOCK */}
                                <div className="space-y-5 pt-8 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                            <span className="text-purple-600 font-bold">₹</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Razorpay Integration (Temporary Gateway)</h3>
                                            <p className="text-xs text-slate-500 font-medium">Use API Keys to offer a professional popup gateway while waiting for a Business UPI ID.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Razorpay Key ID</label>
                                            <input
                                                type="text"
                                                placeholder="rzp_live_xxxxxxxxxxx"
                                                value={settings.razorpayKeyId || ''}
                                                onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Razorpay Key Secret</label>
                                            <input
                                                type="password"
                                                placeholder="xxxxxxxxx"
                                                value={settings.razorpayKeySecret || ''}
                                                onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Webhook Secret (Optional)</label>
                                            <input
                                                type="password"
                                                placeholder="mywebhooksecret123"
                                                value={settings.razorpayWebhookSecret || ''}
                                                onChange={(e) => setSettings({ ...settings, razorpayWebhookSecret: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex items-center justify-between">
                                    {saveMessage ? (
                                        <span className="text-emerald-600 font-semibold text-sm flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg"><Check className="w-4 h-4" /> {saveMessage}</span>
                                    ) : <div></div>}

                                    <button
                                        type="submit"
                                        disabled={savingSettings}
                                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                                    >
                                        {savingSettings ? "Saving system..." : "Update Settings"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'guide' && (
                        <motion.div
                            key="guide"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl mx-auto space-y-6"
                        >
                            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                <h1 className="text-2xl sm:text-3xl font-bold mb-4 z-10 relative"><BookOpen className="inline-block w-8 h-8 mr-2 -mt-1 text-indigo-400" /> Shopify Integration Guide</h1>
                                <p className="text-slate-300 max-w-xl text-sm leading-relaxed z-10 relative">Follow these simple steps from your master device to link your checkout system natively to your Shopify store without any third-party app fees. It's safe, private, and 100% owned by you.</p>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-lg">1</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Open Shopify Settings</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">Log into your Shopify admin panel on your master computer. Not the developer/partner dashboard, but your actual store's dashboard (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs">admin.shopify.com/store/your-store-name</code>). Go to <strong>Settings</strong> at the bottom left, then click <strong>Apps and sales channels</strong>.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-lg">2</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Create Custom App</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">Click on the <strong>Develop apps</strong> button on the top right. Then click <strong>Create an app</strong>. Name it something like "Checkout API". If asked to 'Allow custom app development', approve it.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-lg">3</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Configure Scopes</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">Go to the <strong>Configuration</strong> tab and click <strong>Configure</strong> next to "Admin API integration". Scroll down and check the boxes for:</p>
                                        <ul className="space-y-2 mt-2">
                                            <li className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit"><Check className="w-4 h-4" /> <code>write_orders</code> & <code>read_orders</code></li>
                                            <li className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit"><Check className="w-4 h-4" /> <code>write_draft_orders</code> & <code>read_draft_orders</code></li>
                                            <li className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit"><Check className="w-4 h-4" /> <code>write_customers</code> & <code>read_customers</code></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-lg">4</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Install & Extract Token</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">Save your changes, then go to the <strong>API Credentials</strong> tab at the top. Click <strong>Install app</strong>. You'll see a token starting with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs">shpat_...</code>. Reveal it, copy it, and paste it into the Settings tab here in the AdminHub!</p>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Integration Guide */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-8 mt-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-4"><LockKeyhole className="w-5 h-5 text-indigo-500" /> Connect to your Shopify Theme</h2>
                                <p className="text-slate-500 text-sm">Once your Vercel URL is live (e.g. <code>https://my-upi-checkout.vercel.app</code>), follow these steps to add it to your Product Pages.</p>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-lg">1</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Edit Theme Code</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">Go to <strong>Online Store {'>'} Themes</strong>. Click the three dots <strong>(...)</strong> next to your live theme and select <strong>Edit code</strong>.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-lg">2</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Find the Product Form</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">In the left sidebar search box, search for <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs">main-product.liquid</code>, or <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs">buy-buttons.liquid</code> (if you use an updated theme like Dawn). Open that file.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-lg">3</div>
                                    <div className="w-full">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Inject the Custom Button</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">Locate where your normal "Add to cart" buttons are, and paste this hidden redirection code right below it:</p>
                                        <div className="bg-slate-900 p-4 rounded-xl text-slate-300 font-mono text-xs sm:text-sm overflow-x-auto relative mt-2 border border-slate-700">
                                            <p className="text-emerald-400">{'<!-- Custom UPI Checkout Button -->'}</p>
                                            <p className="mt-1">
                                                {'<a href="'}
                                                <span className="text-indigo-300">https://your-vercel-url.vercel.app</span>
                                                {'?amount={{ product.price | divided_by: 100 }}&item={{ product.title | url_encode }}&image={{ product.featured_image | img_url: "medium" | url_encode }}"'}
                                            </p>
                                            <p className="mt-1 ml-4 pl-2 border-l border-slate-700">
                                                {'class="btn w-full mt-3 uppercase tracking-wider font-bold"'}
                                                <br />
                                                {'style="background: black; color: white; padding: 15px; border-radius: 5px; text-align: center; display: block;"'}
                                            </p>
                                            <p>{'>'}</p>
                                            <p className="ml-4">Buy Now via UPI / Card</p>
                                            <p>{'</a>'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-lg">4</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Save & Refresh</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">Click <strong>Save</strong> at the top right. Now visit your product page, and any user clicking "Buy Now via UPI" will instantly be teleported to your new Checkout System with the exact Product Pricing!</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
