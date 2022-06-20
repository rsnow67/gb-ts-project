import { dateToUnixStamp } from './helpers.js';
import { renderBlock, renderToast } from './lib.js';
import { Place } from './place.js';
import { warningTimerId } from './search-form.js';

export function renderSearchStubBlock() {
  renderBlock(
    'search-results-block',
    `
    <div class="before-results-block">
      <img src="img/start-search.png" />
      <p>Чтобы начать поиск, заполните форму и&nbsp;нажмите "Найти"</p>
    </div>
    `
  );
}

export function renderEmptyOrErrorSearchBlock(reasonMessage: string) {
  renderBlock(
    'search-results-block',
    `
    <div class="no-results-block">
      <img src="img/no-results.png" />
      <p>${reasonMessage}</p>
    </div>
    `
  );
}

export function makeListContent(places: Place[]) {
  const items = [];

  places.forEach((place) => {
    items.push(
      `
      <li class="result" data-id="${place.id}">
        <div class="result-container">
          <div class="result-img-container">
            <div class="favorites active" data-id="${place.id}" data-name="${place.name}" data-image="${place.image}"></div>
            <img class="result-img" src="${place.image}" alt="${place.name} hotel" width="225" height="225">
          </div>	
          <div class="result-info">
            <div class="result-info--header">
              <p>${place.name}</p>
              <p class="price">${place.price}&#8381;</p>
            </div>
            <div class="result-info--map"><i class="map-icon"></i>${place.remoteness} км от вас</div>
            <div class="result-info--descr">${place.description}</div>
            <div class="result-info--footer">
              <div>
                <button class="book-button" type="button" data-id="${place.id}">Забронировать</button>
              </div>
            </div>
          </div>
        </div>
      </li>`);
  });

  return '<ul class="results-list">' + items.join('') + '\n</ul>';
}

export function renderSearchResultsBlock(listContent: string) {
  renderBlock(
    'search-results-block',
    `
    <div class="search-results-header">
        <p>Результаты поиска</p>
        <div class="search-results-filter">
            <span><i class="icon icon-filter"></i> Сортировать:</span>
            <select>
                <option selected="">Сначала дешёвые</option>
                <option selected="">Сначала дорогие</option>
                <option>Сначала ближе</option>
            </select>
        </div>
    </div>
    ${listContent}
    `
  );
}

export async function bookPlace(event: Event): Promise<void> {
  if (!(event.currentTarget instanceof HTMLButtonElement)) {
    return;
  }

  const placeId = Number(event.currentTarget.dataset.id);
  const checkInDate = new Date((<HTMLInputElement>document.getElementById('check-in-date')).value);
  const checkOutDate = new Date((<HTMLInputElement>document.getElementById('check-out-date')).value);

  const url = `http://localhost:3030/places/${placeId}?` +
  `checkInDate=${dateToUnixStamp(checkInDate)}&` +
  `checkOutDate=${dateToUnixStamp(checkOutDate)}&`

  try {
    const response = await fetch(url, {method: 'PATCH'});
    const result = await response.json();

    if (response.status === 200) {
      renderToast(
        { text: 'Отель успешно забронирован.', type: 'success' },
        { name: 'ОК!', handler: () => { console.log(result.bookedDates) } }
      );
      clearTimeout(warningTimerId);
    } else {
      renderToast(
        { text: 'Не получилось забронировать отель. Попробуйте позже', type: 'error' },
        { name: 'Понял', handler: () => { console.log(result.message) } }
      );
    }
  } catch (error) {
    console.error(error);
  }
}
