"use client";

import {
  ChevronDown,
  Copy,
  Edit3,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import type { RouterOutputs } from "@/server/orpc";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatContext } from "@/hooks/use-chat-context";
import { cn } from "@/lib/utils";

type ChatHistorySidebarProps = {
  className?: string;
  onSessionSelect?: (session: RouterOutputs["chat"]["get"][number]) => void;
};

export function ChatHistorySidebar({
  className,
  onSessionSelect,
}: ChatHistorySidebarProps) {
  const {
    sessions,
    currentSessionId,
    setCurrentSession,
    deleteSession,
    updateSessionMessages,
    duplicateSession,
  } = useChatContext();

  const { startNewChat } = useChatContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleNewChat = () => {
    startNewChat();
    setOpen(false);
  };

  const handleSessionSelect = (session: RouterOutputs["chat"]["get"][number]) => {
    setCurrentSession(session.id);
    onSessionSelect?.(session);
    setOpen(false);
    setSearch("");
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    void deleteSession({ id: sessionId });
  };

  const handleEditTitle = (
    session: RouterOutputs["chat"]["get"][number],
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveTitle = async () => {
    if (editingSessionId && editTitle.trim()) {
      await updateSessionMessages({ id: editingSessionId, title: editTitle.trim() });
    }
    setEditingSessionId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  const handleDuplicateSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateSession(sessionId);
    setOpen(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn("group relative w-full justify-between md:min-w-56", className)}
        >
          <div className="flex w-full items-center gap-3 overflow-hidden">
            <MessageSquare className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <span className="truncate text-left font-medium capitalize">
              {currentSession?.title ?? "No active chat"}
            </span>
          </div>
          <ChevronDown className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command className="h-full w-full">
          <div className="flex w-full items-center">
            <div className="flex w-full items-center border-b px-3 py-1">
              <Search className="size-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search chats..."
                className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-muted-foreground text-sm">
              {filteredSessions.length} chat{filteredSessions.length !== 1 ? "s" : ""}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="h-8 gap-1.5 px-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs">New Chat</span>
            </Button>
          </div>
          <Separator />
          <ScrollArea className="h-[400px] max-h-[60vh]">
            <CommandEmpty>No chats found.</CommandEmpty>

            <CommandGroup>
              {filteredSessions.length === 0 && search.trim() === "" && (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                  <p className="mt-1 text-xs">Start a new conversation</p>
                </div>
              )}

              {filteredSessions.map((session) => (
                <CommandItem
                  key={session.id}
                  value={session.title}
                  onSelect={() => {
                    handleSessionSelect(session);
                  }}
                  className="group data-[highlighted]:bg-secondary/50 flex items-center gap-2 py-3"
                >
                  <MessageSquare className="text-muted-foreground h-4 w-4 flex-shrink-0" />

                  <div className="min-w-0 flex-1">
                    {editingSessionId === session.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => {
                            setEditTitle(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle();
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          onBlur={handleSaveTitle}
                          className="h-6 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="truncate text-sm font-medium">{session.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(new Date(session.updatedAt))} •{" "}
                          {session.messages.length} messages
                        </p>
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => handleDuplicateSession(session.id, e)}
                        className="cursor-pointer"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          handleEditTitle(session, e);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem
                        onClick={(e) => {
                          handleDeleteSession(session.id, e);
                        }}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
