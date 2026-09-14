/**
 * Sipariş / paket / satır durumlarını dokuz gruba indirger; metin her zaman bizim TEXT prop'umuz
 * (ikas'ın `statusTranslation` çevirisi mağaza diline göre ham anahtar olarak gelebiliyor).
 */
import type { IkasOrder } from "@ikas/bp-storefront";
import type { AccountTexts } from "./account-texts";

export type StatusTone = "gold" | "success" | "error" | "dim";

type Bucket =
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "cancelRequested"
  | "refundProcess"
  | "refunded"
  | "rejected"
  | "problem";

const BUCKET: Record<string, Bucket> = {
  UNFULFILLED: "preparing",
  PLANNED: "preparing",
  WAITING_FOR_PACKAGING: "preparing",
  READY_FOR_SHIPMENT: "preparing",
  PARTIALLY_READY_FOR_SHIPMENT: "preparing",
  READY_FOR_PICK_UP: "preparing",
  CREATED: "preparing",
  DRAFT: "preparing",
  FULFILLED: "shipped",
  PARTIALLY_FULFILLED: "shipped",
  DELIVERED: "delivered",
  PARTIALLY_DELIVERED: "delivered",
  CANCELLED: "cancelled",
  PARTIALLY_CANCELLED: "cancelled",
  CANCEL_REQUESTED: "cancelRequested",
  REFUND_REQUESTED: "refundProcess",
  REFUND_REQUEST_ACCEPTED: "refundProcess",
  RETURN_IN_TRANSIT: "refundProcess",
  RETURN_PARCEL_WAITING: "refundProcess",
  RETURN_DELIVERED: "refundProcess",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "refunded",
  CANCEL_REJECTED: "rejected",
  REFUND_REJECTED: "rejected",
  RETURN_REJECTED: "rejected",
  UNABLE_TO_DELIVER: "problem",
  ERROR: "problem",
};

const TONE: Record<Bucket, StatusTone> = {
  preparing: "gold",
  shipped: "gold",
  delivered: "success",
  cancelled: "error",
  cancelRequested: "dim",
  refundProcess: "dim",
  refunded: "dim",
  rejected: "error",
  problem: "error",
};

const TEXT_KEY: Record<Bucket, keyof AccountTexts> = {
  preparing: "statusPreparing",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
  cancelRequested: "statusCancelRequested",
  refundProcess: "statusRefundProcess",
  refunded: "statusRefunded",
  rejected: "statusRejected",
  problem: "statusProblem",
};

export interface StatusInfo {
  text: string;
  tone: StatusTone;
}

/** Paket (`orderPackageFulfillStatus`), satır (`status`) ya da sipariş paket durumu için. */
export function statusInfo(status: string | null | undefined, t: AccountTexts): StatusInfo {
  const bucket = (status && BUCKET[status]) || "preparing";
  return { text: t[TEXT_KEY[bucket]], tone: TONE[bucket] };
}

/** Siparişin genel durumu: iptal/iade sipariş durumu önce, yoksa paket durumu. */
export function orderStatusInfo(order: IkasOrder, t: AccountTexts): StatusInfo {
  const orderLevel = ["CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED", "REFUND_REQUESTED", "REFUND_REJECTED"];
  return statusInfo(orderLevel.includes(order.status) ? order.status : order.orderPackageStatus, t);
}

/** ikas çeviri anahtarı mı ("payment_method.credit_card")? Çeviri yüklenmemişse anahtar döner. */
export function isTranslationKey(text: string): boolean {
  return /^[a-z0-9_]+(\.[a-z0-9_]+)+$/.test(text);
}

/** Siparişler yeniden eskiye; silinmişler atılır. */
export function sortOrders(orders: IkasOrder[]): IkasOrder[] {
  return orders
    .filter((o) => !o.deleted)
    .slice()
    .sort((a, b) => (b.orderedAt ?? b.createdAt) - (a.orderedAt ?? a.createdAt));
}
