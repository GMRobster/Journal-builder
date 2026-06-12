import type {
  Block, Collection, Entry, HeadingLevel,
  HeadingBlock, TextBlock, ReadaloudBlock, ImageBlock,
  AccordionBlock, ListBlock, InfoboxBlock, ProfileBlock, MediaItem,
} from '@/types';
import { parseMarkdown } from './parseMarkdown';

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMedia(media: MediaItem, extraClass = ''): string {
  if (!media.url) return '';
  const alignClass = `jb-image--${media.alignment}`;
  const wrapClass = media.textFlow === 'wrap' ? `jb-image--wrap-${media.alignment}` : '';
  const style = media.width ? ` style="width:${escHtml(media.width)}"` : '';
  const img = `<img src="${escHtml(media.url)}" alt="${escHtml(media.alt)}"${style}>`;
  const caption = media.caption ? `<figcaption>${escHtml(media.caption)}</figcaption>` : '';
  const classes = ['jb-image', alignClass, wrapClass, extraClass].filter(Boolean).join(' ');
  return `<figure class="${classes}">\n  ${img}\n  ${caption}\n</figure>`;
}

function renderHeadingBlock(b: HeadingBlock): string {
  const align = b.align !== 'left' ? ` style="text-align:${b.align}"` : '';
  return `<div class="jb-block jb-heading"${align}>\n  <${b.level}>${escHtml(b.text)}</${b.level}>\n</div>`;
}

function renderTextBlock(b: TextBlock): string {
  const align = b.align !== 'left' ? ` style="text-align:${b.align}"` : '';
  const media = b.media?.url ? renderMedia(b.media, 'jb-text-media') : '';
  return `<div class="jb-block jb-text"${align}>\n${media}${parseMarkdown(b.content)}\n</div>`;
}

function renderReadaloudBlock(b: ReadaloudBlock): string {
  const media = b.media?.url ? renderMedia(b.media) : '';
  return `<div class="jb-block jb-readaloud">\n${media}${parseMarkdown(b.content)}\n</div>`;
}

function renderImageBlock(b: ImageBlock): string {
  return `<div class="jb-block">\n${renderMedia(b.media)}\n</div>`;
}

function renderAccordionBlock(b: AccordionBlock): string {
  const open = b.defaultOpen ? ' open' : '';
  const items = b.items.map(it =>
    `  <details class="jb-accordion"${open}>\n    <summary>${escHtml(it.summary)}</summary>\n    <div class="jb-accordion-body">\n      ${parseMarkdown(it.content)}\n    </div>\n  </details>`
  ).join('\n');
  return `<div class="jb-block">\n  ${b.title ? `<p class="jb-accordion-group-title">${escHtml(b.title)}</p>` : ''}\n${items}\n</div>`;
}

function renderListBlock(b: ListBlock): string {
  const tag = b.ordered ? 'ol' : 'ul';
  const items = b.items.map(it => `  <li>${parseMarkdown(it.text).replace(/<\/?p>/g, '')}</li>`).join('\n');
  return `<div class="jb-block">\n<${tag} class="jb-list">\n${items}\n</${tag}>\n</div>`;
}

function renderInfoboxBlock(b: InfoboxBlock): string {
  const media = b.media?.url ? renderMedia(b.media) : '';
  return `<div class="jb-block jb-infobox jb-infobox--${b.variant}">\n  ${b.title ? `<p class="jb-infobox-title">${escHtml(b.title)}</p>` : ''}\n  ${media}\n  ${parseMarkdown(b.content)}\n</div>`;
}

function renderSectionLabel(text: string, mode: 'label' | 'heading', level: HeadingLevel = 'h3'): string {
  if (!text.trim()) return '';
  if (mode === 'heading') return `<${level} class="jb-profile-section-label">${escHtml(text)}</${level}>`;
  return `<p class="jb-profile-section-label">${escHtml(text)}</p>`;
}

function renderProfileBlock(b: ProfileBlock): string {
  const open = b.defaultOpen ? ' open' : '';
  const hl = b.headingLevel !== 'none' ? b.headingLevel : null;
  const headingClass = hl ? ` jb-profile-heading--${hl}` : '';
  const tags = b.tags.length ? ` data-tags="${escHtml(b.tags.join(','))}"` : '';
  const nameEl = hl ? `<${hl}>${escHtml(b.name)}</${hl}>` : `<span class="jb-profile-name">${escHtml(b.name)}</span>`;
  const subtitle = b.subtitle ? `\n    <span class="jb-subtitle">${escHtml(b.subtitle)}</span>` : '';
  const actorRef = b.actorRef ? `\n    <span class="jb-actor-ref">${escHtml(b.actorRef)}</span>` : '';

  let mediaHtml = '';
  if (b.media?.url) {
    const mc = b.media.textFlow === 'wrap' ? `jb-profile-media jb-profile-media--wrap-${b.media.alignment}` : 'jb-profile-media';
    const st = b.media.width ? ` style="width:${escHtml(b.media.width)}"` : '';
    mediaHtml = `\n    <figure class="${mc}"${st}>\n      <img src="${escHtml(b.media.url)}" alt="${escHtml(b.media.alt)}">\n      ${b.media.caption ? `<figcaption>${escHtml(b.media.caption)}</figcaption>` : ''}\n    </figure>`;
  }

  const desc = b.description
    ? `\n    <div class="jb-profile-desc jb-clearfix">\n      ${mediaHtml}\n      ${parseMarkdown(b.description)}\n    </div>`
    : mediaHtml ? `\n    <div class="jb-profile-desc jb-clearfix">${mediaHtml}</div>` : '';

  const quotesLines = b.quotes.split('\n').filter(q => q.trim())
    .map(q => `<p>„${escHtml(q.trim())}“</p>`).join('\n      ');
  const quotesHtml = quotesLines
    ? `\n    <div class="jb-profile-quotes">\n      ${renderSectionLabel(b.labelQuotes || 'Zitate', b.labelMode)}\n      ${quotesLines}\n    </div>` : '';

  const hasGm = b.gmDetails || b.gmPersonality || b.gmConnections;
  const gmHtml = hasGm ? `\n    <div class="jb-profile-gm">\n      ${b.gmDetails ? `${renderSectionLabel(b.labelGmDetails || 'Details', b.labelMode)}\n      <div>${parseMarkdown(b.gmDetails)}</div>` : ''}\n      ${b.gmPersonality ? `${renderSectionLabel(b.labelGmPersonality || 'Persönlichkeit', b.labelMode)}\n      <div>${parseMarkdown(b.gmPersonality)}</div>` : ''}\n      ${b.gmConnections ? `${renderSectionLabel(b.labelGmConnections || 'Verbindungen', b.labelMode)}\n      <div>${parseMarkdown(b.gmConnections)}</div>` : ''}\n    </div>` : '';

  return `<details class="jb-block jb-accordion jb-profile${headingClass}"${tags}${open}>\n  <summary class="jb-profile-summary">\n    ${nameEl}${subtitle}${actorRef}\n  </summary>\n  <div class="jb-profile-body">\n${desc}${quotesHtml}${gmHtml}\n  </div>\n</details>`;
}

function renderBlock(block: Block): string {
  if (block.hiddenFromExport || block.visibility === 'draft') return '';
  switch (block.type) {
    case 'heading': return renderHeadingBlock(block);
    case 'text': return renderTextBlock(block);
    case 'readaloud': return renderReadaloudBlock(block);
    case 'image': return renderImageBlock(block);
    case 'accordion': return renderAccordionBlock(block);
    case 'list': return renderListBlock(block);
    case 'infobox': return renderInfoboxBlock(block);
    case 'profile': return renderProfileBlock(block);
  }
}

function renderEntry(entry: Entry): string {
  const hl = entry.headingLevel;
  const headingClass = entry.exportTitleAsHeading ? ` jb-entry-heading--${hl}` : '';
  const tags = entry.tags.length ? ` data-tags="${escHtml(entry.tags.join(','))}"` : '';
  const id = entry.slug ? ` id="${escHtml(entry.slug)}"` : '';
  const header = entry.exportTitleAsHeading
    ? `  <header class="jb-entry-header">\n    <${hl}>${escHtml(entry.title)}</${hl}>\n  </header>` : '';
  const blocks = entry.blocks.map(renderBlock).filter(Boolean).join('\n\n');
  return `<article class="jb-entry${headingClass}"${id}${tags}>\n${header}\n${blocks}\n</article>`;
}

export function renderCollection(collection: Collection): string {
  const id = collection.title ? ` id="${escHtml(collection.title.toLowerCase().replace(/\s+/g, '-'))}"` : '';
  const header = collection.title
    ? `  <header class="jb-collection-header">\n    <h1>${escHtml(collection.title)}</h1>\n  </header>` : '';
  const entries = collection.entries.slice().sort((a, b) => a.order - b.order).map(renderEntry).join('\n\n');
  return `<main class="jb-collection"${id}>\n${header}\n\n${entries}\n</main>`;
}
