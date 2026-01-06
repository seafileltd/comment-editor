import rehypeFormat from 'rehype-format';
import mathjax from 'rehype-mathjax/browser';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import breaks from 'remark-breaks';
import math from 'remark-math';
import markdown from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import sanitizeSchema from './sanitize-schema';

function remarkEscapeHtml() {
  return (tree) => {
    visit(tree, 'html', (node) => {
      node.type = 'text';
    });
  };
}

// mdString -> mdast -> html ast -> html
const processor = unified()
  // Handles markdown basic syntax
  // https://github.com/remarkjs/remark/tree/main
  .use(markdown)
  .use(remarkEscapeHtml)
  // Handle markdown extension syntax
  // https://github.com/remarkjs/remark-gfm
  // .use(gfm)
  // https://github.com/remarkjs/remark-math
  .use(math)
  // https://github.com/remarkjs/remark-breaks
  .use(breaks)
  .use(remarkRehype, { allowDangerousHtml: true }) // convert mdast -> hast
  // https://www.npmjs.com/package/rehype-mathjax
  .use(mathjax, { displayMath: ['$$', '$$'] })
  // https://www.npmjs.com/package/rehype-raw
  .use(rehypeRaw)
  // https://www.npmjs.com/package/rehype-format
  .use(rehypeFormat, { blanks: ['pre', 'code'] })
  // https://github.com/rehypejs/rehype-slug
  .use(rehypeSlug)
  // https://github.com/rehypejs/rehype-sanitize
  .use(rehypeSanitize, sanitizeSchema)
  // https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify
  .use(rehypeStringify);

// transform rules: https://github.com/syntax-tree/mdast-util-to-hast

export default processor;
