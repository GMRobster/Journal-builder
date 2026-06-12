export function parseMarkdown(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  let listOrdered = false;

  const flushList = () => {
    if (inList) {
      result.push(listOrdered ? '</ol>' : '</ul>');
      inList = false;
    }
  };

  const inline = (s: string): string =>
    s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<u>$1</u>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  for (const raw of lines) {
    const line = raw;

    if (line === '---') {
      flushList();
      result.push('<hr>');
      continue;
    }

    if (/^\d+\. /.test(line)) {
      if (!inList || !listOrdered) {
        flushList();
        result.push('<ol>');
        inList = true;
        listOrdered = true;
      }
      result.push(`<li>${inline(line.replace(/^\d+\. /, ''))}</li>`);
      continue;
    }

    if (/^[*-] /.test(line)) {
      if (!inList || listOrdered) {
        flushList();
        result.push('<ul>');
        inList = true;
        listOrdered = false;
      }
      result.push(`<li>${inline(line.replace(/^[*-] /, ''))}</li>`);
      continue;
    }

    flushList();

    if (/^> /.test(line)) {
      result.push(`<blockquote>${inline(line.replace(/^> /, ''))}</blockquote>`);
    } else if (line.trim() === '') {
      result.push('');
    } else {
      result.push(`<p>${inline(line)}</p>`);
    }
  }

  flushList();
  return result.join('\n');
}
