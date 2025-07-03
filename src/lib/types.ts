export type Sale = {
  id: string;
  items: string;
  price: number;
  date: Date;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Other';
  status: 'Done' | 'Payment Pending';
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Other';
};

export type TailoringOrder = {
  id:string;
  date: Date;
  billNo: string;
  customer: string;
  phone: string;
  type: string; // Work Type
  totalCost: number;
  advance: number;
  balance: number;
  deliveryDate: Date;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Other';
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Completed' | 'Canceled' | 'Done – Payment Pending';
};

export type InHouseDesign = {
  id: string;
  name: string;
  imageUrl: string;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  sellingPrice: number;
  startDate: Date;
  endDate?: Date;
  status: 'Designing' | 'Stitching' | 'Finished' | 'Sold';
};
