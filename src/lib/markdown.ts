'use client';

export interface ParsedTodo {
  isHeading: boolean;
  cleanText: string; // for headers, remove the leading #
  html: string;
}

export function parseTodoText(text: string): ParsedTodo {
  const trimmed = text.trim();
  const isHeading = trimmed.startsWith('#');

  let cleanText = text;
  if (isHeading) {
    // Remove the leading '#' and any extra spaces
    cleanText = trimmed.replace(/^#\s*/, '');
  }

  // Escape HTML characters to prevent XSS
  let escaped = cleanText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Apply bold formatting: **bold** or __bold__
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Apply italic formatting: *italic* or _italic_
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/_(.*?)_/g, '<em>$1</em>');

  // Apply link formatting: [text](url)
  // Matching [text](url) where url can be anything except parenthesis
  escaped = escaped.replace(
    /\[(.*?)\]\((https?:\/\/.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="todo-link underline hover:text-purple-600 transition-colors" onclick="event.stopPropagation();">$1</a>'
  );

  return {
    isHeading,
    cleanText,
    html: escaped,
  };
}
