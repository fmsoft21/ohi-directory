"use client";
import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import { useCart } from '@/assets/contexts/CartContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/hooks/use-toast';

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
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
    shippingMethod: 'standard',
    paymentMethod: 'payfast',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Fetch shipping methods when city/province changes
  useEffect(() => {
    if (formData.city && formData.region) {
      fetchShippingMethods();
    }
  }, [formData.city, formData.region]);

  const fetchShippingMethods = async () => {
    try {
      setIsLoadingShipping(true);
      const res = await fetch(
        `/api/checkout?city=${formData.city}&province=${formData.region}`
      );
      
      if (res.ok) {
        const data = await res.json();
        setShippingMethods(data.shippingMethods || []);
        // Set first method as default
        if (data.shippingMethods?.length > 0) {
          setFormData(prev => ({
            ...prev,
            shippingMethod: data.shippingMethods[0].id,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      toast({
        title: "Error",
        description: "Failed to load shipping methods",
        variant: "destructive",
      });
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate user is logged in
    if (!session?.user) {
      toast({
        title: "Error",
        description: "Please sign in to continue checkout",
        variant: "destructive",
      });
      router.push('/auth/signin');
      return;
    }

    // Validate form
    if (!formData.email || !formData.address || !formData.city || !formData.region || !formData.postalCode) {
      toast({
        title: "Error",
        description: "Please fill in all required shipping fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress = {
        company: formData.company,
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        region: formData.region,
        postalCode: formData.postalCode,
        email: formData.email,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress,
          shippingMethod: formData.shippingMethod,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      toast({
        title: "Success",
        description: "Order created successfully",
      });

      // Handle payment redirection
      if (formData.paymentMethod === 'payfast' && data.paymentUrl) {
        // Redirect to PayFast payment
        window.location.href = data.paymentUrl;
      } else {
        // Redirect to order confirmation
        router.push(`/dashboard/orders/${data.order._id}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to process checkout',
        variant: "destructive",
      });
    } finally {
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
                className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
              />

              <PopoverPanel
                transition
                className="relative transform bg-white dark:bg-zinc-800 px-4 py-6 transition duration-300 ease-in-out data-closed:translate-y-full sm:px-6"
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

            {/* Shipping Method */}
            <section aria-labelledby="shipping-method-heading" className="mt-10">
              <h2 id="shipping-method-heading" className="text-lg font-medium text-gray-900 dark:text-white">
                Shipping method
              </h2>

              {isLoadingShipping ? (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading shipping methods...</p>
              ) : shippingMethods.length > 0 ? (
                <fieldset className="mt-6 space-y-4">
                  {shippingMethods.map((method) => (
                    <div key={method.id} className="flex items-center">
                      <input
                        id={method.id}
                        name="shippingMethod"
                        type="radio"
                        value={method.id}
                        checked={formData.shippingMethod === method.id}
                        onChange={handleInputChange}
                        className="h-4 w-4 border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor={method.id} className="ml-3 flex items-center cursor-pointer">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{method.name}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">R {method.cost.toFixed(2)}</span>
                        {method.estimatedDays && (
                          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">({method.estimatedDays} days)</span>
                        )}
                      </label>
                    </div>
                  ))}
                </fieldset>
              ) : (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No shipping methods available for this location</p>
              )}
            </section>

            {/* Billing Information */}
            <section aria-labelledby="billing-heading" className="mt-10">
              <h2 id="billing-heading" className="text-lg font-medium text-gray-900 dark:text-white">
                Payment method
              </h2>

              <fieldset className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    id="payfast"
                    name="paymentMethod"
                    type="radio"
                    value="payfast"
                    checked={formData.paymentMethod === 'payfast'}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="payfast" className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                    PayFast (Redirect to PayFast payment page)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="card"
                    name="paymentMethod"
                    type="radio"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="card" className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                    Credit/Debit Card (Direct payment)
                  </label>
                </div>
              </fieldset>

              {formData.paymentMethod === 'card' && (
                <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ⚠️ Direct card payment is currently in development. Please use PayFast for secure payments.
                  </p>
                </div>
              )}
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
