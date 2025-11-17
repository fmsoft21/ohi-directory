"use client";
import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import { useCart } from '@/assets/contexts/CartContext';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    nameOnCard: '',
    cardNumber: '',
    expirationDate: '',
    cvc: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    region: '',
    postalCode: '',
    sameAsShipping: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Integrate with payment processing (Stripe, PayFast, etc.)
      console.log('Order submitted:', { cart, formData });
      
      // Placeholder for actual checkout processing
      alert('Order processing not yet implemented. This is a demo.');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing order. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle cart data structure - cart can be object with items array or null
  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shipping = cart?.shipping || 0;
  const taxes = cart?.tax || 0;
  const total = cart?.total || 0;

  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push('/products')}
            className="inline-block rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-16 md:mt-16 bg-white dark:bg-zinc-900">
      {/* Background color split screen for large screens */}
      <div aria-hidden="true" className="fixed left-0 top-0 hidden h-full w-1/2 bg-white dark:bg-zinc-900 lg:block" />
      <div aria-hidden="true" className="fixed right-0 top-0 hidden h-full w-1/2 bg-gray-50 dark:bg-zinc-800 lg:block" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
        <h1 className="sr-only">Order information</h1>

        {/* Order Summary */}
        <section
          aria-labelledby="summary-heading"
          className="bg-gray-100 dark:bg-zinc-800 px-4 pb-10 pt-24 md:pt-16 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent dark:lg:bg-transparent lg:px-0 lg:pb-16"
        >
          <div className="mx-auto max-w-lg lg:max-w-none">
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900 dark:text-white">
              Order summary
            </h2>

            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100">
              {cartItems.map((item) => (
                <li key={item._id} className="flex items-start space-x-4 py-6">
                  <img
                    alt={item.product?.title}
                    src={item.product?.images?.[0] || item.productSnapshot?.image || '/image.png'}
                    className="h-20 w-20 flex-none rounded-md object-cover object-center"
                  />
                  <div className="flex-auto space-y-1">
                    <h3>{item.product?.title || item.productSnapshot?.title || 'Product'}</h3>
                    <p className="text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="flex-none text-base font-medium">R {(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>

            <dl className="hidden space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6 text-sm font-medium text-gray-900 dark:text-gray-100 lg:block">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
                <dd>R {subtotal}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Shipping</dt>
                <dd>R {shipping.toFixed(2)}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Taxes</dt>
                <dd>R {taxes}</dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                <dt className="text-base">Total</dt>
                <dd className="text-base">R {total}</dd>
              </div>
            </dl>

            {/* Mobile Order Summary Popover */}
            <Popover className="fixed inset-x-0 bottom-0 flex flex-col-reverse text-sm font-medium text-gray-900 dark:text-gray-100 lg:hidden">
              <div className="relative z-10 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 px-4 sm:px-6">
                <div className="mx-auto max-w-lg">
                  <PopoverButton className="flex w-full items-center py-6 font-medium">
                    <span className="mr-auto text-base">Total</span>
                    <span className="mr-2 text-base">R {total}</span>
                    <ChevronUpIcon aria-hidden="true" className="h-5 w-5 text-gray-500" />
                  </PopoverButton>
                </div>
              </div>

              <PopoverBackdrop
                transition
                className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
              />

              <PopoverPanel
                transition
                className="relative transform bg-white dark:bg-zinc-800 px-4 py-6 transition duration-300 ease-in-out data-[closed]:translate-y-full sm:px-6"
              >
                <dl className="mx-auto max-w-lg space-y-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
                    <dd>R {subtotal}</dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Shipping</dt>
                    <dd>R {shipping.toFixed(2)}</dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Taxes</dt>
                    <dd>R {taxes}</dd>
                  </div>
                </dl>
              </PopoverPanel>
            </Popover>
          </div>
        </section>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="px-4 pb-36 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16">
          <div className="mx-auto max-w-lg lg:max-w-none">
            {/* Contact Information */}
            <section aria-labelledby="contact-info-heading">
              <h2 id="contact-info-heading" className="text-lg font-medium text-gray-900 dark:text-white">
                Contact information
              </h2>

              <div className="mt-6">
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-md  border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Payment Details */}
            <section aria-labelledby="payment-heading" className="mt-10">
              <h2 id="payment-heading" className="text-lg font-medium text-gray-900 dark:text-white">
                Payment details
              </h2>

              <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
                <div className="col-span-3 sm:col-span-4">
                  <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name on card
                  </label>
                  <div className="mt-1">
                    <Input
                      id="name-on-card"
                      name="nameOnCard"
                      type="text"
                      autoComplete="cc-name"
                      required
                      value={formData.nameOnCard}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-4">
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Card number
                  </label>
                  <div className="mt-1">
                    <Input
                      id="card-number"
                      name="cardNumber"
                      type="text"
                      autoComplete="cc-number"
                      required
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-3">
                  <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expiration date (MM/YY)
                  </label>
                  <div className="mt-1">
                    <Input
                      id="expiration-date"
                      name="expirationDate"
                      type="text"
                      autoComplete="cc-exp"
                      required
                      value={formData.expirationDate}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    CVC
                  </label>
                  <div className="mt-1">
                    <Input
                      id="cvc"
                      name="cvc"
                      type="text"
                      autoComplete="csc"
                      required
                      value={formData.cvc}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section aria-labelledby="shipping-heading" className="mt-10">
              <h2 id="shipping-heading" className="text-lg font-medium text-gray-900 dark:text-white">
                Shipping address
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company
                  </label>
                  <div className="mt-1">
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <div className="mt-1">
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Apartment, suite, etc.
                  </label>
                  <div className="mt-1">
                    <Input
                      id="apartment"
                      name="apartment"
                      type="text"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <div className="mt-1">
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State / Province
                  </label>
                  <div className="mt-1">
                    <Input
                      id="region"
                      name="region"
                      type="text"
                      autoComplete="address-level1"
                      required
                      value={formData.region}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Postal code
                  </label>
                  <div className="mt-1">
                    <Input
                      id="postal-code"
                      name="postalCode"
                      type="text"
                      autoComplete="postal-code"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Billing Information */}
            <section aria-labelledby="billing-heading" className="mt-10">
              <h2 id="billing-heading" className="text-lg font-medium text-gray-900 dark:text-white">
                Billing information
              </h2>

              <div className="mt-6 flex items-center">
                <Input
                  id="same-as-shipping"
                  name="sameAsShipping"
                  type="checkbox"
                  checked={formData.sameAsShipping}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-2">
                  <label htmlFor="same-as-shipping" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Same as shipping information
                  </label>
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6 sm:flex sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md border border-transparent bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 sm:order-last sm:ml-6 sm:w-auto"
              >
                {isSubmitting ? 'Processing...' : 'Complete Order'}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:text-left">
                You won't be charged until you confirm.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
