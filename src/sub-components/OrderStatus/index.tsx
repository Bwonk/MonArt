import type { StatusInfo } from "../../utils/order-status";

interface Props {
  status: StatusInfo;
  className?: string;
}

/** Sipariş / paket durum çipi. */
export default function OrderStatus({ status, className }: Props) {
  if (!status.text) return null;
  return <span className={`ost ost--${status.tone}${className ? ` ${className}` : ""}`}>{status.text}</span>;
}
