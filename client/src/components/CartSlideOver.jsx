import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { X, ShoppingCart, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

export default function CartSlideOver() {
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { t, i18n } = useTranslation();
  
  const currentLang = i18n.language;
  const totalItems = items.reduce((total, item) => total + (item.quantity || 1), 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0).toFixed(2);

  // --- פונקציית עזר למניעת הקריסה (התיקון "אחת ולתמיד") ---
  const getSafeName = (nameObj) => {
    if (!nameObj) return '';
    // אם זה כבר טקסט רגיל
    if (typeof nameObj === 'string') return nameObj;
    // אם זה אובייקט, נחזיר את השפה הנוכחית, או עברית, או מחרוזת ריקה
    // לעולם לא נחזיר את האובייקט עצמו!
    return nameObj[currentLang] || nameObj.he || '';
  };

  return (
    <Transition.Root show={isCartOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">{t('cart.title')}</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button type="button" className="relative -m-2 p-2 text-gray-400 hover:text-gray-500" onClick={closeCart}>
                            <span className="sr-only">{t('common.closePanel')}</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {items.length > 0 ? (
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {items.map((item) => {
                                // שימוש בפונקציה הבטוחה לשם הפריט הראשי
                                const displayName = getSafeName(item.name);

                                return item.type === 'package' ? (
                                  <li key={item._id} className="flex py-6">
                                    <div className="h-24 w-24 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                      <Package className="h-12 w-12 text-gray-400" />
                                    </div>

                                    <div className="mr-4 flex flex-1 flex-col">
                                      <div>
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                          <h3>{displayName} {t('package.label')}</h3>
                                          <p className="ml-4">₪{item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-500">
                                          {item.userChoices.map(choice => (
                                            <div key={choice.category}>
                                              {/* תיקון קריטי: שימוש ב-getSafeName גם כאן */}
                                              <strong>{choice.category}:</strong> {choice.selectedOptions.map(opt => getSafeName(opt.name)).join(', ')}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex flex-1 items-end justify-end">
                                        <button onClick={() => removeFromCart(item._id, isAuthenticated)} type="button" className="font-medium text-blue-600 hover:text-blue-500">{t('common.remove')}</button>
                                      </div>
                                    </div>
                                  </li>
                                ) : (
                                  <li key={item._id} className="flex py-6">
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                      <img src={item.image || 'https://via.placeholder.com/150'} alt={displayName} className="h-full w-full object-cover object-center" />
                                    </div>
                                    <div className="mr-4 flex flex-1 flex-col">
                                      <div>
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                          <h3><Link to={`/product/${item._id}`} onClick={closeCart}>{displayName}</Link></h3>
                                          <p className="ml-4">₪{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                      </div>
                                      <div className="flex flex-1 items-end justify-between text-sm">
                                        <div className="flex items-center border rounded-md">
                                          <button onClick={() => updateQuantity(item._id, item.quantity + 1, isAuthenticated)} className="px-2 py-1 text-lg">+</button>
                                          <p className="text-gray-700 px-3">{item.quantity}</p>
                                          <button onClick={() => updateQuantity(item._id, item.quantity - 1, isAuthenticated)} className="px-2 py-1 text-lg">-</button>
                                        </div>
                                        <div className="flex">
                                          <button onClick={() => removeFromCart(item._id, isAuthenticated)} type="button" className="font-medium text-blue-600 hover:text-blue-500">{t('common.remove')}</button>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          ) : (
                            <div className="text-center py-12">
                              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('cart.empty.title')}</h3>
                              <p className="mt-1 text-sm text-gray-500">{t('cart.empty.prompt')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>{t('cart.subtotal', { count: totalItems })}</p>
                          <p>₪{totalPrice}</p>
                        </div>
                        <div className="mt-6">
                          <Button asChild className="w-full"><Link to="/checkout" onClick={closeCart}>{t('cart.checkout')}</Link></Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}