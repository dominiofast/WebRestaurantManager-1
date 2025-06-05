import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FacebookPixelV2 } from './FacebookPixelV2';

interface Store {
  id: number;
  facebookPixelId?: string;
  pixelEnabled?: boolean;
  conversionsApiEnabled?: boolean;
}

interface AutoFacebookPixelProps {
  storeId: number;
}

export function AutoFacebookPixel({ storeId }: AutoFacebookPixelProps) {
  const { data: store } = useQuery<Store>({
    queryKey: ['/api/stores', storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Erro ao carregar dados da loja');
      }
      return response.json();
    },
    enabled: !!storeId
  });

  // Only render Facebook Pixel if store has valid configuration
  if (!store?.facebookPixelId || !store?.pixelEnabled) {
    return null;
  }

  return (
    <FacebookPixelV2 
      pixelId={store.facebookPixelId} 
      enabled={store.pixelEnabled} 
    />
  );
}