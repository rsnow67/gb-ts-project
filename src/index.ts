import { renderSearchFormBlock } from './search-form.js';
import { renderSearchStubBlock } from './search-results.js';
import { renderUserBlock } from './user.js';
import { renderToast } from './lib.js';
import { SearchFormData } from './search-form-data.js';
import { search, showRandom } from './helpers.js';

window.addEventListener('DOMContentLoaded', () => {
  renderUserBlock('Wade Warren', '/img/avatar.png', 0);

  const checkInDefaultDate = new Date();
  checkInDefaultDate.setDate(checkInDefaultDate.getDate() + 1);
  const checkInDefaultDateISO = new Date(checkInDefaultDate.getTime() - (checkInDefaultDate.getTimezoneOffset() * 60000))
    .toISOString().split('T')[0];

  const checkOutDefaultDate = new Date();
  checkOutDefaultDate.setDate(checkInDefaultDate.getDate() + 2);
  const checkOutDefaultDateISO = new Date(checkOutDefaultDate.getTime() - (checkOutDefaultDate.getTimezoneOffset() * 60000))
    .toISOString().split('T')[0];

  renderSearchFormBlock(checkInDefaultDateISO, checkOutDefaultDateISO);
  renderSearchStubBlock();
  renderToast(
    { text: 'Это пример уведомления. Используйте его при необходимости', type: 'success' },
    { name: 'Понял', handler: () => { console.log('Уведомление закрыто') } }
  );
});

const form = document.getElementById('search-form-block');
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const sendData: SearchFormData = {
    city: (<HTMLInputElement>document.getElementById('city')).value,
    checkInDate: (<HTMLInputElement>document.getElementById('check-in-date')).value,
    checkOutDate: (<HTMLInputElement>document.getElementById('check-out-date')).value,
    maxPrice: (<HTMLInputElement>document.getElementById('max-price')).value
  }

  search(sendData, showRandom);
});
