// GoCardless Bank Account Data API authentication service
interface TokenResponse {
  access: string;
  access_expires: number;
  refresh: string;
  refresh_expires: number;
}

interface TokenStorage {
  accessToken: string;
  refreshToken: string;
  accessExpires: number;
  refreshExpires: number;
  lastUpdated: Date;
}

export class GoCardlessAuth {
  private static instance: GoCardlessAuth;
  private tokenStorage: TokenStorage | null = null;
  private readonly baseUrl = 'https://bankaccountdata.gocardless.com/api/v2';
  
  private constructor() {}

  static getInstance(): GoCardlessAuth {
    if (!GoCardlessAuth.instance) {
      GoCardlessAuth.instance = new GoCardlessAuth();
    }
    return GoCardlessAuth.instance;
  }

  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.tokenStorage && this.isTokenValid(this.tokenStorage.accessToken, this.tokenStorage.accessExpires)) {
      return this.tokenStorage.accessToken;
    }

    // Check if we can refresh the token
    if (this.tokenStorage && this.isTokenValid(this.tokenStorage.refreshToken, this.tokenStorage.refreshExpires)) {
      return await this.refreshAccessToken();
    }

    // Get new tokens
    return await this.getNewAccessToken();
  }

  private isTokenValid(token: string, expiresAt: number): boolean {
    if (!token) return false;
    const now = Date.now() / 1000;
    return expiresAt > (now + 300); // Add 5 minutes buffer
  }

  private async getNewAccessToken(): Promise<string> {
    const secretId = process.env.GOCARDLESS_SECRET_ID;
    const secretKey = process.env.GOCARDLESS_SECRET_KEY;

    if (!secretId || !secretKey) {
      throw new Error('GoCardless SECRET_ID and SECRET_KEY are required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/token/new/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret_id: secretId,
          secret_key: secretKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();
      
      this.tokenStorage = {
        accessToken: tokenData.access,
        refreshToken: tokenData.refresh,
        accessExpires: tokenData.access_expires,
        refreshExpires: tokenData.refresh_expires,
        lastUpdated: new Date(),
      };

      console.log('✅ GoCardless access token obtained successfully');
      return tokenData.access;

    } catch (error) {
      console.error('❌ Failed to get GoCardless access token:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.tokenStorage?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/token/refresh/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.tokenStorage.refreshToken,
        }),
      });

      if (!response.ok) {
        // If refresh fails, get a new token
        console.warn('Refresh token expired, getting new access token');
        return await this.getNewAccessToken();
      }

      const tokenData: TokenResponse = await response.json();
      
      this.tokenStorage = {
        ...this.tokenStorage,
        accessToken: tokenData.access,
        accessExpires: tokenData.access_expires,
        lastUpdated: new Date(),
      };

      console.log('✅ GoCardless access token refreshed successfully');
      return tokenData.access;

    } catch (error) {
      console.error('❌ Failed to refresh GoCardless access token:', error);
      // Fallback to getting a new token
      return await this.getNewAccessToken();
    }
  }

  // Make authenticated API request
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    // If unauthorized, try to refresh token and retry once
    if (response.status === 401) {
      console.warn('Access token expired, refreshing...');
      this.tokenStorage = null; // Clear stored token
      const newAccessToken = await this.getAccessToken();
      
      return await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${newAccessToken}`,
          ...options.headers,
        },
      });
    }

    return response;
  }

  // Get token info for debugging
  getTokenInfo(): { hasToken: boolean; accessExpires?: Date; refreshExpires?: Date } {
    if (!this.tokenStorage) {
      return { hasToken: false };
    }

    return {
      hasToken: true,
      accessExpires: new Date(this.tokenStorage.accessExpires * 1000),
      refreshExpires: new Date(this.tokenStorage.refreshExpires * 1000),
    };
  }
}

// Export singleton instance
export const gocardlessAuth = GoCardlessAuth.getInstance();