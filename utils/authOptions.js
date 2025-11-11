// utils/authOptions.js - Enhanced with multiple providers
import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import User from '@/models/User';
import connectDB from '@/config/database';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    // Optional: Email/Password authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user || !user.password) {
          throw new Error('No user found with this email');
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error('Invalid password');
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.storename,
          image: user.image,
        };
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();
      
      const userExists = await User.findOne({ email: user.email || profile?.email });

      if (!userExists) {
        // Create new user with onboarding flag
        const emailLocal = (user.email || profile?.email || '').split('@')[0] || '';
        const defaultStoreName = emailLocal
          .replace(/\./g, ' ')
          .replace(/[^a-z0-9-_]/gi, '')
          .toLowerCase();

        await User.create({
          email: user.email || profile?.email,
          storename: defaultStoreName,
          image: user.image || profile?.picture,
          // Flag for onboarding
          isOnboarded: false,
          authProvider: account.provider, // Track provider
        });
      }
      
      return true;
    },

    async session({ session, token }) {
      await connectDB();
      const user = await User.findOne({ email: session.user.email });
      
      if (user) {
        session.user.id = user._id.toString();
        session.user.isOnboarded = user.isOnboarded || false;
        session.user.storename = user.storename;
      }
      
      return session;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
      }
      
      // Handle session update (when update() is called)
      if (trigger === 'update' && session) {
        token.isOnboarded = session.user.isOnboarded;
        token.storename = session.user.storename;
      }
      
      // Fetch latest user data if not already in token
      if (token.email && !token.isOnboarded && token.isOnboarded !== false) {
        try {
          await connectDB();
          const user = await User.findOne({ email: token.email });
          if (user) {
            token.isOnboarded = user.isOnboarded || false;
            token.storename = user.storename;
          }
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }
      
      return token;
    }
  },

  pages: {
    signIn: '/auth/signin',  // Custom sign-in page
    error: '/auth/error',
    newUser: '/onboarding',   // Redirect new users here
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

export default NextAuth(authOptions)