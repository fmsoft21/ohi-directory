// models/Order.js
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
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
  // Store snapshot in case product is deleted
  productSnapshot: {
    title: String,
    image: String,
    ownerName: String,
  },
});

const OrderSchema = new Schema(
  {
    // Order identification
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    
    // Buyer information
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    
    // Seller information
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerName: String,
    
    // Order items
    items: [OrderItemSchema],
    
    // Pricing
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    
    // Shipping details
    shippingAddress: {
      fullName: String,
      address: String,
      apartment: String,
      city: String,
      province: String,
      zipCode: String,
      phone: String,
    },
    
    // Order status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    
    // Payment details
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'eft', 'cash', 'other'],
      default: 'card',
    },
    
    // Tracking
    trackingNumber: String,
    
    // Notes
    customerNotes: String,
    sellerNotes: String,
    
    // Timestamps for different statuses
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
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