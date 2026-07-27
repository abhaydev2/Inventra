import Link from "next/link";

export default function EsewaPaymentFailurePage() {
  return <main className="min-h-screen bg-slate-950 px-6 py-20 text-white"><div className="mx-auto max-w-lg rounded-3xl border border-red-500/25 bg-slate-900 p-8 text-center shadow-2xl"><p className="text-sm font-bold uppercase tracking-widest text-red-400">eSewa payment not completed</p><h1 className="mt-3 text-2xl font-extrabold">Your order is still pending</h1><p className="mt-3 text-sm leading-6 text-slate-300">No payment confirmation was recorded. You may return to checkout and try again; the server will validate the order again before creating a new payment.</p><Link href="/user/orders" className="mt-7 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold hover:bg-blue-500">Return to checkout</Link></div></main>;
}
