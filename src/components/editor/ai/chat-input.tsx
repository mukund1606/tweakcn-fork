"use client";

import {
  ArrowUp,
  Edit3,
  Loader as LoaderIcon,
  Plus,
  StopCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Loader } from "@/components/loader";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAIChatForm } from "@/hooks/use-ai-chat-form";
import { useAIEnhancePrompt } from "@/hooks/use-ai-enhance-prompt";
import { useChatContext } from "@/hooks/use-chat-context";
import { useGuards } from "@/hooks/use-guards";
import { usePostLoginAction } from "@/hooks/use-post-login-action";
import { MAX_IMAGE_FILES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AIPromptData } from "@/types/ai";

import { AIChatFormBody } from "./ai-chat-form-body";
import { BannerWrapper } from "./alert-banner";
import { EnhancePromptButton } from "./enhance-prompt-button";
import { ImageUploader } from "./image-uploader";

type ThemeGenerationPayload = {
  promptData: AIPromptData;
  options: {
    shouldClearLocalDraft?: boolean;
  };
};

type ChatInputProps = {
  onThemeGeneration: (promptData: AIPromptData) => Promise<void>;
  isGeneratingTheme: boolean;
  onCancelThemeGeneration: () => void;
};

export function ChatInput({
  onThemeGeneration,
  isGeneratingTheme,
  onCancelThemeGeneration,
}: ChatInputProps) {
  const {
    sessions,
    currentSessionId,
    messages,
    startNewChat,
    updateSessionMessages,
    deleteSession,
  } = useChatContext();
  const { checkValidSession, checkValidSubscription } = useGuards();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // Check if current chat is already saved
  const isCurrentChatSaved =
    currentSessionId && sessions.some((session) => session.id === currentSessionId);

  const {
    editorContentDraft,
    handleContentChange,
    promptData,
    isEmptyPrompt,
    clearLocalDraft,
    uploadedImages,
    fileInputRef,
    handleImagesUpload,
    handleImageRemove,
    clearUploadedImages,
    isSomeImageUploading,
    isUserDragging,
    isInitializing,
  } = useAIChatForm();

  const handleNewChat = () => {
    startNewChat();
    clearLocalDraft();
    clearUploadedImages();
  };

  const handleEditChatName = () => {
    if (!checkValidSession("signin")) return;

    if (!currentSessionId) {
      toast.error("No active chat", {
        description: "There is no active chat to rename.",
      });
      return;
    }

    const currentSession = sessions.find((s) => s.id === currentSessionId);

    if (currentSession) {
      setEditTitle(currentSession.title);
      setEditDialogOpen(true);
    }
  };

  const handleConfirmEditChatName = async () => {
    if (!editTitle.trim() || !currentSessionId) return;

    await updateSessionMessages({ id: currentSessionId, title: editTitle.trim() });

    setEditDialogOpen(false);
    setEditTitle("");

    toast.success("Chat renamed!", {
      description: "Your chat name has been updated.",
    });
  };

  const handleDeleteChat = async () => {
    if (!checkValidSession("signin")) return;

    if (!currentSessionId) {
      toast.error("No active chat", {
        description: "There is no active chat to delete.",
      });
      return;
    }

    // Confirm deletion
    if (
      !confirm("Are you sure you want to delete this chat? This action cannot be undone.")
    ) {
      return;
    }

    // Clear messages first to prevent auto-creation of new session
    startNewChat();

    await deleteSession({
      id: currentSessionId,
    });

    toast.success("Chat deleted", {
      description: "The chat has been permanently deleted.",
    });
  };

  const { startEnhance, stopEnhance, enhancedPromptAsJsonContent, isEnhancingPrompt } =
    useAIEnhancePrompt();

  const handleEnhancePrompt = () => {
    if (!checkValidSession() || !checkValidSubscription()) return;

    // Only send images that are not loading, and strip loading property
    const images = uploadedImages
      .filter((img) => !img.loading)
      .map(({ url }) => ({ url }));
    startEnhance({ ...promptData, images });
  };

  const generateTheme = async (payload: ThemeGenerationPayload) => {
    const { promptData, options } = payload;

    if (options.shouldClearLocalDraft) {
      clearLocalDraft();
      clearUploadedImages();
    }

    onThemeGeneration(promptData);
  };

  const handleGenerateSubmit = async () => {
    // Only send images that are not loading, and strip loading property
    const images = uploadedImages
      .filter((img) => !img.loading)
      .map(({ url }) => ({ url }));

    // Proceed only if there is text, or at least one image
    if (isEmptyPrompt && images.length === 0) return;

    const payload: ThemeGenerationPayload = {
      promptData: {
        ...promptData,
        images,
      },
      options: {
        shouldClearLocalDraft: true,
      },
    };

    if (!checkValidSession("signup", "AI_GENERATE_FROM_CHAT", payload)) return;
    if (!checkValidSubscription()) return;

    generateTheme(payload);
  };

  usePostLoginAction("AI_GENERATE_FROM_CHAT", (payload) => {
    generateTheme(payload);
  });

  return (
    <>
      <div className="relative transition-all contain-layout">
        <BannerWrapper show={isGeneratingTheme}>
          <div className="flex size-full items-center gap-1.5">
            <LoaderIcon className="size-2.5 animate-spin" />
            <Loader variant="text-shimmer" text="Generating..." size="sm" />
          </div>
        </BannerWrapper>

        <div className="bg-background relative isolate z-10 flex size-full min-h-[100px] flex-1 flex-col gap-2 overflow-hidden rounded-lg border p-2 shadow-xs">
          <AIChatFormBody
            isUserDragging={isUserDragging}
            disabled={isEnhancingPrompt}
            canSubmit={
              !isGeneratingTheme &&
              !isEnhancingPrompt &&
              !isEmptyPrompt &&
              !isSomeImageUploading &&
              !isInitializing
            }
            uploadedImages={uploadedImages}
            handleImagesUpload={handleImagesUpload}
            handleImageRemove={handleImageRemove}
            handleContentChange={handleContentChange}
            handleGenerate={handleGenerateSubmit}
            initialEditorContent={editorContentDraft ?? undefined}
            textareaKey={editorContentDraft ? "with-draft" : "no-draft"}
            externalEditorContent={enhancedPromptAsJsonContent}
            isStreamingContent={isEnhancingPrompt}
          />
          <div className="@container/form flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isCurrentChatSaved && (
                <TooltipWrapper label="Edit chat name" asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditChatName}
                    disabled={isGeneratingTheme || isEnhancingPrompt || isInitializing}
                    className="flex items-center gap-1.5 shadow-none"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span className="hidden @md/form:inline">Edit name</span>
                  </Button>
                </TooltipWrapper>
              )}

              <TooltipWrapper label="Delete current chat" asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteChat}
                  disabled={
                    isGeneratingTheme ||
                    isEnhancingPrompt ||
                    isInitializing ||
                    !currentSessionId
                  }
                  className="text-destructive hover:text-destructive flex items-center gap-1.5 shadow-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden @md/form:inline">Delete chat</span>
                </Button>
              </TooltipWrapper>

              <TooltipWrapper label="Create new chat" asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  disabled={
                    isGeneratingTheme ||
                    isEnhancingPrompt ||
                    isInitializing ||
                    messages.length === 0
                  }
                  className="flex items-center gap-1.5 shadow-none"
                >
                  <Plus />
                  <span className="hidden @md/form:inline">New chat</span>
                </Button>
              </TooltipWrapper>
            </div>

            <div className="flex items-center gap-2">
              {promptData?.content ? (
                <EnhancePromptButton
                  isEnhancing={isEnhancingPrompt}
                  onStart={handleEnhancePrompt}
                  onStop={stopEnhance}
                  disabled={isGeneratingTheme || isInitializing}
                />
              ) : null}

              <ImageUploader
                fileInputRef={fileInputRef}
                onImagesUpload={handleImagesUpload}
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  isGeneratingTheme ||
                  isEnhancingPrompt ||
                  isInitializing ||
                  uploadedImages.some((img) => img.loading) ||
                  uploadedImages.length >= MAX_IMAGE_FILES
                }
              />

              {isGeneratingTheme ? (
                <TooltipWrapper label="Cancel generation" asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onCancelThemeGeneration}
                    className={cn(
                      "flex items-center gap-1.5 shadow-none",
                      "@max-[350px]/form:w-8",
                    )}
                  >
                    <StopCircle />
                    <span className="hidden @[350px]/form:inline-flex">Stop</span>
                  </Button>
                </TooltipWrapper>
              ) : (
                <TooltipWrapper label="Send message" asChild>
                  <Button
                    size="sm"
                    className="size-8 shadow-none"
                    onClick={handleGenerateSubmit}
                    disabled={
                      isEmptyPrompt ||
                      isSomeImageUploading ||
                      isGeneratingTheme ||
                      isEnhancingPrompt ||
                      isInitializing
                    }
                  >
                    {isGeneratingTheme ? (
                      <LoaderIcon className="animate-spin" />
                    ) : (
                      <ArrowUp />
                    )}
                  </Button>
                </TooltipWrapper>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Chat Name Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Chat Name</DialogTitle>
            <DialogDescription>
              Update the name for your current chat session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-chat-title">Chat Name</Label>
              <Input
                id="edit-chat-title"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                }}
                placeholder="Enter chat name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmEditChatName();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmEditChatName}
              disabled={!editTitle.trim()}
            >
              Update Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
