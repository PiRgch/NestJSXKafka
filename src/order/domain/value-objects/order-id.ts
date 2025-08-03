import { v4 as uuidv4 } from 'uuid';

export class OrderId {
  private readonly _value: string;

  constructor(value?: string) {
    this._value = value || uuidv4();
  }

  get value(): string {
    return this._value;
  }

  equals(other: OrderId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static generate(): OrderId {
    return new OrderId();
  }

  static fromString(value: string): OrderId {
    if (!value || value.trim().length === 0) {
      throw new Error('OrderId cannot be empty');
    }
    return new OrderId(value);
  }
}
