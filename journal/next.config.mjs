import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'

const isProd = process.env.NODE_ENV === 'production'

// `*.dev.tsx` / `*.dev.ts` routes exist only while running `next dev`.
// The local admin lives behind this switch, so it can never ship to production.
const pageExtensions = isProd
  ? ['ts', 'tsx', 'mdx']
  : ['dev.ts', 'dev.tsx', 'ts', 'tsx', 'mdx']

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isProd ? 'export' : undefined,
  pageExtensions,
  images: { unoptimized: true },
  trailingSlash: false,
  reactStrictMode: true,
  // This app is self-contained even though the repo holds another project.
  outputFileTracingRoot: import.meta.dirname,
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: { light: 'min-light', dark: 'min-dark' },
          keepBackground: false,
        },
      ],
    ],
  },
})

export default withMDX(nextConfig)
