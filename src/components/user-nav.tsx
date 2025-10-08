
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/provider";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { useAppContext } from "@/contexts/app-context";

export function UserNav() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading, userProfile, isProfileLoading } = useAppContext();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  if (isUserLoading || isProfileLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL ?? "https://i.pravatar.cc/150?u=a042581f4e29026703d"} alt={userProfile?.name ?? "User"} />
            <AvatarFallback>{userProfile?.name?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile?.name ?? 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile?.email ?? ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/settings">
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
