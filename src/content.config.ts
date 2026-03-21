import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    mastodonCommentUrl: z.string().url().optional(),
  }),
});

export const collections = { blog };
