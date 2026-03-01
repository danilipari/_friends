# Piano: Kill Switch Remoto + Offuscamento Codice

## Contesto

L'estensione è pubblicata sullo store di Google per un'azienda che non ha rispettato gli accordi di pagamento. Servono due meccanismi di protezione:
1. **Kill switch remoto** per disattivare l'estensione senza ripubblicarla
2. **Offuscamento del codice** buildato per impedire il reverse engineering

---

## Feature 1: Kill Switch Remoto

### Come funziona

- L'estensione fa una GET all'URL configurato in `VITE_EXT_SYNC` (nome generico, non "license")
- La risposta e **offuscata**: nomi di campo corti e non parlanti, con firma HMAC
- Se lo status e disattivato: l'estensione **non si inizializza** e mostra un **banner rosso** dismissibile
- Se la request fallisce: **retry automatico** (3 tentativi con backoff esponenziale: 2s, 4s, 8s)
- Se tutti i retry falliscono: **banner arancione** di warning con bottone "Riprova", l'estensione **resta bloccata**

### Protocollo API (offuscato)

L'endpoint e volutamente generico `/api/ext/sync` e la risposta usa campi corti e non parlanti:

```json
// Estensione attiva
{ "s": 1, "t": 1738368000, "h": "a3f2b8c9d1e4..." }

// Estensione disattivata
{ "s": 0, "t": 1738368000, "h": "b7e1c4d2f5a8...", "p": "Licenza scaduta. Contatta il supporto." }
```

| Campo | Significato | Descrizione |
|-------|------------|-------------|
| `s` | status | `1` = attivo, `0` = disattivato |
| `t` | timestamp | Unix timestamp della risposta (usato nell'HMAC) |
| `h` | hash | HMAC-SHA256 della risposta per verificare autenticita |
| `p` | payload | Messaggio da mostrare all'utente (solo quando `s: 0`) |

### Verifica HMAC

La firma impedisce a chiunque di mockare il server con una risposta `{ "s": 1 }`:

**Lato server** (quando genera la risposta):
```
h = HMAC-SHA256( "s={s}&t={t}", SECRET_KEY )
```

**Lato client** (nell'estensione):
```
expected = HMAC-SHA256( "s={s}&t={t}", SECRET_KEY )
if (expected !== response.h) → tratta come risposta invalida (= disattivato)
```

- Il `SECRET_KEY` e hardcoded nel codice dell'estensione, protetto dall'offuscamento (`stringArray`)
- Anche trovando il segreto nel codice offuscato, richiede competenze significative di reverse engineering
- Il timestamp `t` previene attacchi di replay (risposte vecchie riciclate)
- Una tolleranza di 5 minuti sul timestamp evita problemi di clock skew

### File da creare

#### `src/utils/licenseCheck.ts`
Utility per il controllo licenza:
- Funzione `checkLicense(): Promise<{ active: boolean, message?: string, error?: boolean }>`
- Usa `fetchViaBackground()` (da `backgroundFetch.ts`) per evitare problemi CORS
- Timeout di 5 secondi per singola richiesta
- Retry con backoff esponenziale: 3 tentativi (attese di 2s, 4s, 8s tra un tentativo e l'altro)
- **Verifica HMAC**: calcola l'hash atteso e lo confronta con `h` nella risposta
- **Verifica timestamp**: rifiuta risposte con `t` piu vecchio di 5 minuti
- Se HMAC non valido o timestamp scaduto → tratta come `{ s: 0 }` (disattivato)
- Se tutti i retry falliscono → ritorna `{ active: false, error: true }`

#### `src/app/AppLicenseAlert.vue`
Due modalita di banner, entrambi `fixed` in cima alla pagina (`z-index: 99999`):

**Banner rosso (licenza disattivata / HMAC invalido):**
- Sfondo rosso chiaro, testo scuro
- Mostra il messaggio dal server (`p`) se presente, altrimenti messaggio generico
- Icona X per chiudere (dismiss per la sessione, riappare al refresh)

**Banner arancione (errore di connessione):**
- Sfondo arancione chiaro, testo scuro
- Messaggio: "Impossibile verificare la licenza. Verifica la connessione e riprova."
- Bottone "Riprova" che rilancia `checkLicense()` e mostra uno spinner durante il caricamento
- Icona X per chiudere (dismiss per la sessione, riappare al refresh)
- Se il retry va a buon fine con `s: 1` e HMAC valido → il banner sparisce e l'estensione si inizializza

Entrambi i banner leggono `isLicenseActive`, `licenseMessage`, e `licenseError` dallo `sharedStore`.

### File da modificare

#### `src/content-scripts/main-content-script.ts`
- Import di `AppLicenseAlert`, `checkLicense`
- Montare `AppLicenseAlert` a livello di modulo (come gli altri componenti, riga ~240)
- Esporre una funzione globale `retryLicenseAndInit()` che:
  1. Chiama `checkLicense()`
  2. Se `active: true` → aggiorna lo store e lancia `initApp()`
  3. Se `active: false` → aggiorna lo store (il banner resta visibile)
- In `initApp()` (riga 1652), **prima di tutto il resto**:
  1. Chiamare `checkLicense()`
  2. Se `active: false` (licenza disattivata o HMAC invalido): aggiornare lo store, nascondere il loader, `return`
  3. Se `error: true` (retry falliti): aggiornare lo store con stato errore, nascondere il loader, `return`
  4. Se `active: true` e HMAC valido: proseguire normalmente

#### `src/stores/sharedStore.ts`
- Aggiungere refs:
  - `isLicenseActive: ref(true)` — la licenza e valida?
  - `licenseMessage: ref('')` — messaggio dal server o di errore
  - `licenseError: ref(false)` — errore di connessione (distingue rosso da arancione)
  - `licenseLoading: ref(false)` — retry in corso (per lo spinner nel bottone)
- Aggiungere actions:
  - `setLicenseStatus(active: boolean, message?: string, error?: boolean)`
  - `setLicenseLoading(loading: boolean)`
- Esportare tutto nel return dello store

#### `.env.test` e `.env.production`
- Aggiungere `VITE_EXT_SYNC=https://tuo-server.com/api/v1/config` (URL placeholder da configurare)

### Flusso nel codice

```
initApp() viene chiamato
  │
  ├── checkLicense() → GET VITE_EXT_SYNC
  │   │
  │   ├── Response { s: 1, t: ..., h: "..." } + HMAC valido
  │   │   └── Prosegui normalmente con l'inizializzazione
  │   │
  │   ├── Response { s: 0, t: ..., h: "...", p: "..." } + HMAC valido
  │   │   ├── sharedStore.setLicenseStatus(false, p)
  │   │   ├── sharedStore.setAppInitializing(false)
  │   │   ├── Banner ROSSO visibile
  │   │   └── return (blocca inizializzazione)
  │   │
  │   ├── Response con HMAC invalido o timestamp scaduto
  │   │   ├── Trattata come s: 0 (possibile manomissione)
  │   │   ├── sharedStore.setLicenseStatus(false, "Errore di verifica")
  │   │   ├── Banner ROSSO visibile
  │   │   └── return (blocca inizializzazione)
  │   │
  │   └── Errore di rete / Timeout
  │       ├── Retry 1 (dopo 2s) → fallisce
  │       ├── Retry 2 (dopo 4s) → fallisce
  │       ├── Retry 3 (dopo 8s) → fallisce
  │       │
  │       ├── sharedStore.setLicenseStatus(false, "Impossibile verificare...", error: true)
  │       ├── sharedStore.setAppInitializing(false)
  │       ├── Banner ARANCIONE visibile con bottone "Riprova"
  │       └── return (blocca inizializzazione)
  │
  └── (resto dell'inizializzazione solo se licenza OK)


Bottone "Riprova" nel banner arancione:
  │
  ├── sharedStore.setLicenseLoading(true)
  ├── checkLicense() (con retry)
  │   ├── { s: 1, HMAC ok }  → sharedStore.setLicenseStatus(true) → initApp()
  │   ├── { s: 0, HMAC ok }  → sharedStore.setLicenseStatus(false, p) → banner ROSSO
  │   ├── HMAC invalido       → sharedStore.setLicenseStatus(false) → banner ROSSO
  │   └── Errore rete         → resta banner ARANCIONE
  └── sharedStore.setLicenseLoading(false)
```

### Sicurezza: livelli di protezione

| Attacco | Protezione |
|---------|-----------|
| Bloccare l'URL del server | Fail-closed: l'estensione non parte |
| Leggere l'URL nel codice | Offuscamento `stringArray` nasconde le stringhe |
| Mockare il server con `{ s: 1 }` | HMAC invalido → trattato come disattivato |
| Riutilizzare una vecchia risposta valida | Timestamp scaduto (>5 min) → rifiutata |
| Trovare il SECRET_KEY nel codice | Richiede reverse engineering dell'offuscamento |

---

## Feature 2: Offuscamento Codice

### Come funziona

- Flag `OBFUSCATE=true` passato come env variable alla build
- In `vite.config.ts`: quando il flag è attivo, aggiunge il plugin di offuscamento Rollup e disabilita le source maps
- Nuovi npm scripts per comodità

### Dipendenza da installare

```bash
npm install -D rollup-plugin-obfuscator javascript-obfuscator
```

### File da modificare

#### `vite.config.ts`
- Leggere `process.env.OBFUSCATE`
- Se `'true'`: aggiungere `rollup-plugin-obfuscator` ai plugins di Rollup (dentro `build.rollupOptions.plugins`)
- Se `'true'`: impostare `build.sourcemap: false`
- Configurazione offuscamento bilanciata (sicurezza vs performance):

```typescript
{
  renameGlobals: false,              // necessario per compatibilita Chrome extension
  stringArray: true,                 // cripta le stringhe
  stringArrayThreshold: 0.75,        // 75% delle stringhe
  controlFlowFlattening: true,       // rende il flusso illeggibile
  deadCodeInjection: true,           // aggiunge codice finto
  selfDefending: false,              // puo causare problemi con Chrome extensions
  disableConsoleOutput: false,       // lasciamo il controllo al DEBUG flag
}
```

#### `package.json`
Nuovi scripts:
```json
"build:obfuscated": "OBFUSCATE=true npm run build",
"build:prod:obfuscated": "OBFUSCATE=true npm run build:prod"
```

### Note importanti
- Le source maps vengono **disabilitate automaticamente** quando `OBFUSCATE=true`
- `npm run dev` non e mai offuscato (il plugin si attiva solo durante `vite build`)
- L'offuscamento aumenta la dimensione del bundle del ~30-50%

---

## Ordine di implementazione

| # | Azione | File |
|---|--------|------|
| 1 | Installare dipendenze offuscamento | `package.json` |
| 2 | Configurare offuscamento + nuovi scripts | `vite.config.ts`, `package.json` |
| 3 | Aggiungere env var `VITE_EXT_SYNC` | `.env.test`, `.env.production` |
| 4 | Creare utility licenseCheck (con retry + backoff + HMAC) | `src/utils/licenseCheck.ts` |
| 5 | Aggiungere stato licenza allo store | `src/stores/sharedStore.ts` |
| 6 | Creare componente alert (rosso + arancione) | `src/app/AppLicenseAlert.vue` |
| 7 | Integrare il check nel main content script | `src/content-scripts/main-content-script.ts` |

---

## Verifica

| Test | Come verificare | Risultato atteso |
|------|----------------|------------------|
| Offuscamento | `OBFUSCATE=true npm run build` → ispezionare `dist/` | Codice illeggibile |
| Kill switch ON | Server risponde `{ s: 1, t: ..., h: "..." }` con HMAC valido | Estensione funziona normalmente |
| Kill switch OFF | Server risponde `{ s: 0, t: ..., h: "...", p: "Test" }` con HMAC valido | Banner rosso visibile, estensione non si inizializza |
| HMAC invalido | Server risponde `{ s: 1 }` senza HMAC o con HMAC sbagliato | Banner rosso (trattato come disattivato) |
| Timestamp scaduto | Server risponde con `t` vecchio di >5 minuti | Banner rosso (risposta rifiutata) |
| Errore di rete | `VITE_EXT_SYNC` punta a URL inesistente | 3 retry (2s+4s+8s = ~14s), poi banner arancione con "Riprova" |
| Retry manuale OK | Click "Riprova" quando il server torna disponibile | Banner sparisce, estensione si inizializza |
| Retry manuale KO | Click "Riprova" quando il server e ancora down | Spinner durante il retry, poi banner arancione resta |
| Banner dismiss | Click sulla X di qualsiasi banner | Scompare. Refresh → riappare |

---

## Note per il server

Il server che espone l'endpoint deve:

1. **Generare la risposta firmata**:
   ```
   t = Unix timestamp corrente
   s = 1 (attivo) o 0 (disattivato)
   h = HMAC-SHA256("s={s}&t={t}", SECRET_KEY)
   p = messaggio (opzionale, solo se s=0)
   ```

2. **Condividere lo stesso `SECRET_KEY`** usato nell'estensione

3. **Endpoint suggerito**: `GET /api/v1/config` o `GET /api/ext/sync` (nomi generici)

4. **Headers CORS**: configurare appropriatamente se la chiamata non passa dal background worker
