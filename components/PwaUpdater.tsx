'use client';

import { useEffect } from 'react';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

export function PwaUpdater() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const initSerwist = async () => {
      try {
        const { Serwist } = await import('@serwist/window');
        const serwist = new Serwist('/sw.js', { scope: '/', type: 'classic' });

        serwist.addEventListener('waiting', () => {
          toast.add({
            title: "Hay una nueva versión disponible",
            description: "Recarga para aplicar los cambios inmediatamente.",
            type: "info",
            timeout: 0,
            data: {
              action: (
              <Button
                size="sm"
                onClick={() => {
                  serwist.messageSW({ type: 'SKIP_WAITING' });
                }}
              >
                Recargar
              </Button>
              )
            },
          });
        });

        serwist.addEventListener('controlling', (event: any) => {
           if (event.isUpdate) {
             window.location.reload();
           }
        });

        serwist.register();
      } catch (error) {
        console.error('PWA update error:', error);
      }
    };

    initSerwist();
  }, []);

  return null;
}