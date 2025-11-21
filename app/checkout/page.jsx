"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import { useCart } from '@/assets/contexts/CartContext';
import { toast } from '@/components/hooks/use-toast';
import { Store, Package, TruckIcon, CreditCard, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemsBySeller, setItemsBySeller] = useState({});
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    province: '',
    postalCode: '',
    shippingMethod: 'standard',
    paymentMethod: 'payfast',
    customerNotes: '',
  });

  // Set email when session loads
  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        email: session.user.email
      }));
    }
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Group items by seller when cart loads
  useEffect(() => {
    if (cart?.items) {
      groupItemsBySeller();
    }
  }, [cart]);

  // Fetch shipping methods when address changes
  useEffect(() => {
    if (formData.city && formData.province) {
      fetchShippingMethods();
    }
  }, [formData.city, formData.province]);

  const groupItemsBySeller = () => {
    const grouped = {};
    
    cart.items.forEach(item => {
      const sellerId = item.product?.owner?._id || item.product?.owner || 'unknown';
      const sellerName = item.product?.ownerName || item.productSnapshot?.ownerName || 'Unknown Seller';
      
      if (!grouped[sellerId]) {
        grouped[sellerId] = {
          sellerId,
          sellerName,
          items: [],
          subtotal: 0,
        };
      }
      
      grouped[sellerId].items.push(item);
      grouped[sellerId].subtotal += item.price * item.quantity;
    });
    
    setItemsBySeller(grouped);
  };

  const fetchShippingMethods = async () => {
    setLoadingShipping(true);
    try {
      const res = await fetch(
        `/api/checkout?city=${encodeURIComponent(formData.city)}&province=${encodeURIComponent(formData.province)}`
      );
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response');
      }
      
      const data = await res.json();
      
      if (res.ok) {
        setShippingMethods(data.shippingMethods || []);
        if (data.shippingMethods?.length > 0) {
          setFormData(prev => ({
            ...prev,
            shippingMethod: data.shippingMethods[0].id,
          }));
        }
      } else {
        console.error('Failed to fetch shipping methods:', data);
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      toast({
        title: "Warning",
        description: "Could not load shipping methods. Using default options.",
        variant: "destructive",
      });
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
    else if (!/^\d{4}$/.test(formData.postalCode)) newErrors.postalCode = 'Postal code must be 4 digits';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      router.push('/auth/signin?callbackUrl=/checkout');
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        address: formData.address.trim(),
        apartment: formData.apartment.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode.trim(),
      };

      console.log('Submitting checkout with:', {
        shippingAddress,
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
      });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress,
          shippingMethod: formData.shippingMethod,
          paymentMethod: formData.paymentMethod,
          customerNotes: formData.customerNotes.trim(),
        }),
      });

      // Check content type
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response');
        const text = await res.text();
        console.error('Response:', text.substring(0, 500));
        throw new Error('Server error - please try again');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Checkout failed');
      }

      // Show success message with order numbers
      const orderNumbers = data.orders?.map(o => o.orderNumber).join(', ') || 'Unknown';
      toast({
        title: "Success!",
        description: `Order(s) created: ${orderNumbers}`,
      });

      // Handle payment redirection
      if (formData.paymentMethod === 'payfast' && data.paymentUrl) {
        console.log('Redirecting to PayFast:', data.paymentUrl);
        window.location.href = data.paymentUrl;
      } else {
        router.push('/dashboard/purchases');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to process checkout. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (status === 'loading' || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900 mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900 mt-16">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => router.push('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const cartItems = cart.items;
  const subtotal = cart.subtotal || 0;
  const shipping = cart.shipping || 0;
  const taxes = cart.tax || 0;
  const total = cart.total || 0;
  const sellerCount = Object.keys(itemsBySeller).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Vendor Notice */}
            {sellerCount > 1 && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <Store className="h-4 w-4" />
                <AlertDescription>
                  You're ordering from {sellerCount} different sellers. Separate orders will be created for each seller.
                </AlertDescription>
              </Alert>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0821234567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company (Optional)</label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address *</label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apartment/Suite</label>
                  <Input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="Apt 4B"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Johannesburg"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Province *</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${errors.province ? 'border-red-500' : 'border-gray-300'} dark:bg-zinc-800 dark:border-zinc-700`}
                    >
                      <option value="">Select Province</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="Western Cape">Western Cape</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="North West">North West</option>
                    </select>
                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code *</label>
                  <Input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="2000"
                    maxLength={4}
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingShipping ? (
                  <p className="text-sm text-muted-foreground">Loading shipping options...</p>
                ) : shippingMethods.length > 0 ? (
                  shippingMethods.map((method) => (
                    <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={formData.shippingMethod === method.id}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      <p className="font-semibold">R {method.cost.toFixed(2)}</p>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Enter your city and province to see shipping options</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payfast"
                    checked={formData.paymentMethod === 'payfast'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium">PayFast</p>
                    <p className="text-sm text-muted-foreground">Secure payment via PayFast</p>
                  </div>
                </label>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  name="customerNotes"
                  value={formData.customerNotes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for your order..."
                  className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items by Seller */}
                  {Object.values(itemsBySeller).map((seller) => (
                    <div key={seller.sellerId} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Store className="h-4 w-4 text-emerald-600" />
                        <span className="font-semibold text-sm">{seller.sellerName}</span>
                      </div>
                      
                      {seller.items.map((item) => (
                        <div key={item._id} className="flex gap-3">
                          <Image
                            src={item.product?.images?.[0] || item.productSnapshot?.image || '/image.png'}
                            alt={item.productSnapshot?.title || 'Product'}
                            width={60}
                            height={60}
                            className="rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.product?.title || item.productSnapshot?.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × R {item.price}
                            </p>
                            <p className="text-sm font-semibold">
                              R {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-right text-sm">
                        <span className="text-muted-foreground">Seller Subtotal: </span>
                        <span className="font-semibold">R {seller.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>R {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>R {shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (15% VAT)</span>
                      <span>R {taxes.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>R {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {sellerCount > 1 && (
                    <div className="pt-2 text-xs text-muted-foreground">
                      * {sellerCount} separate orders will be created
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 text-lg"
                variant="primary"
              >
                {isSubmitting ? 'Processing...' : `Complete Order (R ${total.toFixed(2)})`}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}