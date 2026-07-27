import { apiRequest } from "./axios-instance";

export interface AppNotification { _id: string; type: "payment" | "inventory" | "system"; title: string; message: string; isReadBy: string[]; createdAt: string; }
export const getNotifications = () => apiRequest<{ data: AppNotification[] }>("/notifications");
export const markNotificationsRead = () => apiRequest("/notifications/read", { method: "PATCH" });
