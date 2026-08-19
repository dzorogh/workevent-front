import removeMarkdown from 'remove-markdown';

export type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_HEADING = /(?:^|\n)#{2,3}\s*(?:FAQ|Частые вопросы|Вопросы и ответы)\s*\n/i;

export function extractFaqFromMarkdown(content: string | null | undefined): FaqItem[] {
  if (!content?.trim()) return [];

  const parts = content.split(FAQ_HEADING);
  if (parts.length < 2) return [];

  const body = parts[1].split(/\n##\s+/).shift() ?? '';
  const items: FaqItem[] = [];

  const headingQa = /(?:^|\n)#{3,4}\s+(.+?)\n+([\s\S]*?)(?=\n#{3,4}\s+|\n##\s+|$)/g;
  for (const match of body.matchAll(headingQa)) {
    const question = match[1].trim();
    const answer = removeMarkdown(match[2]).replace(/\s+/g, ' ').trim();
    if (question.length > 2 && answer.length > 2) {
      items.push({ question, answer });
    }
  }

  if (items.length > 0) {
    return items.slice(0, 8);
  }

  const boldQa = /(?:^|\n)\*\*(.+?\?)\*\*\s*\n+([\s\S]*?)(?=\n\*\*.+\?\*\*|$)/g;
  for (const match of body.matchAll(boldQa)) {
    const question = match[1].trim();
    const answer = removeMarkdown(match[2]).replace(/\s+/g, ' ').trim();
    if (question && answer.length > 2) {
      items.push({ question, answer });
    }
  }

  return items.slice(0, 8);
}

export function resolvePageFaq(
  content: string | null | undefined,
  fallback: FaqItem[],
): { items: FaqItem[]; visible: boolean } {
  const extracted = extractFaqFromMarkdown(content);
  if (extracted.length > 0) {
    return { items: extracted, visible: false };
  }

  return { items: fallback, visible: fallback.length > 0 };
}
