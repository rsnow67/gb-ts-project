import { renderBlock } from './lib.js';

export function renderSearchFormBlock(
  checkInDate?: Date,
  checkOutDate?: Date
) {
  const today = new Date();
  const lastDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  let checkInDefaultDate = null;
  let checkOutDefaultDate = null;

  if (checkInDate == null && checkOutDate == null) {
    checkInDefaultDate = new Date();
    checkOutDefaultDate = new Date();
    checkInDefaultDate.setDate(today.getDate() + 1);
    checkOutDefaultDate.setDate(checkInDefaultDate.getDate() + 2);
  } else if (checkOutDate == null) {
    checkOutDefaultDate = new Date();
    checkOutDefaultDate.setDate(checkInDate.getDate() + 2);
  }

  const min = today.toISOString().split('T')[0];
  const max = lastDayOfNextMonth.toISOString().split('T')[0];
  const checkInValue = checkInDate ? checkInDate.toISOString().split('T')[0] : checkInDefaultDate.toISOString().split('T')[0];
  const checkOutValue = checkOutDate ? checkOutDate.toISOString().split('T')[0] : checkOutDefaultDate.toISOString().split('T')[0];

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
            <input id="check-in-date" type="date" value="${checkInValue}" min="${min}" max="${max}" name="checkin" />
          </div>
          <div>
            <label for="check-out-date">Дата выезда</label>
            <input id="check-out-date" type="date" value="${checkOutValue}" min="${min}" max="${max}" name="checkout" />
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
