export interface Place {
  id: number,
  name: string,
  description: string,
  image: string,
  remoteness: number,
  bookedDates: number[],
  price: number
}
