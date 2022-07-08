
export class Place {
  constructor(
    public readonly provider: string,
    public readonly originalId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly image: string,
    public readonly remoteness: number | null,
    public readonly bookedDates: number[],
    public readonly price: number,
  ) { }

  get id() {
    return this.provider + '-' + this.originalId;
  }
}
