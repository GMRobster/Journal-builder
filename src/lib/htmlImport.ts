import type {
  Block, Collection, Entry, ProfileBlock, TextBlock, HeadingBlock,
  ReadaloudBlock, AccordionBlock, ListBlock, InfoboxBlock, ImageBlock,
  Visibility, MediaItem, HeadingLevel,
} from '@/types';
import { generateId, slugify } from './utils';
import { defaultMedia } from '@/types';

function blk<T extends Block>(base: Partial<T> & { type: T['type'] }): T {
  const result = {
    id: generateId(),
    visibility: 'player' as Visibility,
    tags: [],
    hiddenFromExport: false,
    ...base,
  };
  return result as unknown as T;
}

function domText(el: Element): string {
  return (el.textContent || '').trim();
}

function innerHtmlToMarkdown(el: Element): string {
  // Very basic conversion of innerHTML to plain-ish text/markdown
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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function parseImageStyle(style: string): Partial<MediaItem> {
  const result: Partial<MediaItem> = {};
  if (/float\s*:\s*left/i.test(style)) {
    result.alignment = 'left';
    result.textFlow = 'wrap';
  } else if (/float\s*:\s*right/i.test(style)) {
    result.alignment = 'right';
    result.textFlow = 'wrap';
  }
  const widthMatch = style.match(/width\s*:\s*([^;]+)/i);
  if (widthMatch) result.width = widthMatch[1].trim();
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
  if (!img) return undefined;
  return parseImgEl(img);
}

function isProfileAccordionLegacy(el: Element): boolean {
  return (
    el.classList.contains('erben-lore-acc') ||
    el.classList.contains('profile-accordion') ||
    (el.tagName.toLowerCase() === 'div' &&
      !!el.querySelector('.erben-lore-acc-trigger, .profile-trigger'))
  );
}

function parseLegacyProfileAccordion(el: Element): ProfileBlock {
  const trigger =
    el.querySelector('.erben-lore-acc-trigger, .profile-trigger') ||
    el.querySelector('[class*="trigger"]');
  const body =
    el.querySelector('.erben-lore-acc-body, .profile-body') ||
    el.querySelector('[class*="body"]');

  const nameEl = trigger?.querySelector('.erben-lore-acc-label, .profile-name, [class*="label"]');
  const tagEl = trigger?.querySelector('.erben-lore-acc-tag, .profile-tag, [class*="tag"]');

  const name = nameEl ? domText(nameEl) : domText(trigger || el).split('\n')[0];
  const subtitle = tagEl ? domText(tagEl) : '';

  // Find actor ref
  const actorLink = body?.querySelector('a[href*="UUID"]') || body?.querySelector('[data-uuid]');
  const actorRef = actorLink
    ? actorLink.getAttribute('href') || actorLink.getAttribute('data-uuid') || ''
    : '';

  // Find image
  const media = body ? findImgInEl(body) : undefined;

  // Find quotes section
  let quotes = '';
  const quoteEl =
    body?.querySelector('.quotes, .zitate, blockquote') ||
    body?.querySelector('[class*="quote"], [class*="zitat"]');
  if (quoteEl) {
    quotes = Array.from(quoteEl.querySelectorAll('p, li'))
      .map(p => domText(p))
      .filter(Boolean)
      .join('\n');
  }

  // Find GM sections
  let gmDetails = '';
  let gmPersonality = '';
  let gmConnections = '';

  const gmEl =
    body?.querySelector('.gm-info, .sl-info, .gm, .spielleiter') ||
    body?.querySelector('[class*="gm"], [class*="sl"]');

  if (gmEl) {
    // Try to split into subsections
    const sections = Array.from(gmEl.querySelectorAll('section, div, p'));
    if (sections.length > 0) {
      gmDetails = innerHtmlToMarkdown(gmEl);
    }
  }

  // Description: remaining text that isn't quotes/gm
  let descEl = body;
  const descText = descEl ? innerHtmlToMarkdown(descEl) : '';

  return blk<ProfileBlock>({
    type: 'profile',
    name,
    subtitle,
    actorRef,
    description: descText,
    media,
    quotes,
    gmDetails,
    gmPersonality,
    gmConnections,
    defaultOpen: false,
    headingLevel: 'h3',
    labelMode: 'label',
    labelQuotes: 'Zitate',
    labelGmDetails: 'Details',
    labelGmPersonality: 'Persönlichkeit',
    labelGmConnections: 'Verbindungen',
  });
}

function parseDetailsEl(el: Element): ProfileBlock | AccordionBlock {
  const summary = el.querySelector('summary');
  const summaryText = summary ? domText(summary) : 'Accordion';

  // Heuristic: if it looks like a profile (has subtitle, image, etc.)
  const subtitle = summary?.querySelector('.subtitle, .jb-subtitle, [class*="sub"]');
  const hasProfileMarkers =
    el.classList.contains('jb-profile') ||
    el.classList.contains('profile') ||
    subtitle !== null;

  if (hasProfileMarkers) {
    const name = summary?.querySelector('h1,h2,h3,h4,h5,h6')
      ? domText(summary.querySelector('h1,h2,h3,h4,h5,h6')!)
      : summaryText;
    const sub = subtitle ? domText(subtitle) : '';
    const body = el.querySelector('.jb-profile-body, .profile-body, .accordion-body');
    const media = body ? findImgInEl(body) : findImgInEl(el);
    const descEl = body || el;

    return blk<ProfileBlock>({
      type: 'profile',
      name,
      subtitle: sub,
      actorRef: '',
      description: innerHtmlToMarkdown(descEl),
      media,
      quotes: '',
      gmDetails: '',
      gmPersonality: '',
      gmConnections: '',
      defaultOpen: el.hasAttribute('open'),
      headingLevel: 'h3',
      labelMode: 'label',
      labelQuotes: 'Zitate',
      labelGmDetails: 'Details',
      labelGmPersonality: 'Persönlichkeit',
      labelGmConnections: 'Verbindungen',
    });
  }

  // Generic accordion with items
  const body = el.querySelector('.accordion-body, .jb-accordion-body') || el;
  const content = body ? innerHtmlToMarkdown(body) : '';

  return blk<AccordionBlock>({
    type: 'accordion',
    title: '',
    items: [{ id: generateId(), summary: summaryText, content }],
    defaultOpen: el.hasAttribute('open'),
  });
}

function elToBlocks(el: Element): Block[] {
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList);

  // Legacy profile accordion
  if (isProfileAccordionLegacy(el)) {
    return [parseLegacyProfileAccordion(el)];
  }

  // details / summary
  if (tag === 'details') {
    return [parseDetailsEl(el)];
  }

  // Headings
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
    return [
      blk<HeadingBlock>({
        type: 'heading',
        level: tag as HeadingBlock['level'],
        text: domText(el),
        align: 'left',
      }),
    ];
  }

  // Blockquote → readaloud
  if (tag === 'blockquote') {
    return [
      blk<ReadaloudBlock>({
        type: 'readaloud',
        content: innerHtmlToMarkdown(el),
      }),
    ];
  }

  // Lists
  if (tag === 'ul' || tag === 'ol') {
    const items = Array.from(el.querySelectorAll(':scope > li')).map(li => ({
      id: generateId(),
      text: domText(li),
    }));
    return [
      blk<ListBlock>({
        type: 'list',
        ordered: tag === 'ol',
        items,
      }),
    ];
  }

  // Infobox-like
  if (
    classes.some(c =>
      ['aside', 'callout', 'box', 'info', 'infobox', 'tip', 'warning', 'lore', 'jb-infobox'].includes(c)
    ) ||
    tag === 'aside'
  ) {
    const titleEl = el.querySelector('h2,h3,h4,h5,.title,.infobox-title');
    const title = titleEl ? domText(titleEl) : '';
    return [
      blk<InfoboxBlock>({
        type: 'infobox',
        title,
        content: innerHtmlToMarkdown(el),
        variant: classes.includes('warning') ? 'warning' : classes.includes('tip') ? 'tip' : 'info',
      }),
    ];
  }

  // Image
  if (tag === 'img') {
    return [
      blk<ImageBlock>({
        type: 'image',
        media: parseImgEl(el),
      }),
    ];
  }

  if (tag === 'figure') {
    const img = el.querySelector('img');
    if (img) {
      const media = parseImgEl(img);
      const caption = el.querySelector('figcaption');
      if (caption) media.caption = domText(caption);
      return [blk<ImageBlock>({ type: 'image', media })];
    }
  }

  // Section / article / div — recurse into children or treat as text
  if (['section', 'article', 'div', 'main'].includes(tag)) {
    // Check if has mixed block-level content
    const children = Array.from(el.children);
    if (children.length > 1) {
      return children.flatMap(child => elToBlocks(child));
    }
  }

  // Default: text block
  const text = innerHtmlToMarkdown(el);
  if (!text) return [];
  return [
    blk<TextBlock>({
      type: 'text',
      content: text,
      align: 'left',
    }),
  ];
}

/**
 * Recursively unwrap transparent container elements (div, section, article, main)
 * so their children are promoted to the top-level stream.
 * Structural elements like <details> and profile-accordion wrappers are left intact.
 */
function flattenTopLevel(el: Element): Element[] {
  const tag = el.tagName.toLowerCase();
  // Don't unwrap structural / semantic content containers
  if (tag === 'details') return [el];
  if (isProfileAccordionLegacy(el)) return [el];
  if (['div', 'section', 'article', 'main'].includes(tag)) {
    const children = Array.from(el.children);
    if (children.length > 0) {
      return children.flatMap(flattenTopLevel);
    }
    // no child elements — treat as a leaf (may have text nodes)
    return [el];
  }
  return [el];
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

  const sanitizeTags = ['script', 'style', 'iframe', 'object', 'embed', 'meta', 'link'];
  sanitizeTags.forEach(tag => {
    body.querySelectorAll(tag).forEach(el => el.remove());
  });

  if (options.useHeadingsAsEntries) {
    return importWithHeadingEntries(body, options);
  } else {
    return importFlat(body, options);
  }
}

function importWithHeadingEntries(body: Element, options: ImportOptions): Collection {
  const headingSelector = options.entryHeadingLevel === 'h1' ? 'h1' : 'h1,h2';
  const entries: Entry[] = [];
  let currentEntry: Entry | null = null;
  let entryOrder = 0;

  const allChildren = Array.from(body.children).flatMap(flattenTopLevel);

  const isEntryHeading = (el: Element): boolean => {
    const tag = el.tagName.toLowerCase();
    if (options.entryHeadingLevel === 'h1') return tag === 'h1';
    return tag === 'h1' || tag === 'h2';
  };

  for (const child of allChildren) {
    if (isEntryHeading(child)) {
      currentEntry = {
        id: generateId(),
        title: domText(child),
        slug: slugify(domText(child)),
        tags: [],
        order: entryOrder++,
        exportTitleAsHeading: true,
        headingLevel: child.tagName.toLowerCase() as HeadingLevel,
        blocks: [],
      };
      entries.push(currentEntry);
    } else {
      if (!currentEntry) {
        currentEntry = {
          id: generateId(),
          title: options.collectionTitle || 'Importiert',
          slug: slugify(options.collectionTitle || 'importiert'),
          tags: [],
          order: entryOrder++,
          exportTitleAsHeading: false,
          headingLevel: 'h2',
          blocks: [],
        };
        entries.push(currentEntry);
      }
      const blocks = elToBlocks(child);
      currentEntry.blocks.push(...blocks);
    }
  }

  return {
    id: generateId(),
    title: options.collectionTitle || 'Importiert',
    description: '',
    template: '',
    tags: ['importiert'],
    entries,
  };
}

function importFlat(body: Element, options: ImportOptions): Collection {
  const blocks: Block[] = Array.from(body.children).flatMap(elToBlocks);
  return {
    id: generateId(),
    title: options.collectionTitle || 'Importiert',
    description: '',
    template: '',
    tags: ['importiert'],
    entries: [
      {
        id: generateId(),
        title: options.collectionTitle || 'Importiert',
        slug: slugify(options.collectionTitle || 'importiert'),
        tags: ['importiert'],
        order: 0,
        exportTitleAsHeading: false,
        headingLevel: 'h2',
        blocks,
      },
    ],
  };
}
