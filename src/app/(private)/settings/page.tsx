import { Metadata } from "next";
import AccountSettings from "@/components/profile/account-settings";

export const metadata: Metadata = {
  title: "Settings | Ostracon",
  description: "Manage your account settings",
};

export default function Settings() {
  return <AccountSettings />;
}
