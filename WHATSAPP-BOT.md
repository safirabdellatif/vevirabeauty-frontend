# WhatsApp AI Bot — Vevira Beauty (Darija)

Bot officiel via **WhatsApp Cloud API** + **OpenAI**.  
Webhook : `https://vevirabeauty.com/api/whatsapp/webhook`

> L’app WhatsApp Business sur le téléphone **ne suffit pas**. Il faut Cloud API Meta.

---

## Checklist Meta (manuel)

1. [ ] Créer / ouvrir [Meta Business Suite](https://business.facebook.com/)
2. [ ] [developers.facebook.com](https://developers.facebook.com/) → Create App → type **Business**
3. [ ] Ajouter le produit **WhatsApp** → **API Setup**
4. [ ] Connecter / migrer le numéro **0755282978** (`+212 755 282 978`)
5. [ ] Copier :
   - **Temporary / permanent token** → `WHATSAPP_TOKEN`
   - **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **App Secret** (Settings → Basic) → `WHATSAPP_APP_SECRET`
6. [ ] Choisir un verify token (ex. `vevira-wa-2026`) → `WHATSAPP_VERIFY_TOKEN`
7. [ ] Webhook configuration :
   - Callback URL : `https://vevirabeauty.com/api/whatsapp/webhook`
   - Verify token : même valeur que `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to field : **messages**
8. [ ] Créer une clé [OpenAI](https://platform.openai.com/api-keys) → `OPENAI_API_KEY`

---

## Variables Easypanel (frontend — Runtime Environment)

```
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=vevira-wa-2026
WHATSAPP_APP_SECRET=...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
WHATSAPP_SESSIONS_FILE=/app/data/whatsapp-sessions.json
```

Optionnel :

```
WHATSAPP_ESCALATE_WEBHOOK_URL=https://hooks.slack.com/...   # ou Make/n8n
WHATSAPP_ESCALATE_EMAIL=contact@vevirabeauty.com
```

Puis **Rebuild + Redeploy** le frontend.

---

## Vérification

1. `https://vevirabeauty.com/api/health` → `"whatsapp_bot": { "configured": true, "openai": true }`
2. Dans Meta → Webhook → **Test** / envoyer un message au numéro
3. Le bot doit répondre en **darija**, pousser l’offre **2 pièces / 289 DH**, et pouvoir créer une commande COD

---

## Comportement

| Situation | Action |
|-----------|--------|
| Question produit / prix | Réponse IA + lien produit |
| Client confirme commande (nom + 06/07 + produit + qté) | `POST` create-order interne |
| « بغيت نهضر مع شي حد » / réclamation | Stop auto-reply 12h + log / webhook |
| « رجع البوت » | Reprend les réponses auto |

---

## Important

- Après migration Cloud API, gère les chats via **Meta Business Inbox** + le bot (plus uniquement l’app téléphone sur ce numéro).
- Sans `OPENAI_API_KEY`, le bot renvoie un message court avec lien boutique.
- Sans `WHATSAPP_APP_SECRET` en production, les POST webhook sont rejetés (signature).
