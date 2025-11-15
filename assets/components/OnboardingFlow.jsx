'use client'
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const provinces = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Limpopo", "Mpumalanga", "Northern Cape", "North West"
];

export default function OnboardingFlow() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    storename: session?.user?.name || '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    about: '',
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.storename || formData.storename.length < 3) {
        newErrors.storename = 'Store name must be at least 3 characters';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
    }

    if (step === 2) {
      if (!formData.address) {
        newErrors.address = 'Address is required';
      }
      if (!formData.city) {
        newErrors.city = 'City is required';
      }
      if (!formData.province) {
        newErrors.province = 'Province is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isOnboarded: true,
          onboardingStep: totalSteps,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

      // Update session to reflect onboarding status
      await update({
        ...session,
        user: {
          ...session.user,
          isOnboarded: true,
        }
      });
      
      // Force a small delay to ensure session update completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard with replace to prevent back navigation
      window.location.href = '/dashboard';
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error);
      setErrors({ submit: error.message || 'Failed to save profile. Please try again.' });
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
      <div className="hidden sm:block absolute inset-0 bg-cover bg-center bg-repeat" style={{backgroundImage: "url('/onboarding.jpeg')"}} />
      <div className="sm:hidden absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://plus.unsplash.com/premium_photo-1692444603382-a048297312f5?q=80&w=415&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}} />

      <div className="absolute inset-0 bg-zinc-50/30 dark:bg-black/40" />
      <div className="relative z-10 w-full max-w-6xl px-4">
      <Card className="border-none bg-zinc-300/10 backdrop-blur-md shadow-lg dark:bg-black/40 dark:backdrop-blur-md px-6 py-6 sm:px-10 lg:px-16 lg:py-6 lg:mt-10 max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Welcome! </CardTitle>
              <span className="text-sm font-semibold text-emerald-600 ml-4">Step {currentStep} of {totalSteps}</span>
          </div>
          <CardTitle className="text-2xl">Let's Set Up Your Store</CardTitle>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="storename">Store Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="storename"
                      value={formData.storename}
                      onChange={(e) => handleChange('storename', e.target.value)}
                      placeholder="My Awesome Store"
                      className={errors.storename ? 'border-red-500' : ''}
                    />
                    {errors.storename && (
                      <p className="text-sm text-red-500 mt-1">{errors.storename}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      This is how customers will find you
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="0123456789"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in-50">
              <h3 className="text-lg font-semibold mb-4">Location Details</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Main Street"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Johannesburg"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="zipCode">Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleChange('zipCode', e.target.value)}
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="province">Province <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => handleChange('province', value)}
                  >
                    <SelectTrigger className={errors.province ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov} value={prov}>
                          {prov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.province && (
                    <p className="text-sm text-red-500 mt-1">{errors.province}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: About & Finish */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in-50">
              <h3 className="text-lg font-semibold mb-4">Tell Us About Your Store</h3>
              
              <div>
                <Label htmlFor="about">About Your Store (Optional)</Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => handleChange('about', e.target.value)}
                  placeholder="Share what makes your store special..."
                  className="h-32 resize-none"
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.about.length}/500 characters
                </p>
              </div>

              {errors.submit && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-md">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-emerald-900 dark:text-emerald-100">
                      You're all set!
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                      Click finish to start selling on the platform
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Saving...' : 'Finish & Start Selling'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}