
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View and manage your account details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for future account settings */}
            <p className="text-muted-foreground">
              Account management settings will be available here in a future update.
            </p>
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
