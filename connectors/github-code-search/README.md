# GitHub Code Search MCP

Pacchetto connettore dichiarativo per il server MCP ufficiale di GitHub. Serve a
cercare codice pubblico, leggere file e verificare la licenza dei repository
quando si studia come altri software implementano una funzionalità.

## Due modalità, un solo scopo

| Modalità | Strumento | Credenziali |
| --- | --- | --- |
| Con login GitHub | questo connettore (MCP ufficiale) | token personale GitHub obbligatorio |
| Senza login GitHub | skill `opensource-implementation-scout` | nessuna credenziale, nessuna chiave SSH |

Questo connettore **richiede** un token GitHub. L'endpoint ufficiale risponde
`401` alle richieste anonime, quindi il pacchetto non promette alcun
funzionamento senza credenziali e il campo del token resta obbligatorio: un
campo vuoto produrrebbe solo un errore di autenticazione. Per cercare codice
senza login si usa la skill `opensource-implementation-scout`, che non fa parte
di questo pacchetto.

## Cosa contiene

Solo configurazione. Il pacchetto non avvia processi, non installa software e non
contiene credenziali. L'installazione aggiunge il template; la connessione viene
creata quando l'utente sceglie **Configura** e inserisce il proprio token.

## Trasporto

- Endpoint predefinito: `https://api.githubcopilot.com/mcp/` (Streamable HTTP).
- Autenticazione: header `Authorization: Bearer <token>` costruito dall'host dal
  campo segreto. Il token non è scritto nel pacchetto né nei log.
- URL modificabile: consentito, per puntare a un'istanza self-hosted del server
  MCP di GitHub.

## Campi

| Campo | Slot | Obbligatorio |
| --- | --- | --- |
| Token di accesso personale GitHub | header `Authorization`, prefisso `Bearer ` | sì |
| Toolset abilitati | header `X-MCP-Toolsets` | no |
| Modalità sola lettura | header `X-MCP-Readonly` | no |

## Limiti

- Il server MCP remoto richiede un token: senza credenziali la connessione non si
  autentica (`401` verificato). Una ricerca di codice senza login GitHub non è
  coperta da questo pacchetto: è compito della skill
  `opensource-implementation-scout`.
- I nomi dei toolset e il comportamento della sola lettura dipendono dal server
  GitHub; i valori nei suggerimenti sono indicazioni, non un contratto stabile.

Documentazione: <https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/copilot-for-common-tasks/use-the-github-mcp-server>
