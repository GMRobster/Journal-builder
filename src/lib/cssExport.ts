import type { StyleTokens } from '@/types';

const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2?';

function googleFontsImport(bodyFont: string, headingFont: string): string {
  const fonts = new Set<string>();
  if (bodyFont) fonts.add(bodyFont.replace(/\s+/g, '+'));
  if (headingFont && headingFont !== bodyFont) fonts.add(headingFont.replace(/\s+/g, '+'));
  if (fonts.size === 0) return '';
  const families = Array.from(fonts).map(f => `family=${f}:ital,wght@0,400;0,700;1,400`).join('&');
  return `@import url('${GOOGLE_FONTS_BASE}${families}&display=swap');\n\n`;
}

export function generateCSS(tokens: StyleTokens): string {
  const googleImport = googleFontsImport(tokens.googleFontBody, tokens.googleFontHeading);

  const vars = `  --jb-bg: ${tokens.backgroundColor};
  --jb-surface: ${tokens.surfaceColor};
  --jb-panel: ${tokens.panelColor};
  --jb-text: ${tokens.textColor};
  --jb-muted: ${tokens.mutedTextColor};
  --jb-heading: ${tokens.headingColor};
  --jb-accent: ${tokens.accentColor};
  --jb-border: ${tokens.borderColor};
  --jb-link: ${tokens.linkColor};
  --jb-readaloud-bg: ${tokens.readaloudBg};
  --jb-readaloud-border: ${tokens.readaloudBorder};
  --jb-font: ${tokens.fontFamily};
  --jb-heading-font: ${tokens.headingFontFamily};
  --jb-radius: ${tokens.borderRadius};
  --jb-padding: ${tokens.padding};
  --jb-spacing: ${tokens.sectionSpacing};
  --jb-border-width: ${tokens.borderWidth};
  --jb-shadow: ${tokens.shadow};
  --jb-img-radius: ${tokens.imageRadius};
  --jb-heading-transform: ${tokens.headingTransform};
  --jb-heading-ls: ${tokens.headingLetterSpacing};`;

  const base = `/* JournalForge Styles */
${googleImport}.jb-collection {
  background: var(--jb-bg);
  color: var(--jb-text);
  font-family: var(--jb-font);
  line-height: 1.6;
  padding: var(--jb-padding);
}
.jb-collection-header h1 {
  font-family: var(--jb-heading-font);
  color: var(--jb-heading);
  text-transform: var(--jb-heading-transform);
  letter-spacing: var(--jb-heading-ls);
  border-bottom: var(--jb-border-width) solid var(--jb-border);
  padding-bottom: 0.5em;
  margin-bottom: var(--jb-spacing);
}
.jb-entry { margin-bottom: var(--jb-spacing); }
.jb-entry-header h1,.jb-entry-header h2,.jb-entry-header h3,
.jb-entry-header h4,.jb-entry-header h5,.jb-entry-header h6 {
  font-family: var(--jb-heading-font);
  color: var(--jb-heading);
  text-transform: var(--jb-heading-transform);
  letter-spacing: var(--jb-heading-ls);
  margin: 0 0 var(--jb-padding) 0;
}
.jb-block h1,.jb-block h2,.jb-block h3,.jb-block h4,.jb-block h5,.jb-block h6 {
  font-family: var(--jb-heading-font);
  color: var(--jb-heading);
  text-transform: var(--jb-heading-transform);
  letter-spacing: var(--jb-heading-ls);
  margin: 0 0 0.5em 0;
}
.jb-text { margin-bottom: var(--jb-spacing); }
.jb-text p { margin: 0 0 0.75em 0; }
.jb-text a { color: var(--jb-link); }
.jb-readaloud {
  background: var(--jb-readaloud-bg);
  border-left: 3px solid var(--jb-readaloud-border);
  border-radius: var(--jb-radius);
  padding: var(--jb-padding);
  margin-bottom: var(--jb-spacing);
  font-style: italic;
}
.jb-readaloud p { margin: 0 0 0.5em 0; }
.jb-readaloud p:last-child { margin-bottom: 0; }
.jb-image { margin-bottom: var(--jb-spacing); }
.jb-image figure { margin: 0; display: inline-block; }
.jb-image img { border-radius: var(--jb-img-radius); box-shadow: var(--jb-shadow); display: block; max-width: 100%; }
.jb-image figcaption { color: var(--jb-muted); font-size: 0.85em; text-align: center; margin-top: 0.4em; }
.jb-image--left { float: left; margin-right: var(--jb-padding); }
.jb-image--right { float: right; margin-left: var(--jb-padding); }
.jb-image--center { text-align: center; display: block; }
.jb-image--full img { width: 100%; }
.jb-infobox {
  background: var(--jb-panel);
  border: var(--jb-border-width) solid var(--jb-border);
  border-radius: var(--jb-radius);
  padding: var(--jb-padding);
  margin-bottom: var(--jb-spacing);
  box-shadow: var(--jb-shadow);
}
.jb-infobox-title {
  font-family: var(--jb-heading-font);
  color: var(--jb-heading);
  font-size: 1.05em;
  margin: 0 0 0.5em 0;
  border-bottom: var(--jb-border-width) solid var(--jb-border);
  padding-bottom: 0.4em;
}
.jb-infobox p { margin: 0 0 0.5em 0; }
.jb-infobox p:last-child { margin-bottom: 0; }
.jb-infobox--warning { border-color: #e0a030; }
.jb-infobox--tip { border-color: #50c090; }
.jb-infobox--lore { border-color: var(--jb-accent); }
.jb-accordion {
  background: var(--jb-surface);
  border: var(--jb-border-width) solid var(--jb-border);
  border-radius: var(--jb-radius);
  margin-bottom: var(--jb-spacing);
  overflow: hidden;
  box-shadow: var(--jb-shadow);
}
.jb-accordion summary {
  cursor: pointer;
  padding: 0.75em var(--jb-padding);
  background: var(--jb-panel);
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5em;
  user-select: none;
}
.jb-accordion summary::-webkit-details-marker { display: none; }
.jb-accordion-body { padding: var(--jb-padding); }
.jb-profile {
  background: var(--jb-surface);
  border: var(--jb-border-width) solid var(--jb-border);
  border-radius: var(--jb-radius);
  margin-bottom: calc(var(--jb-spacing) * 0.75);
  overflow: hidden;
  box-shadow: var(--jb-shadow);
}
.jb-profile-summary {
  cursor: pointer;
  padding: 0.75em var(--jb-padding);
  background: var(--jb-panel);
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4em;
  user-select: none;
}
.jb-profile-summary::-webkit-details-marker { display: none; }
.jb-profile-summary h1,.jb-profile-summary h2,.jb-profile-summary h3,
.jb-profile-summary h4,.jb-profile-summary h5,.jb-profile-summary h6 {
  font-family: var(--jb-heading-font);
  color: var(--jb-heading);
  font-size: 1.1em;
  margin: 0;
  letter-spacing: var(--jb-heading-ls);
}
.jb-subtitle { color: var(--jb-muted); font-size: 0.88em; }
.jb-profile-body { padding: var(--jb-padding); display: grid; gap: var(--jb-padding); }
.jb-profile-desc p { margin: 0 0 0.5em 0; }
.jb-profile-desc p:last-child { margin-bottom: 0; }
.jb-profile-media { margin-bottom: 0.75em; }
.jb-profile-media--wrap-left { float: left; margin-right: var(--jb-padding); margin-bottom: 0.5em; }
.jb-profile-media--wrap-right { float: right; margin-left: var(--jb-padding); margin-bottom: 0.5em; }
.jb-profile-media img { border-radius: var(--jb-img-radius); box-shadow: var(--jb-shadow); display: block; }
.jb-profile-quotes {
  border-left: 2px solid var(--jb-accent);
  padding-left: 0.75em;
  font-style: italic;
  color: var(--jb-muted);
}
.jb-profile-quotes p { margin: 0 0 0.4em 0; }
.jb-profile-gm {
  background: rgba(0,0,0,0.2);
  border-radius: var(--jb-radius);
  padding: 0.75em;
  border: var(--jb-border-width) solid var(--jb-border);
}
.jb-profile-section-label {
  font-weight: 700;
  color: var(--jb-muted);
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.4em 0;
}
.jb-profile-gm p { margin: 0 0 0.4em 0; }
.jb-profile-gm p:last-child { margin-bottom: 0; }
.jb-list { margin-bottom: var(--jb-spacing); padding-left: 1.5em; }
.jb-list li { margin-bottom: 0.3em; }
.jb-gm-only { display: none; }
.jb-draft { display: none; }
.jb-clearfix::after { content: ''; display: table; clear: both; }`;

  const custom = tokens.customCSS ? `\n\n/* Custom CSS */\n${tokens.customCSS}` : '';
  return `.jb-root {\n${vars}\n}\n\n${base}${custom}`;
}

export function generateFullDocument(html: string, css: string, title = 'JournalForge Preview'): string {
  return `<!DOCTYPE html>\n<html lang="de">\n<head>\n<meta charset="UTF-8">\n<title>${title}</title>\n<style>\nbody { margin: 0; padding: 1rem; background: #111; }\n${css}\n</style>\n</head>\n<body class="jb-root">\n${html}\n</body>\n</html>`;
}
