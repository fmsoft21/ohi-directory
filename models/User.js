import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, 'Email already exists!'],
      // required: [true, 'Email is required!'],
    },
    storename: {
      type: String,
      // required: [false, 'A name for your store is required!'],
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
      default: 'South Africa',
    },
    city: {
      type: String,
    },
    province: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    about: {
      type: String,
      maxLength: [500, 'About section cannot be more than 500 characters'],
    },
    image: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure a default storename is set when creating a user if missing
UserSchema.pre('save', function (next) {
  if (!this.storename && this.email) {
    const local = (this.email.split('@')[0] || this.email).toString();
    this.storename = local
      .replace(/\./g, '-')
      .replace(/[^a-z0-9-_]/gi, '')
      .toLowerCase();
  }

  // record whether storename was modified so post hook can act conditionally
  this._wasStorenameModified = this.isModified('storename');
  next();
});

// When a user's storename changes, update ownerName on their products
UserSchema.post('save', async function (doc) {
  try {
    // only run update if storename was modified during this save
    if (this._wasStorenameModified && doc && doc._id && doc.storename) {
      const mongoose = await import('mongoose');
      const Product = mongoose.models.Product || mongoose.model('Product');
      await Product.updateMany({ owner: doc._id }, { ownerName: doc.storename });
    }
  } catch (err) {
    // Log and continue — don't block user save
    console.warn('Failed to sync ownerName on products after user update', err);
  }
});

const User = models.User || model('User', UserSchema);

export default User;