import {v4} from "uuid";

export enum TenantStatus {
  Active = "Active",
  NotActive = "Not Active"
}

export class Tenant {
  id: string;
  PK: string;
  SK: string;
  name: string;
  phone: string;
  status = TenantStatus.NotActive;
  readonly Type: string = Tenant.name;

  constructor(data: Pick<Tenant, 'phone' | 'name'>){
    this.id = v4();
    this.name = data.name;
    this.phone = data.phone;
    const { PK, SK} = Tenant.BuildKeys(this.id);
    this.PK = PK;
    this.SK = SK;
  }

  static BuildKeys(id: string) {
    return {
      PK: `tenant#id=${id}`,
      SK: `profile#id=${id}`
    }
  }
}