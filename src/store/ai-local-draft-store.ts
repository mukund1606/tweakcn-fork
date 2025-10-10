import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { JSONContent } from "@tiptap/react";

import { idbStorage } from "./idb-storage";

type AILocalDraftStore = {
  editorContentDraft: JSONContent | null;
  setEditorContentDraft: (content: JSONContent | null) => void;
  imagesDraft: Array<{ url: string }>;
  setImagesDraft: (imagesDraft: Array<{ url: string }>) => void;
  clearLocalDraft: () => void;
};

export const useAILocalDraftStore = create<AILocalDraftStore>()(
  persist(
    (set) => ({
      editorContentDraft: null,
      setEditorContentDraft: (content) => set({ editorContentDraft: content }),
      imagesDraft: [],
      setImagesDraft: (images) => set({ imagesDraft: images }),
      clearLocalDraft: () => set({ editorContentDraft: null, imagesDraft: [] }),
    }),
    {
      name: "ai-local-draft-store",
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
