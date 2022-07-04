import { DataHelper } from '../../../helpers.js';
import { renderToast } from '../../../lib.js';
import { warningTimerId } from '../../../search-form.js';
import { BookParams } from '../../domain/book-params.js';
import { Place } from '../../domain/place.js';
import { Provider } from '../../domain/provider.js';
import { SearchFilter } from '../../domain/search-filter.js';
import { HttpHelper } from '../../utils/http-helper.js';
import { HomyPlace } from './response.js';

export class HomyProvider implements Provider {
  public static provider = 'homy';

  public static apiUrl = 'http://localhost:3030';

  public async search(filter: SearchFilter): Promise<Place[]> {
    try {
      const url = HomyProvider.apiUrl + '/places?' + this.convertFilterToQueryString(filter);
      const result = await HttpHelper.fetchAsJson<HomyPlace[]>(url);
      this.assertIsValidResult(result);

      return this.convertPlaceListResponse(result);
    } catch (error) {
      console.error(error);
    }

  }

  private convertFilterToQueryString(filter: SearchFilter): string {
    return `checkInDate=${DataHelper.dateToUnixStamp(filter.checkInDate)}&` +
      `checkOutDate=${DataHelper.dateToUnixStamp(filter.checkOutDate)}&` +
      `coordinates=59.9386,30.3141&maxPrice=${filter.maxPrice}`
  }

  private assertIsValidResult(response: HomyPlace[]): void {
    if (!response.length) {
      throw new Error('Нет подходящих отелей из Homy API.');
    }
  }

  private convertPlaceListResponse(response: HomyPlace[]): Place[] {
    return response.map((item) => {
      return this.convertPlaceResponse(item)
    })
  }

  private convertPlaceResponse(item: HomyPlace): Place {
    return new Place(
      HomyProvider.provider,
      String(item.id),
      item.name,
      item.description,
      item.image,
      item.remoteness,
      item.bookedDates,
      item.price
    )
  }

  public async book(params: BookParams): Promise<number> {
    const {
      placeId,
      checkInDate,
      checkOutDate
    } = params;

    try {
      const url = HomyProvider.apiUrl + `/places/${placeId}?` +
        `checkInDate=${DataHelper.dateToUnixStamp(checkInDate)}&` +
        `checkOutDate=${DataHelper.dateToUnixStamp(checkOutDate)}&`;
      const result = await HttpHelper.fetchPatch<HomyPlace>(url);

      renderToast(
        { text: 'Отель успешно забронирован.', type: 'success' },
        { name: 'ОК!', handler: () => console.log(`Booked hotel's id: ${result.id}.`) }
      );
      clearTimeout(warningTimerId);

      return result.id;
    } catch (error) {
      renderToast(
        { text: 'Не получилось забронировать отель. Попробуйте позже.', type: 'error' },
        { name: 'Понял', handler: () => console.error(error) }
      );
    }
  }
}
