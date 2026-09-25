import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { BlogBrowser } from "@/components/filters/BlogBrowser";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPosts } from "@/lib/content";


export const metadata: Metadata = {
  title: "Blog & Newsletter",
  description: "Articles, event reports, student stories, newsletters and resources from IEEE SB RMKEC.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader
        title="Blog & Newsletter"
        crumbs={[{ label: "Blog" }]}
        intro="Articles, event reports, student stories, newsletters and learning resources from the branch."
      />
      <section className="py-12 sm:py-16">
        <Container>
          {posts.length ? <BlogBrowser posts={posts} /> : <EmptyState title="No posts yet">The first articles are on their way.</EmptyState>}
        </Container>
      </section>
    </>
  );
}
