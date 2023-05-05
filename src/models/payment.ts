import { DateTime } from "luxon";
import { v4 } from 'uuid';

export class Payment {
  PK: string;
  SK: string;
  propertyId: string;
  tenantId: string
  amount: number;
  paidOn: number;
  expiresOn: number;
  readonly Type: string = Payment.name;

  constructor(paymentData: Pick<Payment, 'tenantId' | 'propertyId' | 'amount'>) {
    const { year, month} = DateTime.now();

    this.tenantId = paymentData.tenantId;
    this.propertyId = paymentData.propertyId;
    this.amount = paymentData.amount;
    this.paidOn = DateTime.utc(year, month).toUnixInteger();
    this.expiresOn = DateTime.utc(year, month).plus({ year: 1}).minus({month: 1}).toUnixInteger();

    const {PK, SK} = Payment.BuildKeys(paymentData.tenantId);
    this.PK = PK;
    this.SK = SK;
  }

  static BuildKeys(tenantId: string) {
    return {
      PK: `tenant#id=${tenantId}`,
      SK: `payment#id=${ v4() }`
    }
  }
}
