import { Flat } from './flat-rent-sdk.js';

export interface Place {
  id: number,
  name: string,
  description: string,
  image: string,
  remoteness: number,
  bookedDates: number[],
  price: number
}

export interface searchResult {
  homyData: Place[],
  sdkData: Flat[]
}

export interface FavoritePlace {
  id: string,
  name: string,
  image: string
}
