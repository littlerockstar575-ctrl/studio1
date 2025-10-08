
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
import { Send, User, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askGoalForge } from "@/lib/actions";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
}

export default function AskAiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll"]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { id: Date.now(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const question = input;
    setInput("");
    setIsLoading(true);
    
    // Give a slight delay to show the user message before the bot "thinks"
    setTimeout(scrollToBottom, 100);

    const result = await askGoalForge({ question });

    setIsLoading(false);

    if (result.success) {
      const botMessageId = Date.now();
      const initialBotMessage: Message = { id: botMessageId, sender: "bot", text: "" };
      setMessages((prev) => [...prev, initialBotMessage]);

      // Simulate typing effect
      let currentIndex = 0;
      const responseText = result.success;
      const interval = setInterval(() => {
        if (currentIndex < responseText.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: responseText.substring(0, currentIndex + 1) }
                : msg
            )
          );
          currentIndex++;
          scrollToBottom();
        } else {
          clearInterval(interval);
        }
      }, 20); // Adjust typing speed here (ms per character)

    } else {
      const errorMessage: Message = {
        id: Date.now(),
        sender: "bot",
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
        handleSend();
    }
  }

  return (
     <div className="flex flex-col h-full">
        <div className="flex items-center mb-6">
            <h1 className="text-lg font-semibold md:text-2xl">Ask GoalForge AI</h1>
        </div>
        <Card className="flex flex-col flex-grow">
          <CardHeader>
            <CardTitle>Your Personal Assistant</CardTitle>
            <CardDescription>
              Ask any questions about your goals or the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                {messages.map((message) => (
                    <div
                    key={message.id}
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
                        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 text-sm ${
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
                        <div className="max-w-xs rounded-lg px-4 py-2 text-sm bg-muted flex items-center space-x-1">
                            <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse"></span>
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
    </div>
  );
}
