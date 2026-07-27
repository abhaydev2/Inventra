import Link from "next/link";

export default function EsewaPaymentSuccessPage() {
  return <main className="min-h-screen bg-slate-950 px-6 py-20 text-white"><div className="mx-auto max-w-lg rounded-3xl border border-green-500/25 bg-slate-900 p-8 text-center shadow-2xl"><p className="text-sm font-bold uppercase tracking-widest text-green-400">eSewa response received</p><h1 className="mt-3 text-2xl font-extrabold">Payment is being verified</h1><p className="mt-3 text-sm leading-6 text-slate-300">Do not place the order again. Your payment is not marked complete until the server verifies eSewa’s signed response and transaction status.</p><Link href="/user/orders" className="mt-7 inline-block rounded-xl bg-green-600 px-5 py-3 text-sm font-bold hover:bg-green-500">Return to my orders</Link></div></main>;
}
