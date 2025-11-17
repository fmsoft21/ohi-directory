// models/Order.js
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  // Snapshot of product data at time of purchase
  productSnapshot: {
    title: String,
    image: String,
    ownerName: String,
  }
});


const ShippingAddressSchema = new Schema({
  fullName: String,
  phone: String,
  address: String,
  apartment: String,
  city: String,
  province: String,
  postalCode: String,
  country: { type: String, default: 'South Africa' },
});

const OrderSchema = new Schema(
  {
    // Order identification
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    
    // Order items
    items: [OrderItemSchema],
    
    // Pricing
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    
    // Shipping
    shippingAddress: ShippingAddressSchema,
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'collection'],
      default: 'standard',
    },
    estimatedDelivery: Date,
    
    // Payment
    paymentMethod: {
      type: String,
      enum: ['payfast', 'eft', 'cash_on_delivery'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      payfastPaymentId: String,
      payfastTransactionId: String,
      paidAt: Date,
    },
    
    // Order Status
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    
    // Tracking
    trackingNumber: String,
    trackingUrl: String,
    
    // Timestamps for status changes
    statusHistory: [{
      status: String,
      timestamp: Date,
      note: String,
    }],
    
    // Notes
    buyerNotes: String,
    sellerNotes: String,
    
    // Cancellation
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// Generate order number
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Indexes for faster queries
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ seller: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });

const Order = models.Order || model('Order', OrderSchema);

export default Order;