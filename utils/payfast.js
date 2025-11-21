// utils/payfast.js - ENHANCED VERSION
import crypto from 'crypto';

/**
 * Generate PayFast payment signature
 */
export function generatePayFastSignature(data, passPhrase = null) {
  // Create parameter string
  let pfOutput = '';
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== '') {
        pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  
  if (passPhrase !== null) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(getString).digest('hex');
}

/**
 * Create PayFast payment data for orders
 * Handles multiple orders by combining totals
 */
export function createPayFastPayment(orders, returnUrl, cancelUrl, notifyUrl) {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passPhrase = process.env.PAYFAST_PASSPHRASE;
  
  // Use sandbox in development
  const useSandbox = process.env.NODE_ENV !== 'production';

  // Handle single order or array of orders
  const orderArray = Array.isArray(orders) ? orders : [orders];
  
  // Calculate combined totals
  const totalAmount = orderArray.reduce((sum, order) => sum + order.total, 0);
  const itemCount = orderArray.reduce((sum, order) => sum + order.items.length, 0);
  
  // Get first order for reference data
  const firstOrder = orderArray[0];
  
  // Create order numbers string
  const orderNumbers = orderArray.map(o => o.orderNumber).join(', ');
  
  // Get buyer details
  const fullName = firstOrder.shippingAddress?.fullName || 
                   firstOrder.user?.storename || 
                   'Customer';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || 'User';
  
  const email = firstOrder.shippingAddress?.email || 
                firstOrder.buyerEmail || 
                firstOrder.user?.email || 
                'noreply@example.com';
  
  const phone = firstOrder.shippingAddress?.phone || '';

  const data = {
    // Merchant details
    merchant_id: useSandbox ? '10000100' : merchantId,
    merchant_key: useSandbox ? '46f0cd694581a' : merchantKey,
    
    // URLs
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    
    // Buyer details
    name_first: firstName,
    name_last: lastName,
    email_address: email,
    cell_number: phone.replace(/\s/g, ''),
    
    // Transaction details
    m_payment_id: orderNumbers,
    amount: totalAmount.toFixed(2),
    item_name: orderArray.length > 1 
      ? `${orderArray.length} Orders` 
      : `Order #${firstOrder.orderNumber}`,
    item_description: `${itemCount} items from ${orderArray.length} seller(s)`,
    
    // Optional - store order IDs for reference
    custom_str1: orderArray.map(o => o._id.toString()).join(','),
    custom_int1: orderArray.length,
    custom_int2: itemCount,
  };

  // Generate signature
  data.signature = generatePayFastSignature(data, useSandbox ? null : passPhrase);

  return {
    data,
    url: useSandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process',
  };
}

/**
 * Verify PayFast payment notification (ITN)
 */
export function verifyPayFastPayment(postData, passPhrase = null) {
  // Separate signature from data
  const pfSignature = postData.signature;
  delete postData.signature;

  // Generate signature
  const calculatedSignature = generatePayFastSignature(postData, passPhrase);

  // Compare signatures
  return pfSignature === calculatedSignature;
}

/**
 * Validate PayFast IP address (for ITN security)
 */
export function isValidPayFastIP(ipAddress) {
  const validIPs = [
    '197.97.145.144',
    '197.97.145.145',
    '197.97.145.146',
    '197.97.145.147',
    '197.97.145.148',
    '197.97.145.149',
    '197.97.145.150',
    '197.97.145.151',
    '197.97.145.152',
    '197.97.145.153',
    // Sandbox IPs
    '41.74.179.194',
    '41.74.179.195',
    '41.74.179.196',
    '41.74.179.197',
  ];

  return validIPs.includes(ipAddress);
}

/**
 * Parse PayFast payment status
 */
export function parsePayFastStatus(paymentStatus) {
  const statusMap = {
    'COMPLETE': 'paid',
    'FAILED': 'failed',
    'PENDING': 'pending',
    'CANCELLED': 'failed',
  };

  return statusMap[paymentStatus] || 'pending';
}

/**
 * Generate PayFast payment form HTML (client-side submission)
 */
export function generatePayFastForm(paymentData) {
  const { data, url } = paymentData;
  
  let formHtml = `<form id="payfast-form" action="${url}" method="post">`;
  
  for (const [key, value] of Object.entries(data)) {
    formHtml += `<input type="hidden" name="${key}" value="${value}" />`;
  }
  
  formHtml += '</form>';
  
  return formHtml;
}

/**
 * Create PayFast payment URL with query parameters (for GET redirect)
 */
export function createPayFastUrl(paymentData) {
  const { data, url } = paymentData;
  const params = new URLSearchParams(data);
  return `${url}?${params.toString()}`;
}

// app/api/checkout/route.js - UPDATE THE PAYFAST SECTION
// Replace the PayFast handling section in your checkout route with:

// app/api/payment/verify/route.js - NEW FILE
import connectDB from '@/config/database';
import Order from '@/models/Order';

export async function POST(request) {
  try {
    await connectDB();
    
    const { paymentId } = await request.json();
    
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Payment ID can be a single order or comma-separated orders
    const orderNumbers = paymentId.split(',').map(n => n.trim());
    
    // Find orders
    const orders = await Order.find({
      orderNumber: { $in: orderNumbers }
    });

    if (orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Orders not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total amount
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

    return new Response(
      JSON.stringify({
        success: true,
        orderNumbers: orders.map(o => o.orderNumber).join(', '),
        amount: totalAmount.toFixed(2),
        orders: orders.map(o => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          status: o.status,
          paymentStatus: o.paymentStatus,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Verification failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ENVIRONMENT VARIABLES NEEDED:
/*
Add these to your .env.local file:

# PayFast Configuration
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase

# For sandbox testing:
# PAYFAST_MERCHANT_ID=10000100
# PAYFAST_MERCHANT_KEY=46f0cd694581a

# Base URL for callbacks
NEXTAUTH_URL=http://localhost:3000  # or your production URL
*/

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // PayFast returns these parameters
    const paymentId = searchParams.get('m_payment_id');
    const paymentStatus = searchParams.get('payment_status');
    const amount = searchParams.get('amount_gross');

    if (paymentId && paymentStatus === 'COMPLETE') {
      // Verify payment on server
      verifyPayment(paymentId);
    } else {
      setVerifying(false);
    }
  }, [searchParams]);

  const verifyPayment = async (paymentId) => {
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderData(data);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-600" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            {orderData && (
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Number(s)</span>
                  <span className="font-medium">{orderData.orderNumbers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">R {orderData.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="text-emerald-600 font-medium">Paid</span>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Link href="/dashboard/purchases" className="block">
                <Button className="w-full" size="lg">
                  <Package className="h-4 w-4 mr-2" />
                  View My Orders
                </Button>
              </Link>
              
              <Link href="/products" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Update your handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!session?.user) {
    toast({
      title: "Error",
      description: "Please sign in to continue checkout",
      variant: "destructive",
    });
    router.push('/auth/signin');
    return;
  }

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
      fullName: formData.fullName || formData.company || session.user.storename,
      company: formData.company,
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      province: formData.region, // Map region to province
      postalCode: formData.postalCode,
      email: formData.email,
      phone: formData.phone,
    };

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shippingAddress,
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        customerNotes: formData.customerNotes,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Checkout failed');
    }

    const orderNumbers = data.orders?.map(o => o.orderNumber).join(', ') || 'Unknown';
    
    toast({
      title: "Success",
      description: `Order(s) created: ${orderNumbers}`,
    });

    // Handle PayFast payment redirect
    if (formData.paymentMethod === 'payfast' && data.paymentData) {
      setPaymentData(data.paymentData);
      setIsRedirecting(true);
      
      // Auto-submit form after showing message
      setTimeout(() => {
        document.getElementById('payfast-form')?.submit();
      }, 1500);
    } else {
      // Other payment methods or manual payment
      const firstOrderId = data.orders?.[0]?._id;
      if (firstOrderId) {
        router.push(`/dashboard/purchases/${firstOrderId}`);
      } else {
        router.push('/dashboard/purchases');
      }
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

// Add this PayFast form component after your main form:
{paymentData && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold">Redirecting to PayFast</h3>
        <p className="text-muted-foreground">
          Please wait while we redirect you to complete your payment securely...
        </p>
      </div>
      
      {/* PayFast Form - Auto-submits */}
      <form 
        id="payfast-form" 
        action={paymentData.merchant_id === '10000100' 
          ? 'https://sandbox.payfast.co.za/eng/process' 
          : 'https://www.payfast.co.za/eng/process'
        } 
        method="post"
        className="hidden"
      >
        {Object.entries(paymentData).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>
    </div>
  </div>
)}