import { parseSseChunk } from './sse';

describe('parseSseChunk', () => {
  it('parses complete messages and keeps partial data', () => {
    const { messages, rest } = parseSseChunk('event: access.requested\ndata: {"id":1}\n\ndata: {"id"');
    expect(messages).toEqual([{ event: 'access.requested', data: '{"id":1}' }]);
    expect(rest).toBe('data: {"id"');
  });

  it('defaults the event name and joins multi-line data', () => {
    const { messages } = parseSseChunk('id: 1\ndata: a\ndata: b\n\n');
    expect(messages).toEqual([{ event: 'message', data: 'a\nb' }]);
  });
});
