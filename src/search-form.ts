import { renderBlock } from './lib.js';
import { DataHelper } from './helpers.js';
import { showSearchResult } from './search-results.js';
import { SearchFilter } from './store/domain/search-filter.js';
import { flatRentSdkProvider, homyProvider } from './index.js';
import { Place } from './store/domain/place.js';

export let allData: Place[] = null;

export function renderSearchFormBlock(
  checkInDate?: Date,
  checkOutDate?: Date
) {
  const today = new Date();
  const lastDayOfNextMonth = DataHelper.getLastDayOfNextMonth(today);
  const checkInDefaultDate = DataHelper.addDays(today, 1);
  const checkOutDefautDate = checkInDate ?
    DataHelper.addDays(checkInDate, 2) :
    DataHelper.addDays(checkInDefaultDate, 2);

  const minDateValue = DataHelper.toLocalISOString(today).split('T')[0];
  const maxDateValue = DataHelper.toLocalISOString(lastDayOfNextMonth).split('T')[0];
  const checkInDateValue = checkInDate && checkInDate < lastDayOfNextMonth ?
    DataHelper.toLocalISOString(checkInDate).split('T')[0] :
    DataHelper.toLocalISOString(checkInDefaultDate).split('T')[0];
  const checkOutDateValue = checkOutDate && checkOutDate < lastDayOfNextMonth ?
    DataHelper.toLocalISOString(checkOutDate).split('T')[0] :
    DataHelper.toLocalISOString(checkOutDefautDate).split('T')[0];

  renderBlock(
    'search-form-block',
    `
    <form>
      <fieldset class="search-filedset">
        <div class="row">
          <div>
            <label for="city">Город</label>
            <input id="city" type="text" disabled value="Санкт-Петербург" />
            <input type="hidden" disabled value="59.9386,30.3141" />
          </div>
          <!--<div class="providers">
            <label><input type="checkbox" name="provider" value="homy" checked /> Homy</label>
            <label><input type="checkbox" name="provider" value="flat-rent" checked /> FlatRent</label>
          </div>--!>
        </div>
        <div class="row">
          <div>
            <label for="check-in-date">Дата заезда</label>
            <input id="check-in-date" type="date" value="${checkInDateValue}" min="${minDateValue}" max="${maxDateValue}" name="checkin" />
          </div>
          <div>
            <label for="check-out-date">Дата выезда</label>
            <input id="check-out-date" type="date" value="${checkOutDateValue}" min="${minDateValue}" max="${maxDateValue}" name="checkout" />
          </div>
          <div>
            <label for="max-price">Макс. цена суток</label>
            <input id="max-price" type="text" value="" name="price" class="max-price" />
          </div>
          <div>
            <div><button>Найти</button></div>
          </div>
        </div>
      </fieldset>
    </form>
    `
  );
}

export async function handleSubmit(e: Event) {
  e.preventDefault();

  const city = (<HTMLInputElement>document.getElementById('city')).value;
  const checkInDate = new Date(
    (<HTMLInputElement>document.getElementById('check-in-date')).value
  );
  const checkOutDate = new Date(
    (<HTMLInputElement>document.getElementById('check-out-date')).value
  );
  const price = Number(
    (<HTMLInputElement>document.getElementById('max-price')).value
  );

  const sendData: SearchFilter = {
    city,
    checkInDate,
    checkOutDate,
    maxPrice: price,
  }
  const params: SearchFilter = {
    city,
    checkInDate,
    checkOutDate,
    priceLimit: price
  }
  const homyData = await homyProvider.search(sendData);
  const sdkData = await flatRentSdkProvider.search(params);
  allData = [].concat(homyData, sdkData);

  showSearchResult();
}
