import { redirect } from "next/navigation";

/** Recipe opens in the home modal when the URL contains `?waffling=butter-chicken`. */
export default function ButterChickenPage() {
    redirect("/?waffling=butter-chicken");
}
