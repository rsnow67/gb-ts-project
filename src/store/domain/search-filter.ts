export interface SearchFilter {
  city: string,
  checkInDate: Date,
  checkOutDate: Date,
  maxPrice?: number,
  priceLimit?: number
}
