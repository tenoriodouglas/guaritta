import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { keys } from '../api/queries';
import type { AccessRequest } from '../api/types';
import { subscribeSse } from '../lib/sse';
import { subjectLabel } from '../lib/format';
import { playAlert } from '../lib/alert';

/** Live access feed: refreshes queries and alerts the operator on new requests. */
export function useAccessStream(token: string | null): boolean {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    void subscribeSse(
      '/api/access/stream',
      token,
      (message) => {
        void queryClient.invalidateQueries({ queryKey: keys.access });
        if (message.event !== 'access.requested') return;
        const request = JSON.parse(message.data) as AccessRequest;
        playAlert(request.suggestion === 'DENY' ? 'warning' : 'info');
        if (document.hidden && Notification.permission === 'granted') {
          new Notification(`Portaria · ${request.plateRead ?? 'acesso'}`, {
            body: subjectLabel[request.subject],
          });
        }
      },
      controller.signal,
      setConnected,
    );
    return () => controller.abort();
  }, [token, queryClient]);

  return connected;
}
