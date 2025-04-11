import { Metadata } from "next";
import LockedPanel from "@/components/locked-panel";

export const metadata: Metadata = {
  title: "🔒 | Ostracon",
};

export default function LockedScreen() {
  return <LockedPanel />;
}
