const KEY = 'payment_pending'

export const paymentPending = {
  set: () => sessionStorage.setItem(KEY, '1'),
  clear: () => sessionStorage.removeItem(KEY),
  get: () => sessionStorage.getItem(KEY) === '1',
}
