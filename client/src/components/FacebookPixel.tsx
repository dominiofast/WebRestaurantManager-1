import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface FacebookPixelProps {
  storeSlug: string;
}

interface StorePixelConfig {
  facebookPixelId?: string;
  pixelEnabled?: boolean;
  conversionsApiEnabled?: boolean;
  facebookTestEventCode?: string;
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export function FacebookPixel({ storeSlug }: FacebookPixelProps) {
  const { data: storeConfig } = useQuery<StorePixelConfig>({
    queryKey: [`/api/stores/${storeSlug}/pixel-config`],
    enabled: !!storeSlug
  });

  useEffect(() => {
    if (!storeConfig?.facebookPixelId || !storeConfig?.pixelEnabled) {
      return;
    }

    // Initialize Facebook Pixel
    const pixelId = storeConfig.facebookPixelId;
    
    // Load Facebook Pixel script
    (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize pixel
    window.fbq('init', pixelId, {
      external_id: 'guest_user',
      ...(storeConfig.facebookTestEventCode && {
        test_event_code: storeConfig.facebookTestEventCode
      })
    });

    // Track page view
    window.fbq('track', 'PageView');

    // Track ViewContent for menu pages
    if (window.location.pathname.includes('/menu/')) {
      window.fbq('track', 'ViewContent', {
        content_type: 'product_group',
        content_category: 'restaurant_menu'
      });
    }

  }, [storeConfig]);

  return null;
}

// Facebook Pixel tracking functions
export const trackPixelEvent = (eventName: string, parameters?: any, storeSlug?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number = 1) => {
  trackPixelEvent('AddToCart', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price * quantity,
    currency: 'BRL',
    num_items: quantity
  });
};

export const trackPurchase = (orderId: string, value: number, items: any[]) => {
  trackPixelEvent('Purchase', {
    content_ids: items.map(item => item.id),
    content_type: 'product',
    value: value,
    currency: 'BRL',
    num_items: items.length,
    transaction_id: orderId
  });
};

export const trackInitiateCheckout = (value: number, items: any[]) => {
  trackPixelEvent('InitiateCheckout', {
    content_ids: items.map(item => item.id),
    content_type: 'product',
    value: value,
    currency: 'BRL',
    num_items: items.length
  });
};

export const trackSearch = (searchTerm: string) => {
  trackPixelEvent('Search', {
    search_string: searchTerm,
    content_category: 'restaurant_menu'
  });
};

export const trackLead = (formName: string = 'contact') => {
  trackPixelEvent('Lead', {
    content_name: formName,
    content_category: 'restaurant_contact'
  });
};