import { DateTime } from "luxon";
import { v4 } from 'uuid';

export class Payment {
  readonly PK: string;
  readonly SK: string;
  readonly GSI1PK: string;
  readonly propertyId: string;
  readonly tenantId: string
  readonly amount: number;
  readonly paidOn: number;
  readonly expiresOn: number;
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

    const { GSI1PK } = Payment.BuildGSIKeys(this.tenantId);
    this.GSI1PK = GSI1PK;
  }

  static BuildKeys(tenantId: string) {
    return {
      PK: `tenant#id=${tenantId}`,
      SK: `payment#id=${ v4() }`
    }
  }

  static BuildGSIKeys(tenantId: string) {
    return {
      GSI1PK: `tenant#id=${tenantId}`
    }
  }

}
