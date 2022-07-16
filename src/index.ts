import { handleSubmit, renderSearchFormBlock } from './search-form.js';
import { renderSearchStubBlock } from './search-results.js';
import { renderUserBlock } from './user.js';
import { renderToast } from './lib.js';
import { FlatRentSdk } from './flat-rent-sdk.js';
import { HomyProvider } from './store/providers/homy-api/homy-provider.js';
import { FlatRentSdkProvider } from './store/providers/flat-rent-sdk/flat-rent-skd-provider.js';

window.addEventListener('DOMContentLoaded', () => {
  renderUserBlock();
  renderSearchFormBlock();
  renderSearchStubBlock();
  renderToast(
    { text: 'Это пример уведомления. Используйте его при необходимости', type: 'success' },
    { name: 'Понял', handler: () => { console.log('Уведомление закрыто.') } }
  );
});

const form = document.getElementById('search-form-block');
form.addEventListener('submit', handleSubmit);
export const userPosition = [59.9386, 30.3141];
export const homyProvider = new HomyProvider();
export const flatRentSdk = new FlatRentSdk();
export const flatRentSdkProvider = new FlatRentSdkProvider();

