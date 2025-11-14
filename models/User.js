// models/User.js - Updated with onboarding and password support
import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, 'Email already exists!'],
      required: [true, 'Email is required!'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Only required for email/password signups
      required: function() {
        return this.authProvider === 'credentials';
      },
      select: false, // Don't return password by default
    },
    authProvider: {
      type: String,
      enum: ['google', 'facebook', 'credentials'],
      default: 'google',
    },
    storename: {
      type: String,
      required: [true, 'Store name is required!'],
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
      enum: [
        'Gauteng',
        'Western Cape',
        'KwaZulu-Natal',
        'Eastern Cape',
        'Free State',
        'Limpopo',
        'Mpumalanga',
        'Northern Cape',
        'North West',
      ],
    },
    zipCode: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{4}$/.test(v); // SA zip codes are 4 digits
        },
        message: 'ZIP code must be 4 digits'
      }
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
    
    // Geospatial fields
    latitude: {
      type: Number,
      min: -90,
      max: 90,
      index: '2dsphere',
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
      index: '2dsphere',
    },
    // Store the formatted address returned by geocoding service
    geocodedAddress: {
      type: String,
    },
    // When the address was last geocoded
    geocodedAt: {
      type: Date,
    },
    // GeoJSON point for advanced geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    
    // Onboarding tracking
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0, // Track current step (0 = not started)
    },
    
    // Email verification for credentials signup
    isEmailVerified: {
      type: Boolean,
      default: function() {
        // OAuth users are auto-verified
        return this.authProvider !== 'credentials';
      }
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash if password is modified or new
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  next();
});

// Pre-save middleware to sync location field with lat/lng
UserSchema.pre('save', function(next) {
  if (this.latitude && this.longitude) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude]
    };
  }
  next();
});

// Add index for geospatial queries
UserSchema.index({ location: '2dsphere' });

// Ensure default storename
UserSchema.pre('save', function (next) {
  if (!this.storename && this.email) {
    const local = (this.email.split('@')[0] || this.email).toString();
    this.storename = local
      .replace(/\./g, '-')
      .replace(/[^a-z0-9-_]/gi, '')
      .toLowerCase();
  }

  this._wasStorenameModified = this.isModified('storename');
  next();
});

// Update products when storename changes
UserSchema.post('save', async function (doc) {
  try {
    if (this._wasStorenameModified && doc && doc._id && doc.storename) {
      const mongoose = await import('mongoose');
      const Product = mongoose.models.Product || mongoose.model('Product');
      await Product.updateMany({ owner: doc._id }, { ownerName: doc.storename });
    }
  } catch (err) {
    console.warn('Failed to sync ownerName on products after user update', err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if onboarding is complete
UserSchema.methods.isOnboardingComplete = function() {
  return !!(
    this.storename &&
    this.phone &&
    this.address &&
    this.city &&
    this.province
  );
};

// Method to find nearby stores
UserSchema.statics.findNearby = function(longitude, latitude, maxDistanceKm = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000 // Convert km to meters
      }
    }
  });
};

// Method to check if user needs re-geocoding (e.g., after 30 days)
UserSchema.methods.needsGeocoding = function() {
  if (!this.latitude || !this.longitude) return true;
  if (!this.geocodedAt) return true;
  
  const daysSinceGeocoding = (Date.now() - this.geocodedAt) / (1000 * 60 * 60 * 24);
  return daysSinceGeocoding > 30; // Re-geocode after 30 days
};

const User = models.User || model('User', UserSchema);

export default User;