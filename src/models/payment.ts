import {DateTime} from "luxon";

export class Payment {
  id: string;
  pk: string;
  sk: string;
  propertyId: string;
  amount: number;
  paidOn: number;
  expiresOn: number;
  readonly Type: string = Payment.name;

  constructor(tenantId: string, paymentData: Pick<Payment, 'propertyId' | 'amount'>) {
    const date = DateTime.now();

    // const paidOn: date.toUnixInteger();
    // const expiresOn: date.plus({ year: 1}).minus({month: 1}).toUnixInteger();
    // const notifyOn: date.plus({year: 1}).minus({month: 2}).toUnixInteger()

    this.propertyId = paymentData.propertyId;
    this.amount = paymentData.amount;
    this.paidOn = date.toUnixInteger();
    this.expiresOn = date.plus({ year: 1}).minus({month: 1}).toUnixInteger();
    // this.notifyOn = date.plus({year: 1}).minus({month: 2}).toUnixInteger();

    const {pk, sk} = Payment.formatKey(tenantId, this.paidOn);
    this.pk = pk;
    this.sk = sk;
  }

  static formatKey(tenantId: string, date: number) {
    return {
      pk: `tenant#id=${tenantId}`,
      sk: `payment#${date}`
    }
  }
}
