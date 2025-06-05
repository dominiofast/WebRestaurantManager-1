import crypto from 'crypto';

interface FacebookConversionEvent {
  event_name: string;
  event_time: number;
  action_source: string;
  event_source_url?: string;
  user_data?: {
    em?: string; // email hash
    ph?: string; // phone hash  
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // facebook click id
    fbp?: string; // facebook browser id
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    num_items?: number;
    order_id?: string;
    search_string?: string;
  };
  event_id?: string;
}

interface FacebookPixelConfig {
  pixelId: string;
  accessToken: string;
  datasetId?: string;
  testEventCode?: string;
}

export class FacebookConversionsAPI {
  private config: FacebookPixelConfig;

  constructor(config: FacebookPixelConfig) {
    this.config = config;
  }

  // Hash sensitive data (email, phone) as required by Facebook
  private hashData(data: string): string {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }

  // Send conversion event to Facebook
  async sendConversionEvent(event: FacebookConversionEvent): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.pixelId}/events`;
      
      const payload = {
        data: [event],
        ...(this.config.testEventCode && { test_event_code: this.config.testEventCode }),
        access_token: this.config.accessToken
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Facebook Conversions API Error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Facebook Conversion Event sent successfully:', result);
      return true;

    } catch (error) {
      console.error('Error sending Facebook conversion event:', error);
      return false;
    }
  }

  // Track page view
  async trackPageView(userIp: string, userAgent: string, pageUrl: string, email?: string): Promise<boolean> {
    const event: FacebookConversionEvent = {
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: pageUrl,
      user_data: {
        client_ip_address: userIp,
        client_user_agent: userAgent,
        ...(email && { em: this.hashData(email) })
      },
      event_id: crypto.randomUUID()
    };

    return this.sendConversionEvent(event);
  }

  // Track view content (menu viewing)
  async trackViewContent(
    userIp: string, 
    userAgent: string, 
    pageUrl: string, 
    contentIds: string[], 
    contentType: string = 'product',
    email?: string
  ): Promise<boolean> {
    const event: FacebookConversionEvent = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: pageUrl,
      user_data: {
        client_ip_address: userIp,
        client_user_agent: userAgent,
        ...(email && { em: this.hashData(email) })
      },
      custom_data: {
        content_ids: contentIds,
        content_type: contentType
      },
      event_id: crypto.randomUUID()
    };

    return this.sendConversionEvent(event);
  }

  // Track add to cart
  async trackAddToCart(
    userIp: string,
    userAgent: string,
    pageUrl: string,
    productId: string,
    productName: string,
    value: number,
    currency: string = 'BRL',
    quantity: number = 1,
    email?: string
  ): Promise<boolean> {
    const event: FacebookConversionEvent = {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: pageUrl,
      user_data: {
        client_ip_address: userIp,
        client_user_agent: userAgent,
        ...(email && { em: this.hashData(email) })
      },
      custom_data: {
        content_ids: [productId],
        content_name: productName,
        content_type: 'product',
        value: value,
        currency: currency,
        num_items: quantity
      },
      event_id: crypto.randomUUID()
    };

    return this.sendConversionEvent(event);
  }

  // Track initiate checkout
  async trackInitiateCheckout(
    userIp: string,
    userAgent: string,
    pageUrl: string,
    contentIds: string[],
    value: number,
    currency: string = 'BRL',
    numItems: number,
    email?: string
  ): Promise<boolean> {
    const event: FacebookConversionEvent = {
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: pageUrl,
      user_data: {
        client_ip_address: userIp,
        client_user_agent: userAgent,
        ...(email && { em: this.hashData(email) })
      },
      custom_data: {
        content_ids: contentIds,
        content_type: 'product',
        value: value,
        currency: currency,
        num_items: numItems
      },
      event_id: crypto.randomUUID()
    };

    return this.sendConversionEvent(event);
  }

  // Track purchase
  async trackPurchase(
    userIp: string,
    userAgent: string,
    pageUrl: string,
    orderId: string,
    contentIds: string[],
    value: number,
    currency: string = 'BRL',
    numItems: number,
    email?: string,
    phone?: string
  ): Promise<boolean> {
    const event: FacebookConversionEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: pageUrl,
      user_data: {
        client_ip_address: userIp,
        client_user_agent: userAgent,
        ...(email && { em: this.hashData(email) }),
        ...(phone && { ph: this.hashData(phone) })
      },
      custom_data: {
        content_ids: contentIds,
        content_type: 'product',
        value: value,
        currency: currency,
        num_items: numItems,
        order_id: orderId
      },
      event_id: crypto.randomUUID()
    };

    return this.sendConversionEvent(event);
  }

  // Track lead (contact form, newsletter signup)
  async trackLead(
    userIp: string,
    userAgent: string,
    pageUrl: string,
    contentName: string,
    email?: string,
    phone?: string
  ): Promise<boolean> {
    const event: FacebookConversionEvent = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: pageUrl,
      user_data: {
        client_ip_address: userIp,
        client_user_agent: userAgent,
        ...(email && { em: this.hashData(email) }),
        ...(phone && { ph: this.hashData(phone) })
      },
      custom_data: {
        content_name: contentName,
        content_type: 'lead'
      },
      event_id: crypto.randomUUID()
    };

    return this.sendConversionEvent(event);
  }

  // Track search
  async trackSearch(
    userIp: string,
    userAgent: string,
    pageUrl: string,
    searchString: string,
    email?: string
  ): Promise<boolean> {
    const event: FacebookConversionEvent = {
      event_name: 'Search',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: pageUrl,
      user_data: {
        client_ip_address: userIp,
        client_user_agent: userAgent,
        ...(email && { em: this.hashData(email) })
      },
      custom_data: {
        search_string: searchString,
        content_type: 'product'
      },
      event_id: crypto.randomUUID()
    };

    return this.sendConversionEvent(event);
  }
}