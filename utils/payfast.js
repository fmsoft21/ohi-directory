// utils/payfast.js
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
 * Create PayFast payment data
 */
export function createPayFastPayment(order, returnUrl, cancelUrl, notifyUrl) {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passPhrase = process.env.PAYFAST_PASSPHRASE;
  
  // Use sandbox in development
  const useSandbox = process.env.NODE_ENV !== 'production';

  const data = {
    // Merchant details
    merchant_id: useSandbox ? '10000100' : merchantId,
    merchant_key: useSandbox ? '46f0cd694581a' : merchantKey,
    
    // URLs
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    
    // Buyer details
    name_first: order.shippingAddress.fullName.split(' ')[0],
    name_last: order.shippingAddress.fullName.split(' ').slice(1).join(' ') || 'Customer',
    email_address: order.user.email || 'noreply@example.com',
    cell_number: order.shippingAddress.phone,
    
    // Transaction details
    m_payment_id: order.orderNumber,
    amount: order.total.toFixed(2),
    item_name: `Order #${order.orderNumber}`,
    item_description: `${order.items.length} items`,
    
    // Optional
    custom_str1: order._id.toString(),
    custom_int1: order.items.length,
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