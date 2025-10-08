
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coins } from "lucide-react";
import { badgesData } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAppContext } from "@/contexts/app-context";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WalletPage() {
  const { userProfile } = useAppContext();
  const coins = userProfile?.coins ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">My Wallet & Badges</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-card p-4 shadow-sm border">
              <Coins className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{coins.toLocaleString()}</span>
            </div>
            <p className="text-muted-foreground">
              Coins are earned by completing daily challenges. Use them to unlock advanced features!
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>My Badges</CardTitle>
          <CardDescription>
            Trophies earned for your hard work and dedication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {badgesData.map((badge) => {
                const placeholder = PlaceHolderImages.find(p => p.id === badge.imageId);
                return (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          "flex flex-col items-center gap-2 transition-opacity",
                          !badge.unlocked && "opacity-30"
                        )}
                      >
                        {placeholder && (
                            <Image
                                src={placeholder.imageUrl}
                                alt={badge.name}
                                width={100}
                                height={100}
                                data-ai-hint={placeholder.imageHint}
                                className="rounded-full border-4 border-primary/20"
                            />
                        )}
                        <span className="font-semibold text-center text-sm">{badge.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{badge.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
