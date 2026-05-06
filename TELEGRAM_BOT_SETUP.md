# Telegram-bot setup — Fluentic Tolk

5-minuters setup för att få en Telegram-bot som översätter mellan sv/es/en/fr.

## 1. Skapa bot via BotFather
1. Öppna Telegram, sök `@BotFather`
2. `/newbot`
3. Namn: `Fluentic Tolk` (eller vad du vill)
4. Username: `fluentic_tolk_bot` (måste sluta på `_bot`)
5. Kopiera token (formatet `123456:AAH...`) — det här är din `TELEGRAM_BOT_TOKEN`

## 2. Generera webhook-secret
```bash
openssl rand -hex 32
# kopiera output → det här är din TELEGRAM_WEBHOOK_SECRET
```

## 3. Sätt env-vars
Lokalt (`.env.local`):
```
TELEGRAM_BOT_TOKEN=123456:AAH...
TELEGRAM_WEBHOOK_SECRET=<openssl-hex>
GOOGLE_AI_API_KEY=<befintlig>
```

På Vercel: Settings → Environment Variables → lägg till samma 3.

## 4. Registrera webhook
Efter att Fluentic är deployat på Vercel (t.ex. `fluentic.aiupscale.agency`):

```bash
curl -F "url=https://fluentic.aiupscale.agency/api/telegram/webhook?secret=<SECRET>" \
     https://api.telegram.org/bot<TOKEN>/setWebhook
```

Verifiera:
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```
Ska visa din URL och `pending_update_count: 0`.

## 5. Testa
1. Sök upp boten i Telegram
2. `/start` → välkomstmeddelande
3. Skriv `Hej, hur mår du?` → får tillbaka översättningar till es/en/fr
4. `/sv→es Vart är toaletten?` → tvingar svenska→spanska

## Användning för samtal med spansk släkt
**Setup för 1-mot-1 chat:**
- Lägg till boten i en gruppchat med släkt
- Alla skriver på sitt språk → boten översätter åt motparten

**Setup för delade röst-meddelanden (kommande):**
- Voice-stöd är skuld — kommer i nästa version
- Just nu: skriv text, eller använd Telegrams inbyggda speech-to-text

## Felsökning
- `401 Unauthorized` när du anropar webhook → `secret` matchar inte
- Bot svarar inte → kolla `getWebhookInfo`, leta `last_error_message`
- Översättningar konstiga → kolla `GOOGLE_AI_API_KEY` är rätt
