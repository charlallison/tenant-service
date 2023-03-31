import {v4} from "uuid";

export class Property {
  id: string;
  pk: string;
  sk: string
  title: string;
  description: string;
  cost: number;
  rooms: number;
  status: string = `Available`;
  readonly Type = Property.name;

  static From(data: Partial<Property>): Property {
    const property = new Property();
    property.id = data.id ?? v4();

    property.title = data.title;
    property.description = data.description;
    property.cost = data.cost;
    property.rooms = data.rooms;

    property.keys();

    return property;
  }

  private constructor(){}

  private keys() {
    this.pk = `property#id=${this.id}`;
    this.sk = `property#title=${this.title}#rooms=${this.rooms}`;
  }
}