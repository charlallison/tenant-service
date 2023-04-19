import {v4} from "uuid";

export class Tenant {
  id: string;
  pk: string;
  sk: string;
  name: string;
  email: string;
  phone: string;
  notifyOn: number;
  isActive: boolean = true;
  readonly Type: string = Tenant.name;

  constructor(data: Pick<Tenant, 'phone' | 'email' | 'name'>){
    this.id = v4();
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    const { pk, sk} = Tenant.BuildKeys(this.id, this.email);
    this.pk = pk;
    this.sk = sk;
  }

  static BuildKeys(id: string, email: string) {
    return {
      pk: `tenant#${id}`,
      sk: `profile#${email}`
    }
  }
}