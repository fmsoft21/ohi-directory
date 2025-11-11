'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 dark:from-zinc-900 dark:to-zinc-800">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              
              <h2 className="mt-12 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                Yay! Glad to see you again
              </h2>
             
            </div>

            <div className="mt-8">
              <Card className="w-full border-none bg-zinc-100 dark:bg-zinc-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Welcome back</CardTitle>
                  <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* OAuth Buttons */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => signIn('google', { callbackUrl })}
                    >
                      <FcGoogle className="h-5 w-5 mr-3" />
                      Continue with Google
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => signIn('facebook', { callbackUrl })}
                    >
                      <FaFacebook className="h-5 w-5 mr-3 text-blue-600" />
                      Continue with Facebook
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 py-1 rounded text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link href="/auth/signup" className="text-emerald-600 hover:underline">
                      Sign up
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="relative hidden w-0 flex-1 lg:block ">
          <img
            alt=""
            src="/cover-image-2.jpg"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* light-theme only gradient overlay: white -> transparent. In dark theme keep transparent */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-transparent dark:from-zinc-900/90" />
        </div>
      </div>
    </>
  );
}