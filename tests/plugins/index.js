import BlockquotePlugin from '../../src/basic-sdk/extension/plugins/blockquote';
import HtmlPlugin from '../../src/basic-sdk/extension/plugins/html';
import ImagePlugin from '../../src/basic-sdk/extension/plugins/image';
import LinkPlugin from '../../src/basic-sdk/extension/plugins/link';
import ListPlugin from '../../src/basic-sdk/extension/plugins/list';
import MarkDownPlugin from '../../src/basic-sdk/extension/plugins/markdown';
import ParagraphPlugin from '../../src/basic-sdk/extension/plugins/paragraph';
import TextPlugin from '../../src/basic-sdk/extension/plugins/text-style';

const Plugins = [
  MarkDownPlugin,
  HtmlPlugin,
  LinkPlugin,
  BlockquotePlugin,
  ListPlugin,
  ImagePlugin,
  TextPlugin,
  ParagraphPlugin,
];

export default Plugins;
