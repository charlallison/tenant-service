import {v4} from "uuid";

export class Property {
  id: string;
  pk: string;
  sk: string
  city: string;
  state: string;
  address: string;
  cost: number;
  rooms: number;
  status: string = `Available`;
  readonly Type = Property.name;

  constructor(data: Pick<Property, 'city' | 'address' | 'cost' | 'rooms' | 'state'>) {
    this.id = v4();
    this.city = data.city;
    this.address = data.address;
    this.cost = data.cost;
    this.rooms = data.rooms;
    this.state = data.state;

    const { pk, sk } = Property.BuildKeys(this.id);
    this.pk = pk;
    this.sk = sk;
  }

  static BuildKeys(id: string) {
    return {
      pk: `property#${id}`,
      sk: `property#${id}`
    }
  }
}