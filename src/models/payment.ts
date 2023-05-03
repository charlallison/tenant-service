import {DateTime} from "luxon";

export class Payment {
  pk: string;
  sk: string;
  propertyId: string;
  amount: number;
  paidOn: number;
  expiresOn: number;
  readonly Type: string = Payment.name;

  constructor(tenantId: string, paymentData: Pick<Payment, 'propertyId' | 'amount'>) {
    const { year, month} = DateTime.now();

    this.propertyId = paymentData.propertyId;
    this.amount = paymentData.amount;
    this.paidOn = DateTime.utc(year, month).toUnixInteger();
    this.expiresOn = DateTime.utc(year, month).plus({ year: 1}).minus({month: 1}).toUnixInteger();

    const {pk, sk} = Payment.BuildKeys(tenantId, this.paidOn);
    this.pk = pk;
    this.sk = sk;
  }

  static BuildKeys(tenantId: string, date: number) {
    return {
      pk: `tenant#id=${tenantId}`,
      sk: `payment#date=${date}`
    }
  }
}
