import { ORPCError } from "@orpc/client";
import { desc, eq } from "drizzle-orm";
import z from "zod";

import type { ChatMessage } from "@/types/ai";
import { db } from "@/db";
import { chatSession } from "@/db/schema";
import { protectedProcedure, publicProcedure } from "@/server/orpc/procedures";

export const chat = {
  get: publicProcedure.handler(async ({ context }) => {
    if (!context.session) {
      return [];
    }

    const sessions = await db
      .select()
      .from(chatSession)
      .where(eq(chatSession.userId, context.session.user.id))
      .orderBy(desc(chatSession.createdAt));

    return sessions;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        messages: z.array(z.custom<ChatMessage>()),
      }),
    )
    .handler(async ({ input, context }) => {
      const { title, messages } = input;
      const userId = context.session.user.id;
      const now = new Date();
      const sessionId = crypto.randomUUID();

      const newSession = await db
        .insert(chatSession)
        .values({
          id: sessionId,
          userId,
          title,
          messages,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const session = newSession[0];

      return session;
    }),

  update: protectedProcedure
    .input(
      z
        .object({
          title: z.string().min(1),
          messages: z.array(z.custom<ChatMessage>()),
        })
        .partial()
        .extend({
          id: z.string().min(1),
        }),
    )
    .handler(async ({ input, context }) => {
      const { id: sessionId, title, messages } = input;
      const userId = context.session.user.id;

      // First check if the session belongs to the user
      const existingSession = await db
        .select()
        .from(chatSession)
        .where(eq(chatSession.id, sessionId))
        .limit(1);

      if (existingSession.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Session not found",
        });
      }

      if (existingSession[0]?.userId !== userId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Unauthorized",
        });
      }

      const updateData: {
        title?: string;
        messages?: Array<ChatMessage>;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (title !== undefined) {
        updateData.title = title;
      }

      if (messages !== undefined) {
        updateData.messages = messages;
      }

      const updatedSession = await db
        .update(chatSession)
        .set(updateData)
        .where(eq(chatSession.id, sessionId))
        .returning();

      return updatedSession[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const { id: sessionId } = input;
      const userId = context.session.user.id;

      const existingSession = await db
        .select()
        .from(chatSession)
        .where(eq(chatSession.id, sessionId))
        .limit(1);

      if (existingSession.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Session not found",
        });
      }

      if (existingSession[0]?.userId !== userId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Unauthorized",
        });
      }

      await db.delete(chatSession).where(eq(chatSession.id, sessionId));

      return { success: true };
    }),
};
