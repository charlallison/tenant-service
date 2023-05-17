import {v4} from "uuid";

export enum TenantStatus {
  Active = "Active",
  InActive = "Inactive"
}

export class Tenant {
  readonly id: string;
  readonly PK: string;
  readonly SK: string;
  readonly name: string;
  readonly phone: string;
  readonly status = TenantStatus.InActive;
  readonly Type: string = Tenant.name;

  readonly GSI1PK: string;
  readonly GSI2PK: string;

  constructor(data: Partial<Tenant>){
    this.id = data.id ?? v4();
    this.name = data.name;
    this.phone = data.phone;
    const { PK, SK} = Tenant.BuildPK(this.id);
    this.PK = PK;
    this.SK = SK;

    const { GSI1PK, GSI2PK } = Tenant.BuildGSIKeys({ id: this.id });
    this.GSI1PK = GSI1PK;
    this.GSI2PK = GSI2PK;
  }

  static BuildPK(id: string) {
    return {
      PK: `tenant#id=${id}`,
      SK: `profile#id=${id}`
    }
  }

  static BuildGSIKeys(prop?: {id: string}) {
    return {
      GSI1PK: `tenant#id=${prop?.id}`,
      GSI2PK: `type#${Tenant.name}`
    };
  }
}