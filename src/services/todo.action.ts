"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { TodoSchema } from "@/schemas/todo";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const addTodo = async (values: z.infer<typeof TodoSchema>) => {
  const validatedFields = TodoSchema.safeParse(values);
  if (!validatedFields.success) return;
  const { title, description, dueDate, status, priority, document, tags } =
    validatedFields.data;
  const { user } = await auth();
  await prisma.todo.create({
    data: {
      userId: user.id,
      title,
      description,
      priority,
      status,
      dueDate,
      document,
      todoTags: {
        create: tags?.map((tagId) => ({
          tag: {
            connect: {
              id: tagId,
            },
          },
        })),
      },
    },
  });

  revalidatePath("/dashboard");
};
