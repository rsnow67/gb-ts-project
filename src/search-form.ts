import {
  renderBlock,
  renderToast
} from './lib.js';
import { DataHelper } from './helpers.js';
import { SearchFormData } from './search-form-data.js';
import { renderUserBlock } from './user.js';
import {
  bookPlace,
  makeFlatListContent,
  makePlaceListContent,
  renderEmptyOrErrorSearchBlock,
  renderSearchResultsBlock
} from './search-results.js';
import { sdk } from './index.js';
import { SearchParameters } from './flat-rent-sdk.js';
import { Place, FavoritePlace } from './place.js';

export let warningTimerId: ReturnType<typeof setTimeout> = null;

export function renderSearchFormBlock(
  checkInDate?: Date,
  checkOutDate?: Date
) {
  const today = new Date();
  const lastDayOfNextMonth = DataHelper.getLastDayOfNextMonth(today);
  const checkInDefaultDate = DataHelper.addDays(today, 1);
  const checkOutDefautDate = checkInDate ? DataHelper.addDays(checkInDate, 2) : DataHelper.addDays(checkInDefaultDate, 2);

  const minDateValue = DataHelper.toLocalISOString(today).split('T')[0];
  const maxDateValue = DataHelper.toLocalISOString(lastDayOfNextMonth).split('T')[0];
  const checkInDateValue = checkInDate && checkInDate <
    lastDayOfNextMonth ? DataHelper.toLocalISOString(checkInDate).split('T')[0] :
    DataHelper.toLocalISOString(checkInDefaultDate).split('T')[0];
  const checkOutDateValue = checkOutDate && checkOutDate <
    lastDayOfNextMonth ? DataHelper.toLocalISOString(checkOutDate).split('T')[0] :
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
  const checkInDate = new Date((<HTMLInputElement>document.getElementById('check-in-date')).value);
  const checkOutDate = new Date((<HTMLInputElement>document.getElementById('check-out-date')).value);
  const price = Number((<HTMLInputElement>document.getElementById('max-price')).value);
  const sendData: SearchFormData = {
    city,
    checkInDate,
    checkOutDate,
    maxPrice: price,
  }
  const parameters: SearchParameters = {
    city,
    checkInDate,
    checkOutDate,
    priceLimit: price
  }
  const homyData = await search(sendData);
  const sdkData = await sdk.search(parameters);
  const homyContent = homyData && homyData.length ?
    makePlaceListContent(homyData)
    :
    '';
  const sdkContent = sdkData && sdkData.length ?
    makeFlatListContent(sdkData)
    :
    '';

  if (!homyContent && !sdkContent) {
    renderEmptyOrErrorSearchBlock('Не найдено подходящих результатов');
    return;
  }

  const resultListContent = '<ul class="results-list">' + homyContent + sdkContent + '\n</ul>';
  renderSearchResultsBlock(resultListContent);

  if (homyContent) {
    addHomyBookButtonsListeners();
  }

  if (sdkContent) {
    addSdkBookButtonsListeners();
  }

  addtoggleFavoriteListeners();
  warningTimerId = setTimeout(showWarningMessage, 300000);
}

export async function search(data: SearchFormData): Promise<Place[]> {
  let url = 'http://localhost:3030/places?' +
    `checkInDate=${DataHelper.dateToUnixStamp(data.checkInDate)}&` +
    `checkOutDate=${DataHelper.dateToUnixStamp(data.checkOutDate)}&` +
    'coordinates=59.9386,30.3141'

  if (data.maxPrice != null) {
    url += `&maxPrice=${data.maxPrice}`;
  }

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (response.status === 200) {
      if (result.length) {
        return result;
      } else {
        throw new Error('Нет подходящих отелей из Homy API.');
      }
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(error);
  }
}

const addHomyBookButtonsListeners = (): void => {
  const homyBookButtons = document.querySelectorAll('.homydata .book-button');

  homyBookButtons.forEach((button: HTMLButtonElement) => {
    button.addEventListener('click', bookPlace);
  });
}

const addSdkBookButtonsListeners = (): void => {
  const sdkBookButtons = document.querySelectorAll('.sdkdata .book-button');

  sdkBookButtons.forEach((button: HTMLButtonElement) => {
    button.addEventListener('click', async () => {
      try {
        await sdk.book(
          button.dataset.id,
          new Date((<HTMLInputElement>document.getElementById('check-in-date')).value),
          new Date((<HTMLInputElement>document.getElementById('check-out-date')).value));
        renderToast(
          { text: 'Отель успешно забронирован.', type: 'success' },
          { name: 'ОК!', handler: () => { console.log('Успех'); } }
        );
        clearTimeout(warningTimerId);
      } catch (error) {
        renderToast(
          { text: 'Не получилось забронировать отель. Попробуйте позже', type: 'error' },
          { name: 'Понял', handler: () => { console.error(error); } }
        );
      }
    })
  });
}

const addtoggleFavoriteListeners = (): void => {
  const addToFavoritesButtons = document.querySelectorAll('.favorites');

  addToFavoritesButtons.forEach((button) => {
    button.addEventListener('click', toggleFavorite);
  });
}

const showWarningMessage = (): void => {
  const bookButtons = document.querySelectorAll('.book-button');

  disableButtons(bookButtons);
  renderToast(
    { text: 'Данные устарели. Обновите результаты поиска', type: 'error' },
    { name: 'ОК!', handler: () => console.log('Search again.') }
  );
}

const disableButtons = (buttons: NodeListOf<Element>): void => {
  buttons.forEach((button: HTMLButtonElement) => {
    button.disabled = true;
  })
}

export function toggleFavorite(e: Event): void {
  if (!(e.currentTarget instanceof HTMLDivElement)) {
    return;
  }

  const id = e.currentTarget.dataset.id;
  const name = e.currentTarget.dataset.name || e.currentTarget.dataset.title;
  const image = e.currentTarget.nextElementSibling.getAttribute('src');
  const currentPlace: FavoritePlace = {
    id,
    name,
    image
  }
  const localStorageItem = localStorage.getItem('favoriteItems');

  if (localStorageItem) {
    const favoriteItems: unknown = JSON.parse(localStorageItem);

    if (Array.isArray(favoriteItems)) {
      const favoriteItem = favoriteItems.find((item) => item.id === currentPlace.id);

      if (favoriteItem) {
        removeFromFavorites(currentPlace, favoriteItems);
      } else {
        addToFavorites(currentPlace, favoriteItems);
      }
    }
  } else {
    localStorage.setItem('favoriteItems', JSON.stringify([currentPlace]));
  }

  renderUserBlock();
}

function removeFromFavorites(currentPlace: FavoritePlace, favoriteItems: FavoritePlace[]): void {
  const indexOfItem = favoriteItems.indexOf(currentPlace);
  favoriteItems.splice(indexOfItem, 1);

  if (favoriteItems.length) {
    localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
  } else {
    localStorage.removeItem('favoriteItems');
  }
}

function addToFavorites(currentPlace: FavoritePlace, favoriteItems: FavoritePlace[]): void {
  favoriteItems.push(currentPlace);
  localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
}
