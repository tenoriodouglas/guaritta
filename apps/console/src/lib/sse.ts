export interface SseMessage {
  event: string;
  data: string;
}

/** Incremental parser for the text/event-stream format; returns complete messages and the leftover buffer. */
export function parseSseChunk(buffer: string): { messages: SseMessage[]; rest: string } {
  const blocks = buffer.replace(/\r\n/g, '\n').split('\n\n');
  const rest = blocks.pop() ?? '';
  const messages: SseMessage[] = [];

  for (const block of blocks) {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
    }
    if (data.length) messages.push({ event, data: data.join('\n') });
  }
  return { messages, rest };
}

/**
 * Subscribes to an authenticated SSE endpoint using fetch (EventSource cannot send headers).
 * Reconnects with backoff until the signal is aborted.
 */
export async function subscribeSse(
  url: string,
  token: string,
  onMessage: (message: SseMessage) => void,
  signal: AbortSignal,
  onStatus?: (connected: boolean) => void,
): Promise<void> {
  let delay = 1_000;
  while (!signal.aborted) {
    try {
      const response = await fetch(url, {
        headers: { authorization: `Bearer ${token}`, accept: 'text/event-stream' },
        signal,
      });
      if (!response.ok || !response.body) throw new Error(`SSE HTTP ${response.status}`);
      onStatus?.(true);
      delay = 1_000;

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const parsed = parseSseChunk(buffer + value);
        buffer = parsed.rest;
        parsed.messages.forEach(onMessage);
      }
    } catch {
      if (signal.aborted) return;
    }
    onStatus?.(false);
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 2, 15_000);
  }
}
