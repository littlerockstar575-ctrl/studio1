
'use client';

import { AppProvider } from '@/contexts/app-context';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      // If loading is finished and there's no user, redirect to login.
      router.push('/login');
    } else if (user && !user.emailVerified) {
      // If there is a user but their email is not verified, redirect.
      router.push('/verify-email');
    }
  }, [user, isUserLoading, router]);

  // While checking auth state, show a loader.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If user is logged in and verified, render the app layout
  if (user && user.emailVerified) {
    return (
        <AppProvider>
            <FirebaseErrorListener />
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar />
            <div className="flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                {children}
                </main>
            </div>
            </div>
        </AppProvider>
    );
  }

  // Fallback, in case redirect hasn't happened yet.
  return null;
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </FirebaseClientProvider>
  );
}
