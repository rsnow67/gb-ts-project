export const database: Flat[];
export const backendPort: number;
export const localStorageKey: string;

export function cloneDate(date: Date): Date;
export function addDays(date: Date, days: number): Date;

export interface Flat {
  id: string,
  title: string,
  details: string,
  photos: string[],
  coordinates: number[],
  bookedDates: number[],
  price: number,

}

export interface SearchParameters {
  city: string,
  checkInDate: Date,
  checkOutdate: Date,
  priceLimit?: number,
}

export class FlatRentSdk {
  get(id: string): Promise<Flat | null>;

  search(parameters: SearchParameters): Flat[];

  book(flatId: number, checkInDate: Date, checkOutDate: Date): number;
}
