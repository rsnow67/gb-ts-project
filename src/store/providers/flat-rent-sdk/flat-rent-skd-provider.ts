import { MapHelper } from '../../../helpers.js';
import { flatRentSdk, userPosition } from '../../../index.js';
import { renderToast } from '../../../lib.js';
import { warningTimerId } from '../../../search-results.js';
import { BookParams } from '../../domain/book-params.js';
import { Place } from '../../domain/place.js';
import { Provider } from '../../domain/provider.js';
import { SearchFilter } from '../../domain/search-filter.js';
import { Flat } from './response.js';

export class FlatRentSdkProvider implements Provider {
  public static provider = 'flat-rent-sdk';
  public static apiUrl = 'http://localhost:3040';

  public async search(filter: SearchFilter): Promise<Place[] | null> {
    try {
      const result = await flatRentSdk.search(filter);

      if (result instanceof Error) {
        throw result;
      }

      return this.convertFlatListResponse(result);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private convertFlatListResponse(response: Flat[]): Place[] {
    return response.map((item) => {
      return this.convertPlaceResponse(item);
    })
  }

  private convertPlaceResponse(item: Flat): Place {
    return new Place(
      FlatRentSdkProvider.provider,
      String(item.id),
      item.title,
      item.details,
      item.photos[0],
      MapHelper.getDistanceFromLatLngInKm(
        userPosition,
        item.coordinates
      ),
      item.bookedDates,
      item.totalPrice
    )
  }

  public async book(params: BookParams): Promise<number | null> {
    const {
      placeId,
      checkInDate,
      checkOutDate
    } = params;

    try {
      const result = await flatRentSdk.book(placeId, checkInDate, checkOutDate);

      if (result instanceof Error) {
        throw result;
      }

      renderToast(
        { text: 'Отель успешно забронирован.', type: 'success' },
        { name: 'ОК!', handler: () => console.log(`Transaction ID: ${result}.`) }
      );
      clearTimeout(warningTimerId);

      return result;
    } catch (error) {
      renderToast(
        { text: 'Не получилось забронировать отель. Попробуйте позже.', type: 'error' },
        { name: 'Понял', handler: () => { console.error(error); } }
      );
      return null;
    }
  }
}
