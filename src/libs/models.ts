type Payment = {
  year: number,
  balance: number,
  amountPaid: number,
  paidOn: number,
  expiresOn: number
};

type Tenant = {
  id: string,
  name: string,
  phone: string,
  propertyCost: number,
  propertyType: string,
  payments: Payment[],
  notifyOn: number
};

export { Payment, Tenant }