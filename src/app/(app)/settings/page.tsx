"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalSetter } from "@/components/goal-setter";
import { useAppContext } from "@/contexts/app-context";

export default function SettingsPage() {
    const { goal } = useAppContext();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
            </div>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Update Your Goal</CardTitle>
                        <CardDescription>
                           Currently working on: <span className="font-semibold text-primary">{goal}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GoalSetter isUpdate={true} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
