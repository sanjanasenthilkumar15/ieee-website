import Image from "next/image";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import type { RichText as RichTextValue } from "@/lib/content/types";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="my-4 leading-relaxed">{children}</p>,
    h2: ({ children }) => <h2 className="mt-10 mb-3 text-2xl font-bold">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 mb-2 text-xl font-bold">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-rmkec-green bg-surface py-3 pr-4 pl-5 italic">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6">{children}</ul>,
    number: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6">{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
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
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt ?? ""}
            width={1200}
            height={800}
            sizes="(min-width: 768px) 720px, 100vw"
            className="photo-grade h-auto w-full rounded-md"
          />
          {value.caption && <figcaption className="mt-2 text-sm text-muted">{value.caption}</figcaption>}
        </figure>
      );
    },
  },
};

export function RichText({ value }: { value?: RichTextValue }) {
  if (!value?.length) return null;
  return (
    <div className="text-[17px] text-body">
      <PortableText value={value} components={components} />
    </div>
  );
}
