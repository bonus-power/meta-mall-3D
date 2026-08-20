// Service to sync points with WordPress (myCred / custom REST endpoint)
export interface SyncPointsPayload {
  username?: string;
  userId?: number | string;
  amount: number;
  reason?: string;
  apiKey?: string;
  targetSite?: 'scontaziende' | 'metatv';
  endpointUrl?: string;
}

export interface SyncPointsResponse {
  success: boolean;
  message?: string;
  userId?: number | string;
  amountAdded?: number;
  newBalance?: number;
}

export const WP_SYNC_CONFIG = {
  testSiteUrl: "https://scontaziende.it",
  prodSiteUrl: "https://meta-tv.eu",
  secretApiKey: "META_TV_3D_SECRET_KEY_2026",
};

/**
 * Sends a POST request through our server proxy to avoid browser CORS issues.
 */
export async function syncPointsWithWordPress(payload: SyncPointsPayload): Promise<SyncPointsResponse> {
  const targetSite = payload.targetSite || (payload.endpointUrl?.includes('scontaziende') ? 'scontaziende' : 'metatv');
  const apiKey = payload.apiKey || WP_SYNC_CONFIG.secretApiKey;

  try {
    const res = await fetch('/api/sync-wp-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetSite: targetSite,
        endpointUrl: payload.endpointUrl,
        username: payload.username,
        userId: payload.userId,
        amount: payload.amount,
        reason: payload.reason || 'Punti guadagnati nel Centro 3D Meta-TV',
        apiKey: apiKey,
      }),
    });

    const data = await res.json();
    return {
      success: data.success ?? (res.ok && !data.error),
      message: data.message || (data.code ? `Codice WP: ${data.code}` : undefined),
      userId: data.user_id,
      amountAdded: data.amount_added,
      newBalance: data.new_balance,
    };
  } catch (err: any) {
    console.warn("Sincronizzazione punti WordPress offline o errore di rete:", err);
    return {
      success: false,
      message: err.message || "Errore di connessione con il server proxy.",
    };
  }
}

export interface WpLoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number | string;
    username: string;
    email: string;
    display_name?: string;
    roles?: string[];
    points_balance?: number;
  };
}

/**
 * Authenticate user directly against WordPress (Scontaziende / Meta-TV)
 */
export async function loginWordPressUser(
  usernameOrEmail: string,
  password: string,
  targetSite: 'scontaziende' | 'metatv' = 'scontaziende'
): Promise<WpLoginResponse> {
  try {
    const res = await fetch('/api/wp-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: usernameOrEmail.trim(),
        password: password,
        targetSite: targetSite,
      }),
    });

    const data = await res.json();
    return {
      success: data.success ?? (res.ok && !data.error),
      message: data.message,
      user: data.user,
    };
  } catch (err: any) {
    console.warn("WP Login offline o errore di rete:", err);
    return {
      success: false,
      message: err.message || "Impossibile contattare il server per l'accesso.",
    };
  }
}

