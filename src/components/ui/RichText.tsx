import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders the Markdown written in the admin panel (headings, lists, bold,
 * italics, links, quotes, tables). Raw HTML is never rendered, so content
 * can't inject scripts.
 */
const components: Components = {
  p: ({ children }) => <p className="my-4 leading-relaxed">{children}</p>,
  h1: ({ children }) => <h2 className="mt-10 mb-3 text-2xl font-bold">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-10 mb-3 text-2xl font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 mb-2 text-xl font-bold">{children}</h3>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-rmkec-green bg-surface py-1 pr-4 pl-5 italic">{children}</blockquote>
  ),
  a: ({ href = "#", children }) => {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className="font-medium text-ieee-blue underline underline-offset-2 hover:text-ieee-blue-dark"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-line bg-surface px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-line px-3 py-2">{children}</td>,
  img: ({ src, alt }) =>
    // eslint-disable-next-line @next/next/no-img-element
    typeof src === "string" ? <img src={src} alt={alt ?? ""} className="photo-grade my-6 h-auto w-full rounded-md" /> : null,
};

export function RichText({ value }: { value?: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="text-[17px] text-body">
      <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {value}
      </Markdown>
    </div>
  );
}
