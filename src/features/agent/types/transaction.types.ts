export interface Transaction {
  id: string;
  customerName: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  date: string;
}