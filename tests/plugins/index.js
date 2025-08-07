import BlockquotePlugin from '../../src/basic-sdk/extension/plugins/blockquote';
import CalloutPlugin from '../../src/basic-sdk/extension/plugins/callout';
import CheckListPlugin from '../../src/basic-sdk/extension/plugins/check-list';
import CodeBlockPlugin from '../../src/basic-sdk/extension/plugins/code-block';
import FileLinkPlugin from '../../src/basic-sdk/extension/plugins/file-link';
import FontPlugin from '../../src/basic-sdk/extension/plugins/font';
import HeaderPlugin from '../../src/basic-sdk/extension/plugins/header';
import HtmlPlugin from '../../src/basic-sdk/extension/plugins/html';
import ImagePlugin from '../../src/basic-sdk/extension/plugins/image';
import LinkPlugin from '../../src/basic-sdk/extension/plugins/link';
import ListPlugin from '../../src/basic-sdk/extension/plugins/list';
import MarkDownPlugin from '../../src/basic-sdk/extension/plugins/markdown';
import ParagraphPlugin from '../../src/basic-sdk/extension/plugins/paragraph';
import SdocLinkPlugin from '../../src/basic-sdk/extension/plugins/sdoc-link';
import TablePlugin from '../../src/basic-sdk/extension/plugins/table';
import TextAlignPlugin from '../../src/basic-sdk/extension/plugins/text-align';
import TextPlugin from '../../src/basic-sdk/extension/plugins/text-style';
import VideoPlugin from '../../src/basic-sdk/extension/plugins/video';

const Plugins = [
  MarkDownPlugin,
  HtmlPlugin,
  HeaderPlugin,
  LinkPlugin,
  BlockquotePlugin,
  ListPlugin,
  CheckListPlugin,
  CodeBlockPlugin,
  ImagePlugin,
  VideoPlugin,
  TablePlugin,
  TextPlugin,
  TextAlignPlugin,
  FontPlugin,
  SdocLinkPlugin,
  ParagraphPlugin,
  FileLinkPlugin,
  CalloutPlugin,
];

export default Plugins;
