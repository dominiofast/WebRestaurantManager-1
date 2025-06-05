import { useEffect } from 'react';

interface FacebookPixelProps {
  pixelId: string;
  enabled?: boolean;
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export function FacebookPixelV2({ pixelId, enabled = true }: FacebookPixelProps) {
  useEffect(() => {
    if (!enabled || !pixelId) return;

    // Initialize Facebook Pixel
    const initFacebookPixel = () => {
      if (window.fbq) return; // Already initialized

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      
      // Add the pixel initialization code
      const pixelCode = `
        !function(f,b,e,v,n,t,s) {
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;

      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = pixelCode;
      
      document.head.appendChild(inlineScript);
      document.head.appendChild(script);

      // Add noscript fallback
      const noscript = document.createElement('noscript');
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      document.head.appendChild(noscript);
    };

    initFacebookPixel();
  }, [pixelId, enabled]);

  return null;
}

// Event tracking functions
export const trackViewContent = (contentType: string, contentId: string, value?: number, currency = 'BRL') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_type: contentType,
      content_ids: [contentId],
      value: value,
      currency: currency
    });
  }
};

export const trackAddToCart = (contentId: string, value: number, currency = 'BRL') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [contentId],
      content_type: 'product',
      value: value,
      currency: currency
    });
  }
};

export const trackInitiateCheckout = (value: number, currency = 'BRL', numItems?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: currency,
      num_items: numItems
    });
  }
};

export const trackPurchase = (value: number, currency = 'BRL', orderId?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
      order_id: orderId
    });
  }
};

export const trackSearch = (searchString: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchString
    });
  }
};

export const trackLead = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead');
  }
};