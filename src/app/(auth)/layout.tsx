
import { FirebaseClientProvider } from "@/firebase/client-provider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <main className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
              <h1 className="text-xl font-bold text-foreground">GoalForge</h1>
          </div>
          {children}
        </div>
      </main>
    </FirebaseClientProvider>
  );
}
