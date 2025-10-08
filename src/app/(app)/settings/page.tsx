
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/app-context";
import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAppContext();
  const userId = user?.uid;

  const copyToClipboard = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      toast({
        title: "Copied!",
        description: "Your User ID has been copied to the clipboard.",
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your User ID</CardTitle>
            <CardDescription>
              Share this ID with friends so they can add you on GoalForge.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userId ? (
               <div className="relative">
                 <Label htmlFor="userId" className="sr-only">User ID</Label>
                 <Input id="userId" value={userId} readOnly />
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                 </Button>
               </div>
            ) : (
                <p className="text-muted-foreground">Loading your user ID...</p>
            )}
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Reset Application</CardTitle>
                <CardDescription>
                    Warning: This will reset all your goals, progress, and coins. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Button variant="destructive">Reset Application Data</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
