function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^[-*•]\s+/gm, '')
}

export function splitAssistantParagraphs(content: string): string[] {
  const cleaned = stripMarkdown(content)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!cleaned) return []

  const hasNumberedSteps = /\d+\.\s/.test(cleaned)
  if (!hasNumberedSteps) {
    return cleaned
      .split(/\n\n+/)
      .map((part) => part.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
  }

  const parts = cleaned
    .split(/(?=\d+\.\s)/)
    .map((part) => part.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  if (parts.length <= 1) return parts

  const [intro, ...steps] = parts
  if (/^\d+\.\s/.test(intro)) return parts

  return [intro, ...steps]
}
