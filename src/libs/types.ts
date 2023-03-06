export type Payment = {
  year: number,
  balance: number,
  amountPaid: number,
  paidOn: number,
  expiresOn: number
};

export type Tenant = {
  id: string,
  name: string,
  phone: string,
  propertyCost: number,
  propertyType: string,
  payments: Payment[],
  notifyOn: number
};