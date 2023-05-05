import {v4} from "uuid";

export enum PropertyStatus {
  Available  = "Available",
  NotAvailable = "Not Available"
}

export class Property {
  id: string;
  PK: string;
  SK: string
  city: string;
  state: string;
  address: string;
  cost: number;
  rooms: number;
  status: PropertyStatus = PropertyStatus.Available;
  readonly Type = Property.name;

  constructor(data: Pick<Property, 'city' | 'address' | 'cost' | 'rooms' | 'state'>) {
    this.id = v4();
    this.city = data.city;
    this.address = data.address;
    this.cost = data.cost;
    this.rooms = data.rooms;
    this.state = data.state;

    const { PK, SK } = Property.BuildKeys(this.id);
    this.PK = PK;
    this.SK = SK;
  }

  static BuildKeys(id: string) {
    return {
      PK: `property#id=${id}`,
      SK: `property#id=${id}`
    }
  }
}