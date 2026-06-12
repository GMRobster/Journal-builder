import type {
  Block, Collection, Entry, ProfileBlock, TextBlock, HeadingBlock,
  ReadaloudBlock, AccordionBlock, ListBlock, InfoboxBlock, ImageBlock,
  Visibility, MediaItem, HeadingLevel,
} from '@/types';
import { generateId, slugify } from './utils';
import { defaultMedia } from '@/types';

function blk<T extends Block>(base: Partial<T> & { type: T['type'] }): T {
  const result = { id: generateId(), visibility: 'player' as Visibility, tags: [], hiddenFromExport: false, ...base };
  return result as unknown as T;
}

function domText(el: Element): string { return (el.textContent || '').trim(); }

function innerHtmlToMarkdown(el: Element): string {
  return el.innerHTML
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<u>(.*?)<\/u>/gi, '__$1__')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function parseImageStyle(style: string): Partial<MediaItem> {
  const result: Partial<MediaItem> = {};
  if (/float\s*:\s*left/i.test(style)) { result.alignment = 'left'; result.textFlow = 'wrap'; }
  else if (/float\s*:\s*right/i.test(style)) { result.alignment = 'right'; result.textFlow = 'wrap'; }
  const m = style.match(/width\s*:\s*([^;]+)/i);
  if (m) result.width = m[1].trim();
  return result;
}

function parseImgEl(img: Element): MediaItem {
  const media = defaultMedia();
  media.url = img.getAttribute('src') || '';
  media.alt = img.getAttribute('alt') || '';
  const style = img.getAttribute('style') || '';
  const widthAttr = img.getAttribute('width') || '';
  Object.assign(media, parseImageStyle(style));
  if (!media.width && widthAttr) media.width = widthAttr.includes('%') ? widthAttr : `${widthAttr}px`;
  return media;
}

function findImgInEl(el: Element): MediaItem | undefined {
  const img = el.querySelector('img');
  return img ? parseImgEl(img) : undefined;
}

function isProfileAccordionLegacy(el: Element): boolean {
  return el.classList.contains('erben-lore-acc') || el.classList.contains('profile-accordion') ||
    (el.tagName.toLowerCase() === 'div' && !!el.querySelector('.erben-lore-acc-trigger, .profile-trigger'));
}

function makeProfileDefaults() {
  return {
    actorRef: '', description: '', quotes: '', gmDetails: '', gmPersonality: '',
    gmConnections: '', defaultOpen: false, headingLevel: 'h3' as HeadingLevel,
    labelMode: 'label' as const, labelQuotes: 'Zitate', labelGmDetails: 'Details',
    labelGmPersonality: 'Persönlichkeit', labelGmConnections: 'Verbindungen',
  };
}

function parseLegacyProfileAccordion(el: Element): ProfileBlock {
  const trigger = el.querySelector('.erben-lore-acc-trigger, .profile-trigger, [class*="trigger"]');
  const body = el.querySelector('.erben-lore-acc-body, .profile-body, [class*="body"]');
  const nameEl = trigger?.querySelector('.erben-lore-acc-label, .profile-name, [class*="label"]');
  const tagEl = trigger?.querySelector('.erben-lore-acc-tag, .profile-tag, [class*="tag"]');
  const name = nameEl ? domText(nameEl) : domText(trigger || el).split('\n')[0];
  const subtitle = tagEl ? domText(tagEl) : '';
  const actorLink = body?.querySelector('a[href*="UUID"], [data-uuid]');
  const actorRef = actorLink ? (actorLink.getAttribute('href') || actorLink.getAttribute('data-uuid') || '') : '';
  const media = body ? findImgInEl(body) : undefined;
  const quoteEl = body?.querySelector('.quotes, .zitate, blockquote, [class*="quote"], [class*="zitat"]');
  const quotes = quoteEl ? Array.from(quoteEl.querySelectorAll('p, li')).map(p => domText(p)).filter(Boolean).join('\n') : '';
  const gmEl = body?.querySelector('.gm-info, .sl-info, .gm, .spielleiter, [class*="gm"], [class*="sl"]');
  const gmDetails = gmEl ? innerHtmlToMarkdown(gmEl) : '';
  const descText = body ? innerHtmlToMarkdown(body) : '';
  return blk<ProfileBlock>({ type: 'profile', name, subtitle, media, quotes, gmDetails, ...makeProfileDefaults(), actorRef, description: descText, gmPersonality: '', gmConnections: '' });
}

function parseDetailsEl(el: Element): ProfileBlock | AccordionBlock {
  const summary = el.querySelector('summary');
  const summaryText = summary ? domText(summary) : 'Accordion';
  const subtitle = summary?.querySelector('.subtitle, .jb-subtitle, [class*="sub"]');
  const hasProfileMarkers = el.classList.contains('jb-profile') || el.classList.contains('profile') || subtitle !== null;
  if (hasProfileMarkers) {
    const nameEl = summary?.querySelector('h1,h2,h3,h4,h5,h6');
    const name = nameEl ? domText(nameEl) : summaryText;
    const sub = subtitle ? domText(subtitle) : '';
    const body = el.querySelector('.jb-profile-body, .profile-body, .accordion-body');
    const media = body ? findImgInEl(body) : findImgInEl(el);
    return blk<ProfileBlock>({ type: 'profile', name, subtitle: sub, media, description: innerHtmlToMarkdown(body || el), defaultOpen: el.hasAttribute('open'), ...makeProfileDefaults(), actorRef: '', quotes: '', gmDetails: '', gmPersonality: '', gmConnections: '' });
  }
  const body = el.querySelector('.accordion-body, .jb-accordion-body') || el;
  return blk<AccordionBlock>({ type: 'accordion', title: '', items: [{ id: generateId(), summary: summaryText, content: innerHtmlToMarkdown(body) }], defaultOpen: el.hasAttribute('open') });
}

function elToBlocks(el: Element): Block[] {
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList);
  if (isProfileAccordionLegacy(el)) return [parseLegacyProfileAccordion(el)];
  if (tag === 'details') return [parseDetailsEl(el)];
  if (['h1','h2','h3','h4','h5','h6'].includes(tag))
    return [blk<HeadingBlock>({ type: 'heading', level: tag as HeadingBlock['level'], text: domText(el), align: 'left' })];
  if (tag === 'blockquote')
    return [blk<ReadaloudBlock>({ type: 'readaloud', content: innerHtmlToMarkdown(el) })];
  if (tag === 'ul' || tag === 'ol') {
    const items = Array.from(el.querySelectorAll(':scope > li')).map(li => ({ id: generateId(), text: domText(li) }));
    return [blk<ListBlock>({ type: 'list', ordered: tag === 'ol', items })];
  }
  if (classes.some(c => ['aside','callout','box','info','infobox','tip','warning','lore','jb-infobox'].includes(c)) || tag === 'aside') {
    const titleEl = el.querySelector('h2,h3,h4,h5,.title,.infobox-title');
    return [blk<InfoboxBlock>({ type: 'infobox', title: titleEl ? domText(titleEl) : '', content: innerHtmlToMarkdown(el), variant: classes.includes('warning') ? 'warning' : classes.includes('tip') ? 'tip' : 'info' })];
  }
  if (tag === 'img') return [blk<ImageBlock>({ type: 'image', media: parseImgEl(el) })];
  if (tag === 'figure') {
    const img = el.querySelector('img');
    if (img) { const media = parseImgEl(img); const cap = el.querySelector('figcaption'); if (cap) media.caption = domText(cap); return [blk<ImageBlock>({ type: 'image', media })]; }
  }
  if (['section','article','div','main'].includes(tag)) {
    const children = Array.from(el.children);
    if (children.length > 1) return children.flatMap(child => elToBlocks(child));
  }
  const text = innerHtmlToMarkdown(el);
  if (!text) return [];
  return [blk<TextBlock>({ type: 'text', content: text, align: 'left' })];
}

export interface ImportOptions {
  useHeadingsAsEntries: boolean;
  entryHeadingLevel: 'h1' | 'h2';
  collectionTitle: string;
}

export function importHTML(html: string, options: ImportOptions): Collection {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  ['script','style','iframe','object','embed','meta','link'].forEach(t => body.querySelectorAll(t).forEach(el => el.remove()));
  return options.useHeadingsAsEntries ? importWithHeadingEntries(body, options) : importFlat(body, options);
}

function importWithHeadingEntries(body: Element, options: ImportOptions): Collection {
  const entries: Entry[] = [];
  let currentEntry: Entry | null = null;
  let entryOrder = 0;
  const isEntryHeading = (el: Element): boolean => {
    const t = el.tagName.toLowerCase();
    return options.entryHeadingLevel === 'h1' ? t === 'h1' : t === 'h1' || t === 'h2';
  };
  for (const child of Array.from(body.children)) {
    if (isEntryHeading(child)) {
      currentEntry = { id: generateId(), title: domText(child), slug: slugify(domText(child)), tags: [], order: entryOrder++, exportTitleAsHeading: true, headingLevel: child.tagName.toLowerCase() as HeadingLevel, blocks: [] };
      entries.push(currentEntry);
    } else {
      if (!currentEntry) {
        currentEntry = { id: generateId(), title: options.collectionTitle || 'Importiert', slug: slugify(options.collectionTitle || 'importiert'), tags: [], order: entryOrder++, exportTitleAsHeading: false, headingLevel: 'h2', blocks: [] };
        entries.push(currentEntry);
      }
      currentEntry.blocks.push(...elToBlocks(child));
    }
  }
  return { id: generateId(), title: options.collectionTitle || 'Importiert', description: '', template: '', tags: ['importiert'], entries };
}

function importFlat(body: Element, options: ImportOptions): Collection {
  const blocks: Block[] = Array.from(body.children).flatMap(elToBlocks);
  return { id: generateId(), title: options.collectionTitle || 'Importiert', description: '', template: '', tags: ['importiert'],
    entries: [{ id: generateId(), title: options.collectionTitle || 'Importiert', slug: slugify(options.collectionTitle || 'importiert'), tags: ['importiert'], order: 0, exportTitleAsHeading: false, headingLevel: 'h2', blocks }] };
}
