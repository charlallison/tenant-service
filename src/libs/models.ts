type Rent = {
  propertyId: string,
  amountPaid: number,
  paidOn: number,
  expiresOn: number
}

type DateParams = {
  paidOn: number,
  expiresOn: number,
  notifyOn: number
}

export { Rent, DateParams }