import joi from "joi";

export interface TenantItem {
  name: string;
  phone?: string;
}

export type TenantData = TenantItem & { [key:string]: any }

const schema = joi
  .object({
    name: joi
      .string()
      .min(1)
      .max(50)
      .messages({
        'string.base': 'name must be of type string',
        'string.empty': 'name must contain a value',
        'any.required': 'name is required',
      })
  });

export default class Tenant {
  readonly name: string;
  readonly phone: string;

  constructor(data: TenantData) {
    this.name = data.name;
    this.phone = data.phone;
    this.validate();
  }

  validate() : void {
    schema.validate(this.toJSON())
  }

  toJSON() : TenantData {
    return {
      ...this
    }
  }
}