export type BlockType =
  | 'heading'
  | 'text'
  | 'readaloud'
  | 'image'
  | 'accordion'
  | 'list'
  | 'infobox'
  | 'profile';

export type Visibility = 'player' | 'gm' | 'draft';
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type ImageAlignment = 'left' | 'center' | 'right' | 'full';
export type TextFlow = 'block' | 'wrap';

export interface MediaItem {
  url: string;
  alt: string;
  caption: string;
  width: string;
  alignment: ImageAlignment;
  textFlow: TextFlow;
}

export const defaultMedia = (): MediaItem => ({
  url: '',
  alt: '',
  caption: '',
  width: '100%',
  alignment: 'center',
  textFlow: 'block',
});

export interface BlockBase {
  id: string;
  type: BlockType;
  visibility: Visibility;
  tags: string[];
  hiddenFromExport: boolean;
}

export interface HeadingBlock extends BlockBase {
  type: 'heading';
  level: HeadingLevel;
  text: string;
  align: TextAlign;
}

export interface TextBlock extends BlockBase {
  type: 'text';
  content: string;
  align: TextAlign;
  media?: MediaItem;
}

export interface ReadaloudBlock extends BlockBase {
  type: 'readaloud';
  content: string;
  media?: MediaItem;
}

export interface ImageBlock extends BlockBase {
  type: 'image';
  media: MediaItem;
}

export interface AccordionItem {
  id: string;
  summary: string;
  content: string;
}

export interface AccordionBlock extends BlockBase {
  type: 'accordion';
  title: string;
  items: AccordionItem[];
  defaultOpen: boolean;
}

export interface ListItem {
  id: string;
  text: string;
}

export interface ListBlock extends BlockBase {
  type: 'list';
  ordered: boolean;
  items: ListItem[];
}

export interface InfoboxBlock extends BlockBase {
  type: 'infobox';
  title: string;
  content: string;
  media?: MediaItem;
  variant: 'info' | 'warning' | 'tip' | 'lore';
}

export interface ProfileBlock extends BlockBase {
  type: 'profile';
  name: string;
  subtitle: string;
  actorRef: string;
  description: string;
  media?: MediaItem;
  quotes: string;
  gmDetails: string;
  gmPersonality: string;
  gmConnections: string;
  defaultOpen: boolean;
  headingLevel: HeadingLevel | 'none';
  labelMode: 'label' | 'heading';
  labelQuotes: string;
  labelGmDetails: string;
  labelGmPersonality: string;
  labelGmConnections: string;
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ReadaloudBlock
  | ImageBlock
  | AccordionBlock
  | ListBlock
  | InfoboxBlock
  | ProfileBlock;

export interface Entry {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  order: number;
  exportTitleAsHeading: boolean;
  headingLevel: HeadingLevel;
  blocks: Block[];
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  template: string;
  tags: string[];
  entries: Entry[];
}

export interface StyleTokens {
  backgroundColor: string;
  surfaceColor: string;
  panelColor: string;
  textColor: string;
  mutedTextColor: string;
  headingColor: string;
  accentColor: string;
  borderColor: string;
  linkColor: string;
  readaloudBg: string;
  readaloudBorder: string;
  fontFamily: string;
  headingFontFamily: string;
  googleFontBody: string;
  googleFontHeading: string;
  borderRadius: string;
  padding: string;
  sectionSpacing: string;
  borderWidth: string;
  shadow: string;
  imageRadius: string;
  headingTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  headingLetterSpacing: string;
  customCSS: string;
}

export interface JFStyle {
  id: string;
  name: string;
  tokens: StyleTokens;
}

export interface ExportSettings {
  moduleId: string;
  moduleTitle: string;
  moduleDescription: string;
  moduleVersion: string;
  authorName: string;
  minFoundryVersion: string;
  verifiedFoundryVersion: string;
  requiresModules: Array<{ id: string; manifest: string }>;
}

export interface Project {
  id: string;
  name: string;
  collections: Collection[];
  styles: JFStyle[];
  activeStyleId: string;
  exportSettings: ExportSettings;
  createdAt: string;
  updatedAt: string;
}

export const defaultStyleTokens = (): StyleTokens => ({
  backgroundColor: '#1a1a2e',
  surfaceColor: '#16213e',
  panelColor: '#0f3460',
  textColor: '#dde1e8',
  mutedTextColor: '#8892a4',
  headingColor: '#d4a853',
  accentColor: '#7c6af0',
  borderColor: '#2a3050',
  linkColor: '#6eb5e8',
  readaloudBg: '#0d1f3c',
  readaloudBorder: '#3a5f8a',
  fontFamily: "'Noto Sans', sans-serif",
  headingFontFamily: "'Cinzel', serif",
  googleFontBody: 'Noto Sans',
  googleFontHeading: 'Cinzel',
  borderRadius: '6px',
  padding: '1rem',
  sectionSpacing: '1.5rem',
  borderWidth: '1px',
  shadow: '0 2px 8px rgba(0,0,0,0.4)',
  imageRadius: '4px',
  headingTransform: 'none',
  headingLetterSpacing: '0.02em',
  customCSS: '',
});

export const defaultExportSettings = (): ExportSettings => ({
  moduleId: 'journalforge-module',
  moduleTitle: 'JournalForge Module',
  moduleDescription: '',
  moduleVersion: '1.0.0',
  authorName: '',
  minFoundryVersion: '12',
  verifiedFoundryVersion: '14',
  requiresModules: [],
});
