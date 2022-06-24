import { ResponseStatus } from './types.js';

export interface ToastMessage {
  text: string,
  type: ResponseStatus,
}
