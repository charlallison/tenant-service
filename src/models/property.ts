import {v4} from "uuid";

export enum PropertyStatus {
  Available  = "Available",
  NotAvailable = "Not Available"
}

export class Property {
  readonly id: string;
  readonly PK: string;
  readonly SK: string
  readonly city: string;
  readonly state: string;
  readonly address: string;
  readonly cost: number;
  readonly rooms: number;
  status: PropertyStatus = PropertyStatus.Available;
  readonly Type = Property.name;
  readonly GSI1PK: string;

  constructor(data: Pick<Property, 'city' | 'address' | 'cost' | 'rooms' | 'state'>) {
    this.id = v4();
    this.city = data.city;
    this.address = data.address;
    this.cost = data.cost;
    this.rooms = data.rooms;
    this.state = data.state;

    const { PK, SK } = Property.BuildPK(this.id);
    this.PK = PK;
    this.SK = SK;

    const { GSI1PK } = Property.BuildGSIKey();
    this.GSI1PK = GSI1PK;
  }

  static BuildPK(id: string) {
    return {
      PK: `property#id=${id}`,
      SK: `property#id=${id}`
    }
  }

  static BuildGSIKey() {
    return {
      GSI1PK: `type#${Property.name}`
    }
  }
}