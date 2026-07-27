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

// AI Chatbot Assistant Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, currentPavilion, history } = req.body;

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
