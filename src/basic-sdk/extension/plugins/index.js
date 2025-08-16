import BlockquotePlugin from './blockquote';
import HtmlPlugin from './html';
import ImagePlugin from './image';
import LinkPlugin from './link';
import ListPlugin from './list';
import MarkDownPlugin from './markdown';
import MentionPlugin from './mention';
import ParagraphPlugin from './paragraph';
import TextPlugin from './text-style';

const CommentPlugins = [
  MarkDownPlugin,
  HtmlPlugin,
  ParagraphPlugin,
  TextPlugin,
  ListPlugin,
  ImagePlugin,
  LinkPlugin,
  MentionPlugin,
  BlockquotePlugin,
];
export {
  MarkDownPlugin,
  LinkPlugin,
  BlockquotePlugin,
  ListPlugin,
  ImagePlugin,
  TextPlugin,
  HtmlPlugin,
  ParagraphPlugin,
  MentionPlugin,
  CommentPlugins,
};
