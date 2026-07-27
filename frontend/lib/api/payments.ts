import { apiRequest } from "./axios-instance";

export interface EsewaPaymentFields { amount: string; tax_amount: string; total_amount: string; transaction_uuid: string; product_code: string; product_service_charge: string; product_delivery_charge: string; success_url: string; failure_url: string; signed_field_names: string; signature: string; }
export interface AddressPayload { fullName: string; phone: string; line1: string; line2?: string; city: string; district: string; isDefault?: boolean; }

export async function createAddress(payload: AddressPayload) { return apiRequest<{ data: { _id: string } }>("/addresses", { method: "POST", body: JSON.stringify(payload) }); }
export async function syncCartToServer(items: Array<{ productId: string; quantity: number }>) {
  for (const item of items) await apiRequest("/cart/items", { method: "PUT", body: JSON.stringify(item) });
}
export async function initiateEsewaPayment(input: { addressId: string; couponCode?: string }) {
  return apiRequest<{ success: true; data: { paymentUrl: string; paymentFields: EsewaPaymentFields; reused: boolean } }>("/payments/esewa/initiate", { method: "POST", body: JSON.stringify(input) });
}
export function submitEsewaForm(paymentUrl: string, fields: EsewaPaymentFields): void {
  const form = document.createElement("form"); form.method = "POST"; form.action = paymentUrl;
  for (const [name, value] of Object.entries(fields)) { const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; form.appendChild(input); }
  document.body.appendChild(form); form.submit();
}
