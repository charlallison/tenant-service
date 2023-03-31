import {DateParams, Rent} from "@libs/models";
import {v4} from "uuid";

class Tenant {
  id: string;
  pk: string;
  sk: string;
  name: string;
  phone: string;
  rent: Rent[] = []
  notifyOn: number;
  readonly Type: string = Tenant.name;

  static From(data: Pick<Tenant, 'id' | 'name' | 'phone'> & Omit<Rent, 'expiresOn' | 'paidOn'>, dates?: Partial<DateParams>): Tenant {
    const tenant = new this();
    tenant.id = data.id ?? v4();
    tenant.name = data.name;
    tenant.phone = data.phone;

    tenant.buildKeys();
    if(dates) {
      tenant.rent.push({
        propertyId: data.propertyId,
        amountPaid: data.amountPaid,
        paidOn: dates.paidOn,
        expiresOn: dates.expiresOn
      })
      tenant.notifyOn = dates.notifyOn;
    }

    return tenant;
  }

  private constructor(){}

  private buildKeys() {
    this.pk = `tenant#id=${this.id}`;
    this.sk = `tenant#phone=${this.phone}#name=${this.name}`
  }
}

export { Tenant }
