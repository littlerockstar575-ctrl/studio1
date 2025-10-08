
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase/provider';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, MailCheck, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isSending, setIsSending] = useState(false);
  
  // This effect will run when the user object changes.
  // When the user verifies their email and the auth state is refreshed,
  // this will redirect them to the dashboard.
  useEffect(() => {
    if (user && user.emailVerified) {
      toast({
        title: 'Email Verified!',
        description: 'Welcome to GoalForge!',
      });
      router.push('/dashboard');
    }
  }, [user, router]);
  
  // This interval check is a fallback for cases where the onAuthStateChanged
  // doesn't fire immediately after verification in another tab.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          router.push('/dashboard');
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [auth, router]);


  const handleResend = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not signed in',
        description: 'You need to be signed in to resend a verification email.',
      });
      return;
    }

    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Email Sent!',
        description: 'A new verification link has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Email',
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  if (isUserLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <MailCheck className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          A verification link has been sent to{' '}
          <span className="font-bold text-foreground">{user?.email}</span>. Please
          check your inbox (and spam folder) to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleResend} className="w-full" disabled={isSending}>
          {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Resend Verification Link
        </Button>
        <p className="text-center text-sm text-muted-foreground">
            After verifying, you can continue to the app.
        </p>
         <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
            Continue to App
        </Button>
      </CardContent>
       <CardFooter className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>
                Sign in with a different account
            </Button>
        </CardFooter>
    </Card>
  );
}
