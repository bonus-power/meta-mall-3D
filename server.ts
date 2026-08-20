import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key:', err);
  }
}

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Proxy endpoint to communicate with WordPress (supports scontaziende.it and meta-tv.eu)
app.post('/api/sync-wp-points', async (req, res) => {
  try {
    const { targetSite, username, userId, amount, reason, apiKey, endpointUrl } = req.body;

    let baseDomain = 'https://scontaziende.it';
    if (targetSite === 'metatv' || (endpointUrl && endpointUrl.includes('meta-tv'))) {
      baseDomain = 'https://www.meta-tv.eu';
    } else if (targetSite === 'scontaziende' || (endpointUrl && endpointUrl.includes('scontaziende'))) {
      baseDomain = 'https://scontaziende.it';
    }

    const cleanUser = String(username || '').trim();
    const cleanAmount = Number(amount) || 100;
    const cleanReason = reason || 'Punti Centro 3D Meta-TV';
    const cleanKey = apiKey || 'META_TV_3D_SECRET_KEY_2026';

    const restUrlWithParams = `${baseDomain}/wp-json/meta-tv/v1/add-points?username=${encodeURIComponent(cleanUser)}&amount=${cleanAmount}&reason=${encodeURIComponent(cleanReason)}`;
    const fallbackRestUrl = `${baseDomain}/?rest_route=/meta-tv/v1/add-points&username=${encodeURIComponent(cleanUser)}&amount=${cleanAmount}&reason=${encodeURIComponent(cleanReason)}`;
    const ajaxUrl = `${baseDomain}/wp-admin/admin-ajax.php`;

    console.log(`[WP Sync Proxy] -> Destinazione: ${baseDomain} | Utente: '${cleanUser}' | Punti: ${cleanAmount}`);

    // Metodo 1: REST API con parametri sia in URL (query) che in JSON body
    try {
      const wpResponse = await fetch(restUrlWithParams, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'MetaTV-3D-Mall/1.0',
        },
        body: JSON.stringify({
          username: cleanUser,
          user_id: userId,
          amount: cleanAmount,
          reason: cleanReason,
          api_key: cleanKey,
        }),
      });

      const contentType = wpResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await wpResponse.json();
        console.log('[WP Sync REST Result]', data);
        if (data?.success !== undefined) {
          return res.status(wpResponse.status).json(data);
        }
      }
    } catch (e) {
      console.warn('[WP Sync] Errore richiesta REST primario:', e);
    }

    // Metodo 2: REST API fallback URL
    try {
      const fallbackResponse = await fetch(fallbackRestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'MetaTV-3D-Mall/1.0',
        },
        body: JSON.stringify({
          username: cleanUser,
          user_id: userId,
          amount: cleanAmount,
          reason: cleanReason,
          api_key: cleanKey,
        }),
      });

      const fallbackContentType = fallbackResponse.headers.get('content-type') || '';
      if (fallbackContentType.includes('application/json')) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData?.success !== undefined) {
          return res.status(fallbackResponse.status).json(fallbackData);
        }
      }
    } catch (e) {
      console.warn('[WP Sync] Errore richiesta REST fallback:', e);
    }

    // Metodo 3: AJAX Form Post
    try {
      const formParams = new URLSearchParams();
      formParams.append('action', 'metatv_add_points');
      formParams.append('username', cleanUser);
      formParams.append('user_id', String(userId || ''));
      formParams.append('amount', String(cleanAmount));
      formParams.append('reason', cleanReason);

      const ajaxResponse = await fetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'MetaTV-3D-Mall/1.0',
        },
        body: formParams.toString(),
      });

      const ajaxContentType = ajaxResponse.headers.get('content-type') || '';
      if (ajaxContentType.includes('application/json')) {
        const ajaxData = await ajaxResponse.json();
        if (ajaxData?.success !== undefined) {
          return res.status(ajaxResponse.status).json(ajaxData);
        }
      }
    } catch (e) {
      console.warn('[WP Sync] Errore richiesta AJAX:', e);
    }

    return res.status(400).json({
      success: false,
      message: `Impossibile comunicare con ${baseDomain}.`,
    });
  } catch (error: any) {
    console.error('[WP Sync Proxy Error]:', error);
    return res.status(500).json({
      success: false,
      message: `Errore di connessione: ${error.message || error}`,
    });
  }
});

// Proxy endpoint for Unified WordPress Login (Scontaziende / Meta-TV)
app.post('/api/wp-login', async (req, res) => {
  try {
    const { username, password, targetSite } = req.body;

    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '');

    if (!cleanUser || !cleanPass) {
      return res.status(400).json({
        success: false,
        message: 'Compila sia il campo Username/Email che la Password.',
      });
    }

    let baseDomain = 'https://scontaziende.it';
    if (targetSite === 'metatv') {
      baseDomain = 'https://www.meta-tv.eu';
    }

    console.log(`[WP Login Proxy] Tentativo login su ${baseDomain} per utente: '${cleanUser}' (lunghezza pass: ${cleanPass.length})`);

    let lastErrMessage = '';

    // 1. Metodo AJAX (admin-ajax.php) - Questo riceve i campi $_POST standard in modo nativo su tutti i server Apache/Nginx
    try {
      const ajaxUrl = `${baseDomain}/wp-admin/admin-ajax.php`;
      const formParams = new URLSearchParams();
      formParams.append('action', 'metatv_auth_login');
      formParams.append('username', cleanUser);
      formParams.append('email', cleanUser);
      formParams.append('password', cleanPass);

      const ajaxResponse = await fetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'MetaTV-3D-Mall/1.0',
        },
        body: formParams.toString(),
      });

      const ajaxText = await ajaxResponse.text();
      try {
        const ajaxData = JSON.parse(ajaxText);
        if (ajaxData?.success !== undefined) {
          return res.status(ajaxResponse.status).json(ajaxData);
        }
      } catch (e) {
        console.log('[WP Login Proxy] AJAX raw response:', ajaxText.slice(0, 150));
      }
    } catch (ajaxErr: any) {
      console.warn('[WP Login Proxy] AJAX error:', ajaxErr?.message || ajaxErr);
    }

    // 2. Metodo REST API con Query Parameters + JSON Body (doppia garanzia per WP_REST_Request)
    const restLoginUrl = `${baseDomain}/wp-json/meta-tv/v1/auth-login?username=${encodeURIComponent(cleanUser)}&password=${encodeURIComponent(cleanPass)}`;
    try {
      const wpResponse = await fetch(restLoginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'MetaTV-3D-Mall/1.0',
        },
        body: JSON.stringify({
          username: cleanUser,
          email: cleanUser,
          password: cleanPass,
        }),
      });

      const text = await wpResponse.text();
      try {
        const data = JSON.parse(text);
        if (data && data.code !== 'rest_no_route' && data.success !== undefined) {
          return res.status(wpResponse.status).json(data);
        }
        if (data && data.message) lastErrMessage = data.message;
      } catch (e) {
        console.log('[WP Login Proxy] REST raw response:', text.slice(0, 100));
      }
    } catch (err: any) {
      console.warn('[WP Login Proxy] REST error:', err?.message || err);
      lastErrMessage = err?.message || '';
    }

    // 3. Metodo REST Fallback (?rest_route=)
    const fallbackRestUrl = `${baseDomain}/?rest_route=/meta-tv/v1/auth-login&username=${encodeURIComponent(cleanUser)}&password=${encodeURIComponent(cleanPass)}`;
    try {
      const fallbackResponse = await fetch(fallbackRestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'MetaTV-3D-Mall/1.0',
        },
        body: JSON.stringify({
          username: cleanUser,
          email: cleanUser,
          password: cleanPass,
        }),
      });

      const fallbackText = await fallbackResponse.text();
      try {
        const fallbackData = JSON.parse(fallbackText);
        if (fallbackData && fallbackData.code !== 'rest_no_route' && fallbackData.success !== undefined) {
          return res.status(fallbackResponse.status).json(fallbackData);
        }
        if (fallbackData && fallbackData.message) lastErrMessage = fallbackData.message;
      } catch (e) {
        console.log('[WP Login Proxy] REST fallback raw response:', fallbackText.slice(0, 100));
      }
    } catch (fallbackErr: any) {
      console.warn('[WP Login Proxy] REST fallback error:', fallbackErr?.message || fallbackErr);
    }

    return res.status(400).json({
      success: false,
      message: lastErrMessage || `Impossibile comunicare con il server ${baseDomain}.`,
    });
  } catch (error: any) {
    console.error('[WP Login Proxy Error]:', error);
    return res.status(500).json({
      success: false,
      message: `Errore server di autenticazione: ${error.message || error}`,
    });
  }
});

// AI Chatbot Assistant Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, currentPavilion } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const systemPrompt = `Sei l'Assistente Intelligente Meta-TV del Centro Commerciale Virtuale Globale 3D.
Il tuo compito è guidare gli utenti nei corridoi 3D, raccomandare padiglioni tematici (Shopping, Food, Tech, Beauty, Auto, Casa, Viaggi, ecc.), mostrare i link Bonus-Power delle aziende e offrire informazioni su prodotti, offerte ed eventi live.
Rispondi in modo amichevole, professionale, entusiasmante e sintetico (max 3-4 frasi o punti).
Includi emoji e riferimenti al mondo futuristico Meta-TV.
Se l'utente chiede indicazioni, suggerisci il padiglione ideale e menziona la possibilità di usufruire del teletrasporto rapido o dei link Bonus-Power!
Padiglione corrente dell'utente: ${currentPavilion || 'Corridoio Principale Meta-TV'}.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const reply = response.text || 'Benvenuto in Meta-TV Mall! Come posso aiutarti oggi?';
        res.json({ reply });
        return;
      } catch (geminiError) {
        console.warn('Gemini API call error, falling back to smart reply generator:', geminiError);
      }
    }

    // Fallback response if Gemini API key isn't provided or errors
    const lowerMsg = message.toLowerCase();
    let reply = 'Benvenuto al Centro Commerciale Virtuale Meta-TV! 🌟';

    if (lowerMsg.includes('mangiare') || lowerMsg.includes('cibo') || lowerMsg.includes('ristorante') || lowerMsg.includes('food')) {
      reply = '🍕 Ti consiglio di visitare il Padiglione **Food & Beverage**! Troverai pizzerie, sushi bar, vini prelibati e offerte gastronomiche esclusive con link Bonus-Power!';
    } else if (lowerMsg.includes('telefono') || lowerMsg.includes('tech') || lowerMsg.includes('computer') || lowerMsg.includes('gaming')) {
      reply = '📱 Il Padiglione **Tecnologia & Telefonia** è perfetto per te! Troverai smartphone di ultima generazione, domotica e postazioni gaming 3D.';
    } else if (lowerMsg.includes('vestiti') || lowerMsg.includes('moda') || lowerMsg.includes('shopping') || lowerMsg.includes('scarpe')) {
      reply = '🛍️ Esplora il Padiglione **Shopping & Retail** per moda uomo/donna, accessori di lusso e capi vintage con sconti esclusivi Bonus-Power!';
    } else if (lowerMsg.includes('auto') || lowerMsg.includes('moto') || lowerMsg.includes('mobilita')) {
      reply = '🏎️ Nel Padiglione **Auto & Mobilità** puoi esplorare showroom 3D di e-bike, concessionari e accessori auto con mappe interattive.';
    } else if (lowerMsg.includes('bonus') || lowerMsg.includes('power') || lowerMsg.includes('sconto') || lowerMsg.includes('offerta')) {
      reply = '⚡ I link **Bonus-Power** ti garantiscono promozioni dirette e cashback nei mini-siti 3D delle aziende partner! Clicca su qualsiasi azienda per riscuotere i tuoi vantaggi!';
    } else if (lowerMsg.includes('mappa') || lowerMsg.includes('dove')) {
      reply = '🗺️ Clicca sul pulsante **Mappa 3D Globale** in alto a destra o sulla minimappa per orientarti fra i 20 padiglioni tematici e le coordinate aziendali!';
    } else {
      reply = `✨ Sono l'Assistente Meta-TV! Posso accompagnarti nei corridoi 3D, mostrarti le aziende top del padiglione **${currentPavilion || 'Principale'}** e farti accedere ai link Bonus-Power! In cosa posso servirti?`;
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Errore durante l’elaborazione della richiesta' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meta-TV 3D Mall Server running on http://localhost:${PORT}`);
  });
}

startServer();
