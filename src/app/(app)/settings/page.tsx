
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askGoalForge } from "@/lib/actions";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function SettingsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        // The underlying radix-ui scrollarea doesn't expose a ref to the viewport directly.
        const viewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll"]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const result = await askGoalForge({ question: input });

    if (result.success) {
      const botMessage: Message = { sender: "bot", text: result.success };
      setMessages((prev) => [...prev, botMessage]);
    } else {
      const errorMessage: Message = {
        sender: "bot",
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  }

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

        <Card className="flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle>Ask GoalForge AI</CardTitle>
            <CardDescription>
              Your personal assistant for any questions about your goals or the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={`flex items-start gap-3 ${
                        message.sender === "user" ? "justify-end" : ""
                    }`}
                    >
                    {message.sender === "bot" && (
                        <Avatar className="w-8 h-8">
                        <AvatarFallback>
                            <Bot className="w-5 h-5" />
                        </AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                        message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                    >
                        {message.text}
                    </div>
                    {message.sender === "user" && (
                        <Avatar className="w-8 h-8">
                        <AvatarFallback>
                            <User className="w-5 h-5" />
                        </AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                         <Avatar className="w-8 h-8">
                            <AvatarFallback>
                                <Bot className="w-5 h-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-xs rounded-lg px-4 py-2 text-sm bg-muted flex items-center">
                            <Loader2 className="w-5 h-5 animate-spin"/>
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <div className="relative w-full">
              <Input
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="pr-12"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleSend}
                disabled={isLoading || !input}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
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
