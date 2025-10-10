"use client";

import { useChat } from "@ai-sdk/react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import type { RouterInputs, RouterOutputs } from "@/server/orpc";
import type { ChatMessage } from "@/types/ai";
import { parseAiSdkTransportError } from "@/lib/ai/parse-ai-sdk-transport-error";
import { useORPC } from "@/orpc/context";
import { applyGeneratedTheme } from "@/utils/ai/apply-theme";

type ChatContext = {
  startNewChat: () => void;
  resetMessagesUpToIndex: (index: number) => void;
  currentSessionId: string | null;
  sessions: RouterOutputs["chat"]["get"];
  setCurrentSession: (sessionId: string | null) => void;
  updateSessionMessages: (
    input: RouterInputs["chat"]["update"],
  ) => Promise<RouterOutputs["chat"]["update"]>;
  createNewSession: (
    input: RouterInputs["chat"]["create"],
  ) => Promise<RouterOutputs["chat"]["create"]>;
  deleteSession: (
    input: RouterInputs["chat"]["delete"],
  ) => Promise<RouterOutputs["chat"]["delete"]>;
  duplicateSession: (sessionId: string) => Promise<string | null>;
} & ReturnType<typeof useChat<ChatMessage>>;

const ChatContext = createContext<ChatContext | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const orpc = useORPC();
  const queryClient = useQueryClient();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const { data: sessions } = useSuspenseQuery(orpc.chat.get.queryOptions());

  const { mutateAsync: updateSessionMessages } = useMutation(
    orpc.chat.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.chat.get.queryKey() });
      },
    }),
  );

  const { mutateAsync: createNewSession } = useMutation(
    orpc.chat.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: orpc.chat.get.queryKey() });
        setCurrentSessionId(data.id);
      },
    }),
  );

  const { mutateAsync: deleteSession } = useMutation(
    orpc.chat.delete.mutationOptions({
      onSuccess: async () => {
        setCurrentSessionId(null);
        await queryClient.invalidateQueries({ queryKey: orpc.chat.get.queryKey() });
      },
    }),
  );

  const chat = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/generate-theme",
    }),
    onError: (error) => {
      const defaultMessage = "Failed to generate theme. Please try again.";
      const normalizedError = parseAiSdkTransportError(error, defaultMessage);

      toast.error("An error occurred", {
        description: normalizedError.message,
      });
    },
    onData: (dataPart) => {
      const { type, data } = dataPart;
      if (type === "data-generated-theme-styles") {
        if (data.status === "ready") {
          applyGeneratedTheme(data.themeStyles);
        }
      }
    },
  });

  const setCurrentSession = useCallback(
    (sessionId: string | null) => {
      if (currentSessionId === sessionId) return;
      const hasSession = sessions.find((s) => s.id === sessionId);
      if (!hasSession) return;
      setCurrentSessionId(sessionId);
      chat.setMessages(sessions.find((s) => s.id === sessionId)?.messages || []);
    },
    [chat, sessions, currentSessionId],
  );

  const startNewChat = useCallback(() => {
    // Clear the chat and reset current session
    chat.stop();
    chat.setMessages([]);
    setCurrentSession(null);
  }, [chat, setCurrentSession]);

  const resetMessagesUpToIndex = useCallback(
    (index: number) => {
      const newMessages = chat.messages.slice(0, index);
      chat.setMessages(newMessages);
    },
    [chat],
  );

  const duplicateSession = useCallback(
    async (sessionId: string) => {
      try {
        const originalSession = sessions.find((s) => s.id === sessionId);

        if (!originalSession) {
          throw new Error("Session not found");
        }

        const duplicateTitle = `${originalSession.title} (Duplicate)`;

        const duplicatedSession = await createNewSession({
          title: duplicateTitle,
          messages: originalSession.messages,
        });

        setCurrentSession(duplicatedSession.id);

        toast.success("Success", {
          description: "Chat session duplicated",
        });

        return duplicatedSession.id;
      } catch (error) {
        console.error("Error duplicating chat session:", error);
        toast.error("Error", {
          description: "Failed to duplicate chat session",
        });
        return null;
      }
    },
    [sessions, createNewSession, setCurrentSession],
  );

  useEffect(() => {
    // Handle chat session creation and updates
    if (chat.status === "ready" || chat.status === "error") {
      // Create a new session when first message is sent and no session exists
      if (!currentSessionId && chat.messages.length > 0) {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const time = now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const title = `Chat (${day}/${month}/${year} ${time})`;
        createNewSession({ title, messages: chat.messages });
        return;
      }

      // Update existing session messages
      if (currentSessionId) {
        const newMessages = chat.messages;
        const currentSession = sessions.find((s) => s.id === currentSessionId);
        if (JSON.stringify(currentSession?.messages) === JSON.stringify(newMessages))
          return;
        updateSessionMessages({ id: currentSessionId, messages: newMessages });
      }
    }
  }, [
    sessions,
    chat.messages,
    chat.status,
    createNewSession,
    currentSessionId,
    updateSessionMessages,
  ]);

  return (
    <ChatContext.Provider
      value={{
        ...chat,
        sessions,
        currentSessionId,
        startNewChat,
        deleteSession,
        duplicateSession,
        createNewSession,
        setCurrentSession,
        updateSessionMessages,
        resetMessagesUpToIndex,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within an ChatProvider");
  }
  return ctx;
}
