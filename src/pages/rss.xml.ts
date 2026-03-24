import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: { site: string | URL }) {
    const posts = (await getCollection("blog")).sort(
        (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
    );

    return rss({
        title: "Charlie Bacon",
        description:
            "Blog posts by Charlie Bacon on software engineering, systems work, side projects, and whatever technical rabbit hole I am currently in.",
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/blog/${post.slug}/`,
        })),
        customData: `<language>en-us</language>`,
    });
}
