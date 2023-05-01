import {v4} from "uuid";

export enum TenantStatus {
  Active = "Active",
  NotActive = "Not Active"
}

export class Tenant {
  id: string;
  pk: string;
  sk: string;
  name: string;
  email: string;
  phone: string;
  status = TenantStatus.NotActive;
  readonly Type: string = Tenant.name;

  constructor(data: Pick<Tenant, 'phone' | 'email' | 'name'>){
    this.id = v4();
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    const { pk, sk} = Tenant.BuildKeys(this.id);
    this.pk = pk;
    this.sk = sk;
  }

  static BuildKeys(id: string) {
    return {
      pk: `tenant#id=${id}`,
      sk: `profile#id=${id}`
    }
  }
}