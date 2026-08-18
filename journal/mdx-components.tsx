import type { MDXComponents } from 'mdx/types'
import type { ComponentPropsWithoutRef } from 'react'

/**
 * Global MDX component mapping. Tables get a scroll container so a wide table
 * can never make the page itself scroll sideways.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    table: (props: ComponentPropsWithoutRef<'table'>) => (
      <div className="scroll-x">
        <table {...props} />
      </div>
    ),
    ...components,
  }
}
