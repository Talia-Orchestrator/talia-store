# Changelog

Le note qui sotto registrano le release Talia; le distribuzioni pubbliche sono
conservate nel repository talia-store.

## 0.16.3-main.40.1+2e7689beae39

- Windows x64 usa un installer NSIS con installazione guidata e scelta della cartella.
- La stessa versione comprende il DMG per Mac Apple Silicon e i pacchetti AppImage e Debian amd64 per Linux.

## 0.16.3 — Un rilascio per macOS, Windows e Linux

- Windows x64 usa un installer NSIS con installazione guidata e scelta della cartella.
- La stessa versione comprende il DMG per Mac Apple Silicon e i pacchetti AppImage e Debian amd64 per Linux.

## 0.16.2 — Installer Debian per Linux

- Il pacchetto .deb per Debian e Ubuntu amd64 affianca l’AppImage. Offre l’installazione tramite il gestore dei pacchetti senza richiedere FUSE.

## 0.16.1 — Distribuzione AppImage per Linux x64

- Il pacchetto Linux include il launcher per avviare l’AppImage anche sui sistemi senza FUSE 2. La verifica controlla l’integrità del launcher insieme a quella dell’AppImage.

## 0.16.0 — Tasks, archivio delle chat e materiali di progetto

- **Ricerca condivisa in Tasks.** Progetti e ricerca si applicano a entrambe le schede. La vista automatica permette di scegliere tutte le attività non umane oppure soltanto quelle assegnate ad agenti e team.
- **Archivio sempre accessibile.** Puoi aprire le chat archiviate prima di «Mostra altro», anche nelle liste di progetto.
- **Cestino delle chat.** La cancellazione multipla mostra l’avanzamento fino alla conclusione e il riallineamento dei materiali consulta direttamente lo stato delle chat.

- Chat collegate a task: sposta le chat nel Cestino senza cancellare i task, oppure scegli di eliminare definitivamente anche i task indicati, con una conferma separata. I collegamenti dai task e dai thread tornano utilizzabili dopo il ripristino della chat.

- File di lavoro e mockup nelle cartelle `.talia`. Le chat di progetto con
  cartella assegnata usano la sua sottocartella `.talia`, mentre le chat senza
  progetto usano `~/.talia`. Letture, preview, revisioni e cestino riconoscono
  la nuova sede e recuperano gli artefatti precedenti conservandone l'identità.

- Pacchetti ZIP portabili di agenti e team: esportazione e importazione di agenti e team in un unico archivio ZIP, con verifica del contenuto all'importazione. Verificato con 53 test di feature; documentazione in `desktop/docs/portable-packages-zip.md`. Verifica live nella beta ancora da eseguire.

- Chat lunghe, in verifica locale. Memoria automatica a gruppi con scambi recenti
  in chiaro, recupero mirato dei dettagli tramite la ricerca esistente e log delle
  dimensioni del contesto. La memoria salvata sopravvive alla riapertura delle
  chat lunghe. Prove con provider sintetico, qualità e consumi reali da misurare.

- Aggiornamenti: piccolo avviso non modale ancorato al numero versione al primo rilevamento nella sessione, senza spostare il focus. Chiusura e rinvio mantengono il badge; clic sulla versione per riaprire. Download e riavvio restano espliciti.

- Antigravity: i tool interni del runtime (comandi, lettura e modifica file,
  ricerca web e altri) sono ora disattivati alla creazione della sessione con
  `enabledTools: []`. Il modello può agire solo con i tool di Talia, quindi i
  turni lunghi non si interrompono più con `ANTIGRAVITY_NATIVE_TOOL_REJECTED`
  quando sceglieva uno strumento proprio. Controllo fail-closed invariato.
  Verifica live nella beta ancora da eseguire.
- Antigravity: preriscaldamento del processo ACP. All'avvio, e dopo ogni chat
  che lo adotta, Talia prepara in background processo, login e una sessione
  vuota per il modello chat prioritario, senza alcun prompt. La prima chat
  nuova lo adotta senza rifare avvio, login e `session/new`. Prova live con
  account free: primo messaggio da circa 4 s di preparazione a 0 s, primo testo
  in circa 5 s. Riserva unica per profilo, durata 30 minuti; login scaduto
  scartato in silenzio. Dettagli in `desktop/docs/antigravity-provider-api.md`.

- Antigravity: le risposte host con a capo letterali o recinzioni markdown
  chiuse male vengono riparate senza perdita. Un envelope ancora invalido riceve
  una sola richiesta di correzione nella stessa sessione ACP, senza rispedire il
  prompt e senza duplicare il testo già mostrato; il veto al replay automatico
  resta per gli effetti incerti. Il log registra solo la categoria del difetto.
  Un `authenticate` -32603 senza marcatore, fuori dal login, diventa «accesso
  richiesto» senza tre tentativi di rete. L'avviso testuale «No capacity
  available for model …» non è più scambiato per JSON malformato: due nuovi
  tentativi brevi nella stessa sessione, poi errore temporaneo ripetibile. Anche
  uno strumento inesistente riceve la correzione. Prova live con account free:
  17 prompt, 2 risposte rotte (capacità esaurita e JSON con token spurio)
  riparate senza errori in chat. Enterprise non verificato. Dettagli in
  `desktop/docs/antigravity-provider-api.md`.

- Beta Git/SSH: in Piena fiducia la shell usa direttamente i file SSH esatti
  necessari a Git, incluse le identità locali se l'agente SSH è vuoto. Nelle
  altre modalità chiede un solo consenso per repository, remoto e risorse,
  riutilizzabile nella stessa attività. `git push` e le operazioni locali
  conservano i loro controlli distinti; una lettura diretta della chiave non
  eredita il consenso Git. Nessuna lettura generale di `.ssh`. Su macOS il `PATH`
  preferisce Homebrew Git ad Apple Git anche quando entrambi erano già
  elencati, preservando le voci custom dell'utente. Il gate copre anche
  `git -C repo ls-remote` da una chat con cartella diversa e i metadati dei
  worktree Git esterni alla cartella selezionata. Anche `gh` diretto riceve
  il solo file del portachiavi login necessario al token; nelle modalità con
  consenso la richiesta vale per il comando esatto. Git SSH e `gh api` reali
  sono passati nel profilo Seatbelt. Nell'app beta riavviata, Git `ls-remote`
  e `fetch` e `gh api user` sono riusciti dopo i consensi monouso. Dettagli in
  `doc/sandbox-autorizzazioni-filesystem.md`.

- Inner Browser: modale standard Talia per certificati personalizzati;
  casella di rischio e scelta umana **Procedi comunque** /
  **Annulla**. Errori di caricamento spiegati al posto della vista vuota.
  HTTPS senza certificato resta non apribile, senza downgrade automatico.
  Pin origine/porta/certificato, sessione isolata e limite di cinque minuti
  preservati. Candidato locale: prove e limiti in
  `desktop/docs/inner-browser-tls-warning-handoff.md`; nessuna nuova build.

- Privacy filesystem — rafforzamento post-QA (non distribuito): fail-closed
  se il confinamento letture non è disponibile (sandbox-exec assente o
  piattaforma senza sandbox equivalente: il comando viene rifiutato, mai
  eseguito non confinato); allowlist ristretta (niente `subpath /private`
  per metadata, `/Library` non più leggibile come dati, PATH preso solo
  dall'env della sandbox); motivo concreto obbligatorio in ogni contesto
  (richieste segnaposto tipo "motivo non specificato" sono bloccate prima
  del popup); grant di cartella persistenti e visibili per progetto e chat
  (`folderGrants.list/request/revoke`), solo lettura, revoca con stop
  confermato dei processi sessione attivi. Dettagli e limiti:
  desktop/docs/filesystem-privacy-audit.md.

- Privacy filesystem: la sandbox shell su macOS ora confina anche le letture
  (deny-by-default con allowlist esplicita) oltre alle scritture: workspace,
  allegati, grant espliciti e percorsi runtime di sistema e app; symlink e
  traversal risolti dal kernel fuori dalle radici sono negati. Le richieste
  di accesso esterno richiedono consenso motivato; i riferimenti a percorsi
  in file del workspace non autorizzano l'accesso. Limiti: non applicato alle
  modalità globali all_files_* (autorizzazione esplicita utente), solo macOS
  con sandbox-exec. Dettagli: desktop/docs/filesystem-privacy-audit.md.
- Privacy filesystem: la policy predefinita include Music, Pictures e Movies
  fuori dal workspace esplicito. La verifica del materiale pubblico non legge
  file già bloccati da regole non esentabili; le librerie multimediali esterne
  non vengono sondate per preparare grant di cartella. Correzione locale,
  non distribuita; origine del popup Apple Music attribuito a Warp non provata.
  Evidenze e limiti: desktop/docs/filesystem-privacy-audit.md.
- Candidato locale: avatar flottanti degli agenti al lavoro sopra il composer,
  con salto discreto disattivabile tramite movimento ridotto e navigazione
  al balloon con click o tastiera. Supportati più attori e rimozione degli
  indicatori al termine dell’attività. Verificati 30 controlli Chromium su
  fixture, 48 regressioni e typecheck; QA indipendente Electron 7/7 e stress
  layout 3/3 superati con backend reale e trasporti locali controllati.
  Provider commerciali, Windows/Linux e packaging non verificati.
  [Dettagli](desktop/docs/active-agent-avatars.md).

- Correzione indicatore contesto subagente: il popover si apre ancorato al
  balloon dell'attore cliccato, non più al composer di Commander in basso. Le
  percentuali frazionarie non vengono più arrotondate a zero dall'host
  (es. 73/55.808 token ora mostra ~0,13% invece di 0%). Sotto l'1% il pannello
  mostra fino a due decimali; il riempimento resta proporzionale senza soglie
  artificiali, quindi percentuali sub-pixel (es. 0,24% su 14 px) restano
  visivamente impercettibili. Verificati con host/storage reali e provider
  sintetico: probe 1/1, Electron 8/8, typecheck desktop/E2E; QA indipendente
  con misure proporzionali su più livelli. Nessun provider live né confronto
  col mock originale.
## 0.15.2 — connettori Store che ricordano la configurazione, chat trascinabili e uscita protetta

- **Connettori Store riconosciuti dopo la configurazione**: un pacchetto dello Store configurato, come Confluence, non resta più «Da configurare», mostra «Gestisci» e compare nella tendina `@` insieme agli altri connettori.
- **Configurazione con memoria**: riaprendo un connettore i dati salvati sono già compilati e il token resta nascosto; salvando senza riscriverlo Talia riusa quello salvato, anche nei connettori MCP personalizzati e nei template.
- **Chat trascinabili nella barra laterale**: trascina una chat tra le fissate per fissarla in quella posizione, o sull'Archivio per archiviarla; con una selezione multipla si spostano tutte insieme.
- **Uscita protetta con agenti al lavoro**: se un agente sta lavorando Talia chiede conferma prima di chiudersi; Cmd-Q su macOS e Ctrl-Q su Windows e Linux vanno tenuti premuti un secondo e mezzo. Un puntino verde accanto al pulsante di invio segnala che l'agente è al lavoro.
- **Build Windows più rapida**: il pacchetto portable usa una compressione veloce; il file scaricato è un po' più grande.

La versione mostrata accanto al logo è `v0.15.2`. Il trascinamento delle chat funziona con il mouse e dentro la stessa lista; l'Archivio accetta chat solo se ne contiene già almeno una. I connettori non sono stati provati con un servizio Atlassian reale.

- Connettori (#179, #180): stato del pacchetto letto dal collegamento cifrato;
  strumenti `*_store_connector_*` nella tendina `@`; segreti mascherati
  riusati al salvataggio; E2E `talia_store_connector_e2e_user_flow`.
- Sidebar (#181): `conversations.placePins` e `pin_order`.
- Uscita (#182): `quit_guard`, scorciatoia prolungata e submenu nativo macOS.
- CI (#183): `ELECTRON_BUILDER_COMPRESSION_LEVEL=1` per il portable Windows.

## 0.15.1 — dallo Store alla configurazione in un passo

- **Dopo l'installazione si apre la configurazione**: installando un connettore o un agente dallo Store, Talia apre subito il suo modulo di configurazione o la sua card, invece di tornare all'elenco delle fonti.
- **Connettori installati sempre visibili**: i connettori dello Store non ancora configurati, come SolidCraft o i pacchetti Atlassian, compaiono nella pagina Connettori in «Installati dallo Store», con «Configura» e «Rimuovi».

La versione mostrata accanto al logo è `v0.15.1`. I pacchetti vengono verificati separatamente per ogni piattaforma; i test locali non equivalgono a una prova con account reali.

- Store (#177): `ResourceStore.openInstalled` usato da «Apri» e dopo una
  nuova installazione; `store_connectors` in `connectors.catalog`; tutti i
  template passano dal modulo generico con `store_package`.
- Build (#175, #176): manifest dei contenuti incorporati rigenerato.
  Non provato nell'app avviata.

## 0.15.0 — Store unico per i connettori, Antigravity più stabile e chat in blocco

- **Connettori dallo Store senza aggiornare l'app**: un connettore MCP pubblicato nello Store dichiara i campi che servono (token, indirizzo, cartelle) e Talia mostra un modulo per compilarli. I segreti restano cifrati sul dispositivo e niente parte finché non premi «Connetti».
- **Connettori tutti eliminabili, primo avvio pulito**: un profilo nuovo non mostra più connettori predefiniti come DingTalk, Lark, WeCom o la suite Craft. Quelli che aggiungi dallo Store, o che hai già collegato, restano e si tolgono con «Rimuovi»; lo Store resta la fonte da cui riaggiungerli.
- **Confluence, Jira e Bitbucket dallo Store**: pacchetti firmati per Cloud e Data Center, limitati agli spazi, progetti o repository scelti, con conferma prima di ogni scrittura. Si aggiornano dallo Store e si può tornare alla versione precedente.
- **Antigravity regge i lavori lunghi**: Talia ricorda a Gemini il formato di risposta a ogni turno, non chiude più il processo per un backslash fuori posto (percorsi Windows, regex) e prova fino a due correzioni prima di fermarsi. Prima, nei processi lunghi, il lavoro si interrompeva con `ANTIGRAVITY_INVALID_HOST_RESPONSE`.
- **Chat in blocco nella barra laterale**: Maiusc+clic seleziona un intervallo, Cmd/Ctrl+clic aggiunge o toglie; con il tasto destro archivi o ripristini più chat insieme.
- **Barra laterale più comoda**: tasto destro su chat e progetti con lo stesso menu del «⋯», archivio delle chat, progetti fissati riordinabili trascinandoli sull'intera lista.
- **Partecipanti e team nella chat**: tendina dei partecipanti con i team come preset, aggiunta e rimozione senza chiudere la tendina; pannello del progetto rivisto.
- **Task avviati in blocco**: una casella per selezionare tutti i task visibili di una colonna e avviarli insieme.
- **Ricerca agenti dello Store più affidabile**: gli agenti rimossi non compaiono più nei risultati e la tendina @ del composer è più larga.

La versione mostrata accanto al logo è `v0.15.0`. I pacchetti vengono verificati separatamente per ogni piattaforma; i test locali non equivalgono a una prova con account reali.

- Connettori template (#173): campi dichiarati dal pacchetto (env, header,
  flag), `connectors.add_from_store`, modulo generico, rimozione con
  `store_package`. Elenco iniziale vuoto e `connectors.remove_listing`.
  Non provati con un pacchetto template pubblicato.
- Pacchetti connettore indipendenti (#170): manifest dichiarativi firmati,
  credenziali cifrate per versione, aggiornamento e ripristino; pacchetti
  Atlassian nello Store con `minHostVersion` 0.15.0. Non provati con istanze
  Atlassian reali.
- Connettori a token Atlassian (#167), ricerca agenti Store (#172), tendina @
  (#171), Antigravity (#168), barra laterale (#162, #164, #165, #166), chat e
  progetto (#163), task in blocco (#162).
- Le versioni precedenti mostrano i nuovi pacchetti dello Store come non
  compatibili finché non si aggiornano.

## 0.14.2 — task con esito, commenti e lavoro in parallelo

- **L'esito di ogni task**: quando un agente porta un task in revisione o lo completa scrive cosa ha fatto; la prima riga compare sulla card e il testo completo nel pannello del task, con il link alla conversazione.
- **Commenti sui task**: apri il pannello accanto alla board, leggi esiti e note, scrivi un commento; con «Commenta e rimetti in lavorazione» l'agente riprende nella stessa conversazione tenendo conto del tuo commento. Un clic su un'altra card mostra i suoi commenti; il doppio clic apre la modifica.
- **Task «Fermi»**: se un'esecuzione finisce senza esito il task lo dice, invece di restare in lavorazione in silenzio.
- **Più task insieme, sotto controllo**: scegli quanti task lavorano contemporaneamente e quanti avvii al giorno, per il progetto e in generale (anche «Nessun limite»). Prima l'avanzamento automatico poteva avviare un nuovo task ogni due minuti anche con il precedente ancora in corso.
- **Board più leggibile**: filtri rapidi con contatori (da revisionare, risposte nuove, fermi, in scadenza, assegnati a me), altri filtri a scomparsa, ordinamento e viste salvate; selezione multipla per cambiare stato, spostare in un altro progetto, assegnare, categorizzare, impostare la scadenza o eliminare più task insieme.
- **Stop sempre disponibile**: il pulsante di arresto compare quando lavora un agente qualsiasi, e un nuovo messaggio dopo un'interruzione non fallisce più con «sessione occupata».

La versione mostrata accanto al logo è `v0.14.2`. I pacchetti vengono verificati separatamente per ogni piattaforma; i test locali non equivalgono a una prova con account reali.

- Task (#158): thread per task in `task_comments/<tid>/`, esito obbligatorio
  per review/done nel tool `todo_tasks` con azioni `comment` e
  `list_comments`, ripresa da commento con stato atteso, eventi
  `run_ended_without_outcome`/`run_failed`. Driver con slot reali,
  parallelismo e limite giornaliero per lista e globali, motivo dello stop
  visibile. Filtri, viste salvate, selezione multipla e spostamento tra
  progetti con copia verificata. Verificato con test e percorso Electron su
  profilo di prova; rimessa in lavorazione e parallelismo non ancora provati
  con un modello reale. L'eliminazione non usa il cestino.
- Chat (#156): stop visibile con qualunque attore occupato; la sessione
  attende fino a 30 secondi il rilascio del turno interrotto invece di
  rispondere `SESSION_BUSY`. Messaggio a un agente occupato non ancora provato
  a mano.
- Test (#157): suite renderer riallineata su beta; nessun effetto sull'app.

## 0.14.1 — risposte Antigravity riparate senza perdere il turno

- **Antigravity non perde più la risposta riparata**: quando Gemini sbaglia il formato dopo aver già mostrato il testo, la correzione nella stessa sessione non viene più scartata se riformula la frase; il testo già letto resta in chat e gli strumenti richiesti partono.
- **Chat più pulita**: le offerte di approvazione dei singoli lavori compaiono nella cronologia della chat invece che in un pannello fisso sopra i messaggi; una chat senza offerte non mostra nulla.

La versione mostrata accanto al logo è `v0.14.1`. I pacchetti vengono verificati separatamente per ogni piattaforma; i test locali non equivalgono a una prova con account reali.

- Antigravity (#154): la richiesta di correzione riporta il testo già mostrato
  e chiede di iniziare con esso. Se il modello lo riformula comunque,
  `reconcileRepairedContent` conserva il testo mostrato (bozza completa) o
  accoda quello corretto (bozza parziale) invece di chiudere il turno con
  `ANTIGRAVITY_INVALID_HOST_RESPONSE` (`incompatible`). Log
  `ACP host response repaired` con `shown_text_kept: true`. Verificato con test
  che riproduce il caso reale e fallisce senza la correzione; non ancora
  provato dal vivo.
- Chat (#151): offerte host montate nella cronologia scorrevole e rimontate
  dopo il caricamento, senza intestazione globale né lista vuota; azioni per
  lavoro e controlli IPC/host invariati.
- CI (#153): packaging Windows più rapido (esclusioni Defender sul runner
  effimero); nessun effetto sull'app installata.

## 0.14.0 — automazioni nella stessa chat e Antigravity senza interruzioni

- **Automazioni nella stessa chat**: ogni esecuzione di un'automazione, pianificata o manuale, continua nella chat già usata invece di aprirne una nuova; si può scegliere per ogni automazione se riusare la chat (predefinito) o partire da zero.
- **Antigravity senza tool interni**: i comandi e gli strumenti propri del runtime Antigravity sono disattivati alla fonte, così i lavori lunghi non si fermano più con «tool nativo rifiutato».
- **Scopri Talia**: la home mostra insieme tutti e sei i suggerimenti.

La versione mostrata accanto al logo è `v0.14.0`. I pacchetti vengono verificati separatamente per ogni piattaforma; i test locali non equivalgono a una prova con account reali.

- Antigravity: i tool interni del runtime (comandi, lettura e modifica file,
  ricerca web e altri) sono disattivati alla creazione della sessione con
  `enabledTools: []`. Il modello può agire solo con i tool di Talia. Prova live
  con account free: richiesta esplicita di usare i tool propri, filtro vecchio
  3/3 `view_file` eseguito, filtro nuovo 0/3. Controllo fail-closed invariato.
  Non ancora riprodotto sui compiti di progetto reali.
- Automazioni: binding persistente della chat di esecuzione per ogni task,
  modalità `persistent` (predefinita) o `fresh`, creazione serializzata per
  evitare chat duplicate e attribuzione del terminale per singola esecuzione.
- Scopri Talia: i sei suggerimenti sono visibili contemporaneamente; il clic
  inserisce la bozza senza invio automatico.

## 0.13.1 — Antigravity più affidabile e più rapido

- **Risposte Antigravity riparate**: un JSON imperfetto di Gemini o l'avviso di capacità esaurita non interrompono più la chat con «risposta host non valida»; Talia chiede una sola correzione nella stessa sessione e attende brevemente quando il modello è occupato.
- **Primo messaggio più rapido**: all'avvio Talia prepara in background processo, accesso e sessione Antigravity, così la prima chat nuova non attende circa 4 secondi di preparazione.
- **Accesso scaduto chiaro**: un login Antigravity non più valido mostra un messaggio di autenticazione invece di tre tentativi di rete.

La versione mostrata accanto al logo è `v0.13.1`. I pacchetti vengono verificati separatamente per ogni piattaforma; i test locali non equivalgono a una prova con account reali.

- Antigravity: preriscaldamento del processo ACP. All'avvio, e dopo ogni chat
  che lo adotta, Talia prepara in background processo, login e una sessione
  vuota per il modello chat prioritario, senza alcun prompt. La prima chat
  nuova lo adotta senza rifare avvio, login e `session/new`. Prova live con
  account free: primo messaggio da circa 4 s di preparazione a 0 s, primo testo
  in circa 5 s. Riserva unica per profilo, durata 30 minuti; login scaduto
  scartato in silenzio. Dettagli in `desktop/docs/antigravity-provider-api.md`.

- Antigravity: le risposte host con a capo letterali o recinzioni markdown
  chiuse male vengono riparate senza perdita. Un envelope ancora invalido riceve
  una sola richiesta di correzione nella stessa sessione ACP, senza rispedire il
  prompt e senza duplicare il testo già mostrato; il veto al replay automatico
  resta per gli effetti incerti. Il log registra solo la categoria del difetto.
  Un `authenticate` -32603 senza marcatore, fuori dal login, diventa «accesso
  richiesto» senza tre tentativi di rete. L'avviso testuale «No capacity
  available for model …» non è più scambiato per JSON malformato: due nuovi
  tentativi brevi nella stessa sessione, poi errore temporaneo ripetibile. Anche
  uno strumento inesistente riceve la correzione. Prova live con account free:
  17 prompt, 2 risposte rotte (capacità esaurita e JSON con token spurio)
  riparate senza errori in chat. Enterprise non verificato. Dettagli in
  `desktop/docs/antigravity-provider-api.md`.

## 0.13.0 — lavoro in chat e accessi più chiari

- **Chat e progetti**: nuova attività in bozza, partecipanti e modelli più facili da scegliere; pannello progetto riunito e spazio di lavoro adattivo.
- **Team e agenti**: configurazione del team più compatta, trasferimento delle impostazioni di inferenza e copie personali degli agenti Store modificabili.
- **Accessi locali**: consensi motivati per file e cartelle, grant revocabili, sandbox di lettura più stretta e correzioni per Git SSH e `gh`.
- **Store e browser**: controlli più precisi sulle sorgenti del catalogo e consenso temporaneo per certificati personalizzati nell'Inner Browser.
- **Affidabilità**: recupero dei checkpoint Antigravity, anteprime file esplicite e correzioni per chat, contesto e navigazione.

La versione mostrata accanto al logo è `v0.13.0`. I pacchetti vengono verificati separatamente per ogni piattaforma; i test locali non equivalgono a una prova con account reali.

- Beta Git/SSH: in Piena fiducia la shell usa direttamente i file SSH esatti
  necessari a Git, incluse le identità locali se l'agente SSH è vuoto. Nelle
  altre modalità chiede un solo consenso per repository, remoto e risorse,
  riutilizzabile nella stessa attività. `git push` e le operazioni locali
  conservano i loro controlli distinti; una lettura diretta della chiave non
  eredita il consenso Git. Nessuna lettura generale di `.ssh`. Su macOS il `PATH`
  preferisce Homebrew Git ad Apple Git anche quando entrambi erano già
  elencati, preservando le voci custom dell'utente. Il gate copre anche
  `git -C repo ls-remote` da una chat con cartella diversa e i metadati dei
  worktree Git esterni alla cartella selezionata. Anche `gh` diretto riceve
  il solo file del portachiavi login necessario al token; nelle modalità con
  consenso la richiesta vale per il comando esatto. Git SSH e `gh api` reali
  sono passati nel profilo Seatbelt. Nell'app beta riavviata, Git `ls-remote`
  e `fetch` e `gh api user` sono riusciti dopo i consensi monouso. Dettagli in
  `doc/sandbox-autorizzazioni-filesystem.md`.

- Inner Browser: modale standard Talia per certificati personalizzati;
  casella di rischio e scelta umana **Procedi comunque** /
  **Annulla**. Errori di caricamento spiegati al posto della vista vuota.
  HTTPS senza certificato resta non apribile, senza downgrade automatico.
  Pin origine/porta/certificato, sessione isolata e limite di cinque minuti
  preservati. Candidato locale: prove e limiti in
  `desktop/docs/inner-browser-tls-warning-handoff.md`; nessuna nuova build.

- Privacy filesystem — rafforzamento post-QA (non distribuito): fail-closed
  se il confinamento letture non è disponibile (sandbox-exec assente o
  piattaforma senza sandbox equivalente: il comando viene rifiutato, mai
  eseguito non confinato); allowlist ristretta (niente `subpath /private`
  per metadata, `/Library` non più leggibile come dati, PATH preso solo
  dall'env della sandbox); motivo concreto obbligatorio in ogni contesto
  (richieste segnaposto tipo "motivo non specificato" sono bloccate prima
  del popup); grant di cartella persistenti e visibili per progetto e chat
  (`folderGrants.list/request/revoke`), solo lettura, revoca con stop
  confermato dei processi sessione attivi. Dettagli e limiti:
  desktop/docs/filesystem-privacy-audit.md.

- Privacy filesystem: la sandbox shell su macOS ora confina anche le letture
  (deny-by-default con allowlist esplicita) oltre alle scritture: workspace,
  allegati, grant espliciti e percorsi runtime di sistema e app; symlink e
  traversal risolti dal kernel fuori dalle radici sono negati. Le richieste
  di accesso esterno richiedono consenso motivato; i riferimenti a percorsi
  in file del workspace non autorizzano l'accesso. Limiti: non applicato alle
  modalità globali all_files_* (autorizzazione esplicita utente), solo macOS
  con sandbox-exec. Dettagli: desktop/docs/filesystem-privacy-audit.md.
- Privacy filesystem: la policy predefinita include Music, Pictures e Movies
  fuori dal workspace esplicito. La verifica del materiale pubblico non legge
  file già bloccati da regole non esentabili; le librerie multimediali esterne
  non vengono sondate per preparare grant di cartella. Correzione locale,
  non distribuita; origine del popup Apple Music attribuito a Warp non provata.
  Evidenze e limiti: desktop/docs/filesystem-privacy-audit.md.
- Candidato locale: avatar flottanti degli agenti al lavoro sopra il composer,
  con salto discreto disattivabile tramite movimento ridotto e navigazione
  al balloon con click o tastiera. Supportati più attori e rimozione degli
  indicatori al termine dell’attività. Verificati 30 controlli Chromium su
  fixture, 48 regressioni e typecheck; QA indipendente Electron 7/7 e stress
  layout 3/3 superati con backend reale e trasporti locali controllati.
  Provider commerciali, Windows/Linux e packaging non verificati.
  [Dettagli](desktop/docs/active-agent-avatars.md).

- Correzione indicatore contesto subagente: il popover si apre ancorato al
  balloon dell'attore cliccato, non più al composer di Commander in basso. Le
  percentuali frazionarie non vengono più arrotondate a zero dall'host
  (es. 73/55.808 token ora mostra ~0,13% invece di 0%). Sotto l'1% il pannello
  mostra fino a due decimali; il riempimento resta proporzionale senza soglie
  artificiali, quindi percentuali sub-pixel (es. 0,24% su 14 px) restano
  visivamente impercettibili. Verificati con host/storage reali e provider
  sintetico: probe 1/1, Electron 8/8, typecheck desktop/E2E; QA indipendente
  con misure proporzionali su più livelli. Nessun provider live né confronto
  col mock originale.

## 0.12.0 — contesto e strumenti più chiari

- **Contesto per destinatario e compattazione manuale**: Commander e agenti
  mostrano stime separate. Il popover permette di leggere i valori disponibili
  e avviare una compattazione con checkpoint persistente, con annullamento e
  ripristino del focus.
- **Prompt personali nel popup @**: ricerca, variabili e inserimento nella
  bozza restano disponibili senza invio automatico e senza occupare la barra
  inferiore del composer.
- **Modelli e agenti nel nuovo task**: il catalogo è filtrabile e mostra
  descrizioni e capacità di reasoning; la configurazione del modello si può
  copiare tra agenti. I conflitti di revisione chiedono conferma invece di
  forzare la creazione.
- **Inner Browser con certificati personalizzati**: il consenso vale per
  origine e certificato in una sessione temporanea; chiusura della scheda e
  scadenza revocano la fiducia.
- **Diagnostica più circoscritta**: i rifiuti HTTP 400 di openai-codex
  registrano soltanto la forma della richiesta già inviata, senza testo o
  credenziali. La causa dei rifiuti osservati resta da determinare.

Limiti: i test usano prevalentemente profili e provider sintetici; account
reali, collaudo assistivo completo e sostituzione di installazioni Windows o
Linux restano da verificare. Le note tecniche seguenti precisano le prove per
ciascuna modifica.

## Registro tecnico delle modifiche confluite nella 0.12.0

Le note cronologiche conservano verifiche e limiti delle singole tranche. Le
frasi sulla mancata build descrivono lo stato al momento degli interventi.

- Contesto e compattazione: il composer mostra sempre la stima di Commander,
  anche quando `To` cambia; ogni subagente ha il proprio indicatore compatto
  nell'header del balloon. Il refresh preserva il focus e l'annullamento della
  compattazione; Escape chiude il popover e ripristina il focus al trigger.
  Verificati Electron mirato 8/8, riproduttori 2/2 e typecheck E2E con IPC
  sintetico; nessun provider live né confronto col mock originale.

- Diagnostica interna per i rifiuti HTTP 400 di `openai-codex`: il log registra
  solo numero e tipi degli elementi della richiesta già inviata. Nessun testo,
  ID, argomento o credenziale viene conservato. La richiesta e il comportamento
  di retry restano invariati; la causa dei 400 osservati e la correzione restano
  da determinare dopo un nuovo caso reale. Nessuna nuova funzione utente o build.

- Progetto/Nuova attività: catalogo modelli standard filtrabile, descrizione su
  riga dedicata, reasoning a capacità reali e copia/incolla per agente incluso
  Commander. Aggiunta agenti corretta prima della creazione e persistente al
  riavvio. Risolti INFERENCE_TARGET_INVALID da metadati UI e STALE_REVISION:
  confronto e conferma esplicita recuperano la revisione senza creazioni forzate.
  QA indipendente Electron macOS 10/10, fixture sintetiche; nessun provider live,
  nuova build o verifica CLI/ACP dedicata.

- Corretto lo sfondo trasparente del popover del contesto: superficie opaca
  e testo usano i token semantici dei tre temi supportati. Verificati
  typecheck E2E, Electron isolato 6/6 e screenshot sopra il composer;
  provider sintetico, nessuna nuova build.

- La libreria dei prompt personali è disponibile nella scheda **Prompt** del
  popup aperto con **@**; non occupa più la barra inferiore dei composer.
  Ricerca, variabili e inserimento nella bozza sono mantenuti senza invio
  automatico. Escape e X chiudono il popup con focus al composer; Escape su una
  conferma chiude solo la conferma. Verificati journey Electron macOS isolato,
  test renderer e picker desktop/mobile, con ricollaudo QA indipendente
  completato. Verificata anche la consegna dello snapshot finale dei turni
  prima della chiusura IPC. Windows/Linux non verificati; la suite backend
  completa mantiene fallimenti riprodotti anche nella baseline.

Indicatore di stima del contesto per destinatario e compattazione manuale con checkpoint persistente, senza soglia minima. Il cerchio statico da 24 px si riempie dal basso; budget ignoto e stima incompleta sono espliciti. Commander e agenti hanno contesti separati; le righe team non sommano i budget. Cronologia condivisa e soglie automatiche preservate; solo un flush riuscito conferma il salvataggio.

Follow-up UI non rilasciato: il cerchio accanto a To è cliccabile e apre un popover sopra il composer con valori disponibili e compattazione manuale. Verificati typecheck, renderer 531/531, host 5/5, core 134/134 e E2E Electron 6/6; un E2E usa IPC/host/storage reali con provider sintetico e gli altri cinque IPC sintetico. Screenshot runtime acquisito; confronto diretto col mock non verificato perché il suo artefatto originale non era accessibile.

Ricollaudo indipendente: host **227/227**, core/sessione/checkpoint **134/134**, renderer **531/531**, Electron effimero **6/6**, typecheck desktop/E2E e diff check superati. Il primo run host ha avuto un timeout di quiescenza Codex, poi passato isolato e nella suite ripetuta: flakiness residua non risolta. Un caso Electron usa UI→IPC→host e storage reali con provider sintetico, cancel attivo e riavvio con transcript da disco; gli altri cinque usano IPC sintetico. Il caso annullato non salva un nuovo checkpoint. Nessun provider live, collaudo assistivo completo, packaging o nuova distribuzione verificati. Gli avvisi nativi precedenti non si sono riprodotti: causa non accertata; preflight bundled Node non certificato. Nessun bump versione. Dettagli in `docs/context-compaction-checkpoint.md`.

- Inner Browser: le pagine con certificato personalizzato/self-signed possono
  essere aperte dopo consenso esplicito in una sessione temporanea isolata,
  vincolata a origine e certificato. Nessuna fiducia globale o salvata: chiusura
  della scheda per revoca e scadenza automatica dopo cinque minuti.
  Cookie del profilo, popup e risorse di altre origini non sono disponibili.
  Integrazione sorgente autorizzata dal proprietario con limiti manuali noti.
  Typecheck, 62 test mirati ed E2E Electron automatico superati su macOS;
  il consenso nei test è simulato. Prova umana completa e revoca al cambio
  account restano non attestate; nessuna nuova build o distribuzione.
- Gli agenti senza dipendenze strumenti esplicite caricano progressivamente le
  capacità disponibili, senza precaricarle tutte. Il caricamento resta limitato
  al turno e non amplia permessi o dominio dell'agente; le dipendenze esplicite
  e la compatibilità Commander sono conservate.
- Le app rifiutano un contesto di modifica danneggiato o privato del tipo app:
  occorre riaprire la modifica dall'app. La visualizzazione resta tollerante,
  senza trasformare il recupero dei metadati in autorizzazione di modifica.
- Verifiche catalogo e binding: suite mirata 331/331, saved_apps 120/120 e
  typecheck main/core ed E2E superati su macOS, con recheck indipendente.
  Non attestati runtime Inner Browser, provider live, suite ampia e smoke EPERM.
  Nessuna nuova build inclusa.

- Team e Partecipanti: azioni compatte «Copia config.» e «Incolla config.»
  trasferiscono modello/provider, selezione runtime e Pensiero tra agenti e tra
  le due superfici nella stessa finestra. Non copiano prompt, identità, risorse
  o credenziali; configurazioni incompatibili sono rifiutate senza applicazioni
  parziali. Auto resta senza override.
- Editor Team ridisegnato con configurazione membri espandibile e azioni su
  riga separata: le descrizioni lunghe restano leggibili anche a 1024×645.
  Se il cambio modello invalida il Pensiero, avviso e reset ad Auto vengono
  persistiti insieme al modello anche nei Partecipanti.
- Prerequisito già presente sul main locale: capacità API/CLI versionate non
  scadono durante l'editing; TTL ACP conservati. Registrato il controllo delle
  deleghe nel catalogo strumenti Commander.

Verifiche locali su macOS: 18 percorsi Electron con profili effimeri e fixture,
5 test renderer Team Builder e typecheck. Non attestano provider live, Qwen Max,
Windows/Linux o il CSS della finestra QA manuale precedentemente aperta.
Il confronto i18n resta 46/47 anche sulla base immutata (2.210 differenze nelle
tabelle esistenti); nessuna nuova regressione rilevata nel confronto QA.
Nessuna nuova build o distribuzione inclusa.

## 0.11.1 — il team e i modelli, più facili da gestire

- Un team pronto dallo Store: puoi installare un team con gli agenti e le
  dipendenze dichiarate, poi personalizzare team e agenti. Lo Store Talia
  firmato raccoglie anche skill, connettori, app e il Manuale Talia.
- Specialisti più facili da trovare: Commander confronta gli agenti già in
  chat, quelli installati e quelli dello Store. Quando propone uno specialista
  da installare, la scelta resta tua. Per lavori composti suggerisce ruoli,
  dipendenze e verifiche senza avviare automaticamente nuovi agenti.
- Partecipanti e Team Builder più leggibili: la chat raccoglie i partecipanti
  in un pannello con ricerca e controlli per modello e Pensiero. Le card del
  Team Builder mostrano descrizione e avatar invece degli ID tecnici e aprono
  la configurazione nello stesso modo.
- Pensiero legato al modello scelto: i controlli mostrano gli effort nativi
  attestati per quel modello; Auto non invia un override. Se la capacità non è
  nota, l'app non inventa livelli. Il catalogo OpenRouter esclude le varianti
  asincrone con suffisso :batch dalla scelta per la chat.
- Lavoro in chat e Tasks più chiaro: Commander può ricevere nuovi messaggi
  mentre altri agenti lavorano. I Tasks includono assegnazioni a team e una
  vista Kanban con spostamento e ordine persistente. La sidebar segnala i
  lavori completati che non hai ancora aperto.
- Impostazioni e strumenti: la pagina dei modelli si chiama «Providers» e
  guida il collegamento degli account. Inner Browser è disponibile come
  connettore nativo; il workspace a schede resta una scelta sperimentale da
  attivare nelle impostazioni.

Limiti: le proposte di Commander non garantiscono una delega completata;
capacità modello sconosciute restano non configurabili. Le prove automatizzate
usano profili e provider simulati; gli account reali e l'aggiornamento di una
installazione Windows o Linux non sono stati qualificati in questa tranche.

## Registro tecnico delle modifiche confluite nella 0.11.1

Le note cronologiche seguenti conservano le verifiche e i limiti delle singole
tranche. Le frasi sulla mancata build descrivono lo stato al momento di ciascun
intervento.

- OpenRouter: il catalogo per la chat esclude le varianti asincrone con suffisso
  `:batch`, anche quando provengono da una cache precedente. La scelta manuale
  di questi ID è rifiutata; i modelli interattivi corrispondenti restano visibili.

- Team Builder e Partecipanti: le card degli agenti condividono identità,
  descrizione e pannello espandibile. Nel Team Builder gli ID tecnici degli
  agenti sono sostituiti da descrizioni, gli avatar sono quelli configurati e
  il Pensiero mostra gli effort nativi attestati dal modello. L'applicazione
  di un team a una chat esistente usa la transazione atomica del backend.
  Verificati 45 test renderer e 10 percorsi Electron su macOS con profili
  sintetici; provider live e altri sistemi operativi non verificati.

- Commander: l'indice prompt degli agenti con `routing_tags` usa i tag brevi
  invece di descrizione e profilo estesi. Gli agenti legacy senza tag
  conservano le informazioni precedenti; il workflow completo resta
  recuperabile su richiesta.

- Commander: per richieste utente composte, il runtime aggiunge una nota breve
  con specialisti già nella chat, dipendenze e prove richieste. Riusa il roster
  caricato per il prompt e non consulta lo Store né avvia agenti in automatico.
  I turni di ripresa dopo una delega non ricevono un nuovo preflight.

- Commander: `agent_match` propone una collaborazione compatta per competenze
  complementari, con dipendenze e controlli minimi di verifica. I requisiti
  di interazione nell'app non sono attestati da soli test statici o da preview
  simulate. Il piano è consultivo: non avvia agenti e non abilita istanze
  duplicate per modifiche al progetto. La prova nell'app resta da eseguire.

- Sviluppo: uno script collega `desktop/node_modules` del worktree a quello di
  `main` solo con lockfile identico e installazione verificata, evitando copie
  da gigabyte senza cambiare package manager o dipendenze dell'app.

- CI: la validazione Core non parte più automaticamente sulle pull request;
  resta disponibile manualmente e come prerequisito delle build. Le verifiche
  delle feature si eseguono in locale prima dell'integrazione.

- Chat: la gestione dei partecipanti della singola conversazione è nel pannello
  laterale «Partecipanti», aperto dal trigger nell'header. Il pannello elenca i
  partecipanti con lo stile compatto del roster, permette ricerca e invito tra
  gli agenti disponibili per la chat, scelta del modello e configurazione del
  thinking quando il runtime li supporta. Il controllo Thinking espone Auto
  e gli effort nativi attestati per l'esatto provider/modello: Auto non invia
  override; capacità sconosciute, non regolabili o non supportate restano
  esplicitate senza deduzioni sugli step del provider. Il
  pannello permette anche la rimozione accessibile del solo membro dalla chat.
  Rimuovere un partecipante non modifica il catalogo
  globale. Il pannello raccoglie anche le due policy «Commander può invitare
  altri membri» e «Consenti lavori in parallelo». Le policy restano modificabili
  solo dal proprietario; il gate backend del Commander resta vincolato alla prima
  policy. Catalogo e impostazioni globali degli agenti restano separati dalla
  gestione della singola chat. Il pulsante «Agenti» resta nella navigazione
  sinistra per il catalogo e la gestione globale, ripristinato dopo una
  regressione di navigazione. Prova GUI manuale e qualifica multipiattaforma da
  eseguire.

- Commander confronta gli agenti della chat, quelli installati e gli specialisti
  dello Store tramite tag sintetici firmati, con punteggi separati per idoneità
  e disponibilità. Per PR/merge/pull può lavorare direttamente; per richieste
  miste distingue implementazione e integrazione. Un agente Store richiede
  sempre la scelta dell’utente prima dell’installazione. L’indice è separato
  dal catalogo per conservare la compatibilità con Talia 0.11.0. Verifica
  automatica completata; prova nell’app e nuova build ancora da eseguire.

- Spostate nello Store le 29 schede Atlassian, Google, Microsoft e sviluppo
  selezionate. Il core mostra solo Figma e i quattro ID CLI incorporati; le
  schede installate dallo Store appaiono in Connettori come non disponibili
  finché non esiste autenticazione diretta. Nessun token, transport o codice
  eseguibile viene distribuito da queste schede. Il catalogo Store sale a 95
  pacchetti. Le definizioni storiche nel sorgente core non sono ancora state
  eliminate; il runtime Talia non le indicizza.

- Ridotto il catalogo Talia a 34 voci selezionate: servizi Google e Microsoft
  in tutte le categorie, Atlassian, Bitbucket, GitLab, GitHub, Hugging Face,
  Figma e i quattro ID CLI. Le 29 voci con autenticazione originale non ancora
  sostituita sono visibili ma disabilitate. I 16 preset MCP *Craft restano
  configurabili separatamente. Esclusi dal pacchetto Electron 34 contratti
  ecommerce non usati da Talia (54.109.132 byte di sorgenti); i sorgenti
  storici restano nel repository per una rimozione successiva. Nessuna build.

- Preparata su branch la versione sorgente 0.11.0 per lo Store unificato:
  agenti, skill, connettori, app e Manuale Talia 1.2.0 in Biblioteca. Primo
  avvio con tre agenti e sei skill; i preset MCP *Craft restano opzionali.
  Installazione CLI esplicita con SHA-256 per l'asset ufficiale FigCraft macOS;
  sugli altri target e sugli altri *Craft resta la procedura manuale. Nessun
  download automatico del CLI né stato connesso prima dell'handshake. Catalogo
  Store firmato e test mirati superati; runtime GUI e piattaforme non ancora
  qualificati. Nessuna build o pubblicazione.
- Team: rimosso dall'header della chat il pulsante «Team della chat». Un team
  può essere scelto solo prima della creazione di una nuova chat libera o di
  progetto: al primo invio aggiunge i suoi membri non già presenti. I membri
  restano normali partecipanti della chat e possono essere rimossi senza
  reinserimento automatico; l'aggiornamento o il distacco retroattivo del team
  da una chat esistente non è più disponibile dalla UI. Nessuna build.

- Inner Browser: connettore nativo permanente disponibile nei profili nuovi ed
  esistenti, selezionabile dalla scheda «Usa» e dai compositori chat. La scelta
  abilita il vero `inner_browser` condiviso con l'utente, non un server MCP:
  stato `native_available`, nessun trasporto o credenziale inventati.
  Rimozione/disabilitazione negate da UI e backend; gli altri connettori
  mantengono le proprie regole. Nessuna build o incremento versione.
  Contratto, QA locale e limiti: desktop/docs/inner-browser-connector.md.
  Recheck OAuth: isolato il mock API-key per evitare la gara fra due factory
  Vitest dello stesso modulo; nessuna modifica al runtime OAuth.

- Riconciliati i branch pendenti di pianificazione/form, modelli squadra,
  launcher isolati e recovery ACP preparatoria. Conservati Team Builder r9
  e materiali già in main. Versione sorgente invariata 0.10.0; nessuna build.
  Inventario, verifiche e residui esclusi: docs/integration-branches-2026-11-15.md.

- Materiali Talia: nucleo backend locale `.talia/` con classificazione esplicita,
  anteprima vincolata al target, protezione sconosciuti/riferimenti/chat attive e
  pulizia recuperabile con journal. Archivio conversazioni e documenti canonici
  non spostati. Pannello accessibile nel menu workspace di progetto, anteprima
  e conferme distinte, recupero locale, 19 cataloghi, nuovi materiali dichiarati
  via write_file e manifest shell classificati; hook delete/restore effettivi.
  QA indipendente macOS arm64 superato: 411 test e 17 scenari Electron,
  inclusi percorsi desktop/mobile; 2 test Windows-only saltati.
  Windows/Linux e scalabilità ancora da qualificare. Nessuna build.
  Contratti e limiti: desktop/docs/project-materials-api.md e project-materials-ui.md.
  Riparazione PM-QA-001: storage materiali non disponibile o `.talia` preesistente
  non classificata non impediscono bash ordinario; manifest tecnico effimero
  classificato o sola scansione workspace, senza adottare dati ignoti. Pulizie e
  scritture materiali esplicite restano fail-closed. Recheck indipendente superato;
  copertura e limiti in desktop/docs/project-materials-qa.md.

- Team Builder: il pannello per attore è ora fedele al mockup r9 approvato:
  modello value-first con valore corrente e chevron (stessa modale standard del
  catalogo), nessun select Pensiero duplicato, hero Pensiero centrato con reset
  e slider a quattro stop, una sola riga di stato, nessun pulsante di
  conferma/staging: ogni scelta valida si applica subito alla bozza e «Salva
  team» è l'unico commit. Il salvataggio blocca elencando attore e problema,
  aprendo le card coinvolte; riepiloghi sempre localizzati; card con avatar,
  badge runtime e rimozione circolare; layout responsive 320/390 px e zoom
  200%. Etichette in 19 lingue. Dettagli e limiti:
  desktop/docs/team-builder-model-thinking-ui.md.
- Team Builder: nel pannello per-agente la scelta del Pensiero usa il controllo
  value-first a quattro stop (Auto · Rapido · Bilanciato · Profondo) dell'anteprima
  approvata: valore corrente in evidenza con ripristino esplicito, stop mappati
  soltanto sui livelli attestati dalla capability del modello esatto, stop non
  disponibili visibili ma non selezionabili e saltati da tastiera, valore
  confermato divenuto non applicabile mostrato in avviso con salvataggio
  bloccato e nessuna correzione automatica. La scelta del modello continua ad
  aprire la modale standard del catalogo già usata nell'app (ricerca, filtri,
  account, stati selezionabili/non selezionabili). I default del team restano
  usati nelle nuove chat e restano modificabili per chat. Etichette in 19 lingue.
  Dettagli e limiti: desktop/docs/team-builder-model-thinking-ui.md.

- Team Builder: pannello compatto per attore. Ogni agente in «Agenti» mostra il
  riepilogo «Modello: … · Pensiero: …» e il pulsante «Configura», che apre il
  pannello unico modello + Pensiero dello stesso attore: il modello usa la
  modale standard del catalogo e il Pensiero il controllo a quattro stop, senza
  nuovi dialoghi. La sezione separata «Modelli e thinking» non esiste più; la
  scheda di Commander vive in «Coordinamento», accanto al prompt. L'espansione
  dei pannelli resta attiva tra i salvataggi e le card con scelte non confermate
  restano evidenziate. Tastiera (pulsanti nativi con aria-expanded/aria-controls),
  responsive e 19 lingue. Nessun cambiamento backend o dei default per chat.
  Dettagli: desktop/docs/team-builder-model-thinking-ui.md.

- Antigravity: recuperato il modulo sperimentale di diniego selettivo ACP,
  con correlazione e budget per prompt, senza replay o comandi nativi.
  Il gate resta hardcoded chiuso: nessun recupero nuovo attivo per l’utente
  finché non è qualificato il runtime reale. Nessuna build o bump.
  Contratti e limiti: desktop/docs/antigravity-native-recovery-notes.md.
- Workflow: documentate regole worktree/PR, note canoniche e promozione
  esplicita su build con SemVer crescente; nessuna nuova funzione utente.
  Il riesame del workspace rev4 conferma che i residui locali sono superati
  dai sorgenti già integrati, che vengono conservati senza regressioni.

- Flusso locale main/beta/build: due avvii sorgente isolati `talia-main` e
  `talia-beta`, copia iniziale opzionale e opaca della configurazione provider,
  anteprima terminale dei commit inclusi. Packaging solo con dispatch esplicito
  su build; validazione PR verso main/beta/build. Schermata novità beta e
  protezioni remote ancora da completare. Nessuna nuova distribuzione.
  Setup, verifiche e rollback: docs/contributing/beta-build-workflow.md.

- Team: nella creazione/modifica il modello per membro si configura nella
  sezione 3 «Modelli e thinking», subito dopo «Agenti» e visibile senza
  lunghi scroll (prima la sezione compariva senza numero dopo «Connettori»,
  oltre il bordo della finestra tipica); ogni riga agente mostra il modello
  configurato o «Eredita / predefinito». Nessuna modifica backend, IPC o
  storage; dettagli: desktop/docs/team-default-modelli-ui.md.

- Team: il default modello per membro configurato nel Team Builder («Modelli
  e thinking») è ora visibile nel pannello «Squadra di questa chat» della
  bozza nuova e di progetto, con nome team, revisione del template e modello
  di partenza di Commander e di ogni membro; la presenza manuale di un agente
  senza override continua a preservare la chat (il template non si applica in
  silenzio) e il pannello lo dichiara. Il modello predefinito della chat
  mostra il template del Commander quando non c'è scelta esplicita. Per gli
  agenti runtime ACP (Antigravity/Hermes) il Team Builder dichiara che la
  scelta modello resta dentro la chat con sessione attiva: nessun default
  simulato a livello team. Team eliminato con bozza allegata: avviso esplicito.
  Nessuna modifica backend, IPC o storage; nessun provider live.
  Dettagli, prove e limiti: desktop/docs/team-default-modelli-ui.md.

- Deleghe agenti: il cooldown conserva la causa account (credito/billing,
  rate limit temporaneo, autenticazione, permessi), invece di convertirla in
  selezione modello indisponibile. Il coordinatore riceve una causa sanitizzata
  e l’indicazione di non cambiare agente sullo stesso credito esaurito;
  alternative indipendenti già autorizzate preservate. Causa ignota esplicita.
  Verifica sintetica e limiti: desktop/docs/provider-error-propagation.md.
  Nessuna verifica del saldo reale, nuova build o modifica dei provider.

- Impostazioni: la pagina «Modelli» ora si chiama «Providers». Collegamento
  API/OAuth ed endpoint personalizzati senza obbligo di modello;
  il modello si sceglie nel catalogo della chat, anche tramite ID manuale per
  endpoint personalizzati e OpenRouter. Per custom senza catalogo (Ollama,
  LM Studio e simili), nome/ID modello facoltativo anche nel form provider,
  persistente e selezionabile in chat senza perdere le altre voci salvate.
  Profili senza modello persistenti e
  configurazioni precedenti preservate. Nessuna nuova build.
  Dettagli e limiti: desktop/docs/provider-settings.md.

- Tasks: la sezione italiana si chiama Tasks; terminologia, categorie e aiuto
  aggiornati nei 19 cataloghi. Categorie facoltative condivise per account,
  gestione di nome/colore, archiviazione e ripristino non distruttivi.
  Bacheca ed Elenco riusano gli stessi task, con ricerca e filtri categoria/agente
  combinati, conteggi, reset e preferenze per account; + apre l'editor nello
  stato della colonna. Invariati stati, conferme, Human, allegati, chat e driver.
  Le traduzioni non sono certificate da madrelingua. Nessuna build o
  sincronizzazione cloud aggiunta. Prove e limiti: desktop/docs/tasks-categories-ui.md.
- Workspace a schede: le istanze divise conservano tutte le informazioni e i
  controlli dell'header. Le bozze «Nuova attività» hanno una barra con modello,
  destinatario, squadra, agenti/modelli, avanzate, costi e guida; l'header
  delle chat va a capo nei pannelli stretti senza troncare titolo, progetto,
  membri, costi o azioni; il pannello dettagli resta affiancato e non copre
  più il toggle. Rinomina ed eliminazione aggiornano subito le linguette e il
  link progetto apre la pagina nella finestra principale. Attivazione invariata
  solo da Impostazioni → Generali → «Workspace a schede (sperimentale)».
  Dettagli in desktop/docs/adaptive-workspace.md.
- Kanban: trascinamento tra colonne, ordine verticale persistente, alternativa
  da tastiera, responsabile Human e filtro Tutti/Human/Agenti. Play visibile
  sostituisce il comando nel menu; matita per Modifica/Elimina. Human non è
  avviabile e il server impedisce le modifiche degli agenti ai suoi task.
  Due nuovi percorsi Electron globali/progetto verificati anche a viewport stretto.
  Corretto anche l'avvio dei task assegnati: entra nella chat soltanto l'agente
  responsabile, senza iscrivere gli altri agenti del progetto o del catalogo.
  Tutti i 18 percorsi Electron board/Human superati dopo riproduzione del difetto.
  Dettagli in desktop/docs/kanban-human-ui.md; nessuna nuova build.
- Parità agente/team (backend): un team globale può essere assegnatario di un
  task di progetto o Todos (`owner_team`/`owner_team_id`/`owner_team_revision`
  con CAS esplicito sulla revisione), di una riga della task board/Kanban di
  conversazione (riferimento tipizzato `assignee_team`, esecuzione resta di
  Commander coordinatore) e destinatario di un'attività pianificata
  (`TaskRecipient` kind `team` con apply esplicito alla conversazione creata).
  Le menzioni `@team` nei messaggi utente instradano a Commander con
  applicazione esplicita del team alla chat (membri, modello/thinking e
  risorse con i contratti esistenti); nessun nuovo attore, nessun broadcast
  implicito, inviti/permessi/approvazioni invariati. Team eliminato o risorse
  mancanti → errore esplicito (`owner_team_invalid`, `GROUP_NOT_FOUND`,
  `CHAT_BUSY`, `GROUP_ALREADY_BOUND`), nessun degrado silenzioso. Contratto
  per il frontend in `desktop/docs/team-parita-backend.md`. La delega di
  Commander supporta anche il team come bersaglio: `dispatch_to` con
  `team:<id>` (o nome univoco) applica il team alla chat e nomina Commander
  coordinatore (ricevuta, mai risposta di un worker fittizio, mai broadcast);
  `hand_off_to` verso un team è rifiutato con errore tipizzato
  (`TEAM_TARGET_UNSUPPORTED`, nessun attore esecutore); nel composer
  `@team:<id>` indirizza il team esplicitamente anche in omonimia con un
  agente.

- Parità agente/team (frontend): ovunque si sceglie un assegnatario o un
  destinatario è ora selezionabile anche un team, con la semantica conservativa
  del backend (team template, Commander coordinatore, nessun broadcast). Todos
  e task di progetto: menu assegnatario con sezione team, chip dedicata,
  selettore `team:<id>` nell'editor con CAS sulla revisione del catalogo e
  messaggi dedicati per `owner_team_invalid`/`owner_team_stale`/`owner_not_bound`.
  Kanban/task board: righe team raggruppate a sé con nome persistito e badge,
  avviso «Team non trovato» solo con catalogo letto, pulsante «Riassegna» sulle
  righe in coda (Commander, agenti membri, team) con mappa esplicita degli
  errori di apply e resync. Attività pianificate: destinatario team
  (`TaskRecipient` kind `team`) con chip dedicata ed errore dedicato se il team
  non esiste più. Composer: tab «Team» nel picker (quattro anchor) che inserisce
  sempre il riferimento tipizzato `@team:<id>` (contratto §8.4: non ambiguo con
  agenti omonimi o nomi team duplicati, stabile a rinomine), mostrato come chip
  leggibile col nome del team nel composer; il bus instrada a Commander, applica
  il team e coordina — nessun worker avviato né broadcast, e l'hand-off
  terminale a un team non è supportato (`TEAM_TARGET_UNSUPPORTED`). UI IT/EN e
  test renderer dedicati (board, Todos, picker, automazioni, chip menzione).
  Dettagli e limiti in `desktop/docs/team-parita-frontend.md`;
  QA E2E indipendente superata il 14 novembre 2026; integrazione in `main`
  tramite pull request autorizzata dall'utente.

- Team Builder: area ragionamento Commander sempre riconoscibile, anche con
  ereditarietà/automatico. Slider discreto sui livelli canonici (3 o più quando
  supportati), valore ereditato del modello esplicito risolto in sola lettura;
  nessun cursore fittizio per default ignoto. Personalizzazione confermata nella
  bozza, Default/Spento separati dai livelli; limite a due livelli dichiarato.
  Budget token e runtime non ordinali conservano i controlli nativi. Prove locali
  Electron IT/EN desktop/mobile, nessuna attestazione provider live.

- Team Builder: i testi modello/thinking sono presenti in tutte le 19 tabelle
  locali. L'italiano resta l'unica traduzione completa; le altre lingue ricevono
  gli stessi testi inglesi come fallback esplicito, secondo la convenzione del
  repository, con placeholder preservati e inserimento al medesimo punto
  ordinale di `en.json`. Il confronto automatico delle chiavi con `main` mostra
  solo i gap preesistenti, estranei alla feature. Nessuna traduzione certificata
  nelle altre lingue; prove e hash nel diario di completamento i18n.

- Team Builder, backend: preferenze modello e thinking per membro, incluso
  Commander, persistite nei template e negli snapshot. Bozze esplicite e
  impostazioni dei membri esistenti hanno precedenza; commit inferenza/roster
  recuperabile, catalogo e capability canonici senza nuovi permessi o login.
  Controlli frontend dinamici per attore disponibili nel pannello Team, con
  conferma nella bozza distinta dal salvataggio del team, ereditarietà esplicita,
  anteprima effetti e preservazione delle impostazioni già presenti. Il
  compositore non promuove il fallback a override in una bozza team senza
  modello esplicito. Prove locali Electron; QA indipendente del delta superata
  localmente, nessuna certificazione provider live o regressione globale verde.

- Team Builder: recovery dei nuovi journal isolato per chat. Un journal
  corrotto non blocca le chat sane; la chat coinvolta resta protetta da
  `RECOVERY_REQUIRED`, senza scartare dati incerti. Compatibilità conservativa
  con i journal precedenti; se il vecchio file non contiene più un'identità
  ricostruibile il blocco resta esteso al profilo. Recheck QA indipendente aperto.

- Team Builder nel pannello Agenti: crea squadre globali al profilo con agenti,
  skill e istanze connettore e, se serve, istruzioni solo per Commander. Salva
  il modello senza modificare chat, poi controlla l'anteprima prima di usarlo
  in una chat esistente o nella bozza libera/di progetto. Gli aggiornamenti
  sono espliciti; scollegare conserva membri e cronologia. Selezionare risorse
  non concede permessi e non connette servizi. UI IT/EN, temi e layout stretto.
  Verifiche dedicate Electron con fixture sintetiche; QA indipendente
  superata il 14 novembre 2026; regressioni complete ancora aperte, nessuna
  compatibilità CLI con risorse o servizio live certificata. I dati v1 sono leggibili; il downgrade a vecchi
  writer non è supportato. Nessuna build o modifica di versione in questa tranche.

- Nella sidebar, le chat con un lavoro completato ma non ancora visualizzato
  mostrano una spunta cerchiata accanto al titolo, con etichetta accessibile.
  Il segnale persiste al riavvio e si rimuove quando la cronologia viene
  effettivamente caricata fino all'ultima pagina e la fine del risultato è
  visibile con finestra attiva, non aprendo un messaggio storico né se il
  caricamento fallisce. Dopo un errore si può ritentare cliccando la stessa
  chat, senza duplicare richieste pendenti. Gli altri esiti conservano il
  puntino di attenzione esistente. Nessuna nuova build prodotta.

## 0.11.0 — Store unificato e team di agenti

- Il sorgente Electron usa lo Store Talia firmato per agenti, skill, connettori,
  app e Biblioteca. Il Manuale Talia è disponibile offline e installabile.
- I team dello Store installano agenti e dipendenze dichiarate; team e agenti
  restano personalizzabili. Commander può proporre uno specialista con scelta
  esplicita di installazione nella chat.
- Il confronto degli agenti usa tag firmati separati dal catalogo e distingue
  idoneità da disponibilità. PR, merge e pull possono restare a Commander;
  richieste miste possono dividere implementazione e integrazione.
- Questa sezione descrive il sorgente 0.11.0. Nessuna nuova build o verifica
  multipiattaforma è inclusa in questo aggiornamento.

## 0.10.0 — workspace a schede nelle Impostazioni

- In Impostazioni → Generali è disponibile «Workspace a schede (sperimentale)».
  La scelta è persistente sul dispositivo/profilo di installazione e ha effetto
  solo al prossimo avvio manuale. Nessun riavvio automatico o ricreazione delle
  viste/chat nella sessione corrente.
- `TALIA_ADAPTIVE_WORKSPACE=1` continua a forzare l'attivazione e prevale sulla
  preferenza; la UI spiega come rimuovere questa forzatura. Default disattivato.
- Verificati sorgenti Electron macOS arm64, persistenza, entrambi i versi del
  cambio al riavvio e controllo UI desktop/390 px. Packaging e collaudo del
  pacchetto restano da eseguire: le app già installate non acquisiscono questo
  controllo prima di una distribuzione successiva.
  Dettagli e limiti: `desktop/docs/workspace-settings.md`.
- Rimossa la card fissa «Manuale Talia» sopra la Biblioteca. Il documento resta
  nell'albero dei file con indicizzazione invariata; apertura e ripristino
  esplicito restano disponibili nello Store.

- «Piano guidato» riusa il contesto, raccoglie solo i dati mancanti nei form
  e distingue raccolta informazioni, revisione, rinvio e approvazione del piano.
- Form chat con schede radio per domini brevi, selezione multipla, testo libero,
  focus ed errori accessibili, stato di invio e layout responsive nei tre temi.
- Select lunghi: ID interni preservati e nomi accessibili della domanda
  associati al controllo e alla lista, anche durante apertura e selezione.
- Risorsa opzionale `guided-plan` 0.2.0 nei sorgenti ready/builtin e nel worktree
  risorse. Nessun aggiornamento di skill installate o pubblicazione Store.

## 0.9.4 — novità e miglioramenti

- Le chat di progetto possono scegliere direttamente gli agenti globali installati
  e abilitati, con ricerca e checkbox. Solo gli agenti selezionati diventano membri:
  non occorre associarli prima al progetto. Allineati menu @ e responsabile attività.
- Lo Store verifica gli aggiornamenti all'apertura mantenendo il controllo manuale.
- Gli agenti globali sono disponibili anche come responsabili di attività e
  automazioni di progetto, senza associazioni preventive.
- Il manuale Talia è consultabile dalla nuova chat e dalla Biblioteca, con
  ripristino esplicito dallo Store e stato dell'indicizzazione visibile.
  «Scopri Talia» prepara una bozza senza inviarla. Manuale e skill guida sono
  indipendenti e rimovibili; la guida ora si chiama Talia, senza duplicati legacy.
- Aggiunta la skill opzionale «Piano guidato» alle risorse di prima installazione:
  raccoglie le informazioni e richiede conferma del piano prima di agire.
- Nelle Avanzate della chat, «Consenti lavori in parallelo» controlla nuove
  ammissioni senza fermare lavori già ammessi. Conservate approvazioni e gestione
  degli esiti incerti; istanze dello stesso agente e runtime CLI non qualificati
  restano soggetti ai rispettivi gate, non abilitati indiscriminatamente.
- I provider con chiave API possono essere collegati prima di scegliere il modello:
  la scelta esplicita avviene nel catalogo della chat, con aggiornamento automatico
  della cache assente o scaduta. Nessun modello viene scelto implicitamente.
- Su macOS è disponibile il download del DMG compatibile con verifica dimensione,
  SHA-256 e immagine. La sostituzione dell'app resta manuale e Gatekeeper attivo.
- Antigravity permette di ripetere l'accesso dagli account configurati senza perdere
  i modelli; conserva più a lungo i processi inattivi e le continuazioni compatibili,
  con timeout basati sull'attività. Account e conversazioni restano isolati.
- Le novità della versione installata si aprono automaticamente una sola volta
  per versione, con memoria locale conservata tra i riavvii.
- Una piccola icona accanto alla versione permette di riaprire le novità.
  Il pulsante della versione continua ad aprire il controllo aggiornamenti.
  Le note mancanti sono segnalate, senza mostrare quelle di altri rilasci.
- Il pacchetto locale macOS Apple Silicon include il runtime ChromaDB verificato,
  per chi usa quel backend in Biblioteca. SQLite resta predefinito; nessun
  cambio backend o migrazione automatica.
- Corrette traduzioni mancanti delle nuove superfici e raccordi di caricamento
  del renderer, inclusa l'apertura del manuale senza errori di inizializzazione.

Limiti: qualifica live dei provider e nuove build Windows/Linux/macOS Intel non
attestate da questo consolidamento. Il download pubblico del manuale dipende
dalla pubblicazione dello Store. I controlli locali non equivalgono a tali verifiche.

## 0.9.3

- Antigravity riusa le sessioni compatibili per conversazione e modello e invia
  soltanto i nuovi messaggi, anche nei cicli con strumenti. Modifiche della
  cronologia richiedono ricostruzione; le richieste concorrenti restano isolate.
- Gli orari dei messaggi seguono il fuso del dispositivo anziché quello di Shanghai.
- Nel browser integrato puoi selezionare elementi o aree e aggiungere commenti
  alla bozza della chat. L'IA può evidenziare temporaneamente un elemento
  osservato senza cliccarlo o inserire testo.
- I progetti supportano più cartelle disponibili, conservate alla riapertura.
  Le nuove chat rispettano la cartella principale scelta; le richieste di
  permesso spiegano perché serve l'accesso e perché le cartelle disponibili non bastano.
- Store e runtime nativi condividono le impostazioni di rete configurate,
  inclusi proxy/PAC e certificati, evitando percorsi di rete separati.

Distribuzione verificata all'epoca: macOS Apple Silicon. Latenza e autenticazione
Google in ambiente aziendale restavano da verificare; le build remote delle
altre piattaforme erano bloccate prima dell'esecuzione.

## 0.8.3

- Collegamento Antigravity Personale / Gemini Enterprise (anteprima), con progetto
  e regione conservati per discovery modelli e chat.
- Gli errori generici ACP dopo callback non sono più classificati automaticamente
  come login mancante; messaggi sicuri senza dettagli sensibili upstream.
- Build locale macOS Apple Silicon. La callback Enterprise sul computer remoto,
  gli account e l’inferenza Google reali restano da verificare.

## 0.8.2

- Google Antigravity è un provider dedicato nelle Impostazioni, con installazione
  verificata del runtime ACP ufficiale, accesso Google e scelta esplicita dei
  modelli restituiti per account. Non è più nascosto sotto Google Gemini.
- Aggiornamento modelli, cambio modello e scollegamento; errori di runtime,
  account, piano e quota distinti. Nessun modello o successo di login inventato.
- Adattatore chat ACP con isolamento account e negazione degli strumenti nativi:
  gli strumenti applicativi mantengono i gate del core Talia.
- Distribuzione locale macOS Apple Silicon, firma ad-hoc, download manuale.
  Account Google, inferenza e strumenti live non ancora qualificati; nessuna
  dichiarazione di parità con Codex/Anthropic. Release e feed precedenti conservati.

## 0.3.0

- Selettore chat in modale con ricerca, provider/account, tariffe API, capacità,
  contesto e distinzione fra input del modello e supporto effettivo dell’app.
- Catalogo OpenRouter aggiornabile con tutte le modalità di output, ricerca
  sull’intero elenco e modelli non adatti alla chat visibili ma non selezionabili.

- Ogni chat conserva provider e versione del modello indipendenti; nuove chat
  e chat di progetto ricevono la scelta della propria bozza.
- Corretto un falso conflitto che impediva il ritorno a Codex con profili legacy
  privi di timestamp opzionali; credenziali e default globali preservati.
- I collegamenti in abbonamento non mostrano importi per richiesta né tariffe API
  nel catalogo. Gli eventuali costi OpenRouter precedenti restano separati.
- Modelli non più disponibili richiedono una scelta esplicita, senza fallback
  silenzioso verso un altro provider. La scelta resta persistita dopo riavvio.


## 0.2.0

- Aggiunto il pulsante Costo nella conversazione con crediti OpenRouter
  effettivamente riportati, dettaglio per modello e registro persistente.
- Distinti costi noti, zero, importi assenti e totali parziali. Le tariffe del
  catalogo non vengono presentate come spesa effettiva.
- Nessuna ricostruzione automatica delle spese precedenti: il riepilogo copre
  solo le richieste registrate. Nessuna conversione valutaria implicita.


## 0.1.1

- Spostati i pulsanti ? delle sette sezioni all’estrema destra della barra,
  come ultima azione dopo gli altri controlli. Contenuti e modali invariati.


## 0.1.0

- Aggiunte guide contestuali tramite pulsante ? accanto ai titoli di
  Connettori, Abilità, Team IA, Auto, Da fare, App e Biblioteca.
- Contenuti specifici in italiano e inglese, esempi dei file di una skill e
  istruzioni per coinvolgere più agenti tramite menzioni @ nella stessa chat.
- Riutilizzata la modale accessibile: chiusura con pulsante/Esc e ripristino
  del focus; apertura singola e nessuna chiamata a modelli o servizi.
- Layout verificato a 900×700; corretto restringimento del titolo Team IA
  che rendeva il pulsante guida coperto dal sottotitolo.


## 0.0.3

- I file credenziali illeggibili, malformati o con schema non supportato non
  vengono trattati come profili vuoti: errore esplicito e avviso in impostazioni,
  modifiche rifiutate e contenuti preservati. Conservati metadati legacy validi.
- Corretta l’autenticazione dei servizi immagini locali senza token: non viene
  più inviato un header costruito dalla stringa `undefined`.
- Verificato il percorso Image Studio con provider HTTP locale, file effettivo,
  pixel/anteprima, esportazione e persistenza dopo riavvio.
- Documentazione progressiva dell’architettura Electron per la futura
  migrazione Tauri/Rust. Nessuna dichiarazione di migrazione completata.


## 0.0.2

- Recupero installazioni estensioni: dialogo nativo di retry/diagnosi/uscita,
  senza aggirare validazione o cancellare le evidenze.
- Verificati in Electron il workflow Video Studio con approvazioni dalla chat,
  esportazione reale e ripresa del rendering dopo arresto forzato.
- Corretti redirect e lifecycle delle risposte di rete in Electron, inclusi
  upload, multipart, streaming e annullamento; credenziali rimosse nei passaggi
  tra origini. Verifica nativa e regressioni: 108 test passati.
- Snapshot sorgente indipendente e versione identica tra runtime, ambiente
  e interfaccia; pubblicazione del puntatore subordinata alla prova della copia.


## 0.0.1 — prima release di prova

Prima release di prova del clone desktop. È un checkpoint utilizzabile per la
valutazione e il feedback; non certifica stabilità né parità funzionale completa
con Orkas. Consultare [la nota della release](docs/release-0.0.1.md) per ambito
e limiti.

Politica: patch per correzioni compatibili, minor per nuove funzioni e cambiamenti
incompatibili documentati prima della 1.0; major per incompatibilità dopo la 1.0.

- Identità applicativa indipendente 0.0.1 e controllo dei manifest sincronizzati.
- Avvio sviluppo/release con profilo e credenziali condivisi.
- Compatibilità mantenuta per agenti e skill bundled verificati.
- Cataloghi estensioni, prompt personali, discovery modelli e stime costi:
  stato e limiti nei documenti di verifica, senza dichiarare parità completa.

## 0.4.0

- Modelli e provider distinti per agente nella stessa chat, con persistenza e ripristino ereditarietà.
- Pannello Agenti e modelli con aggiunta partecipanti, catalogo ricercabile e runtime CLI in sola lettura.
- Modello effettivo sulle nuove risposte e costi API attribuiti per agente, mantenendo il totale e i record legacy.
- Scelta fissata per turno e ripresa dopo riavvio; configurazioni non disponibili falliscono senza fallback.
- Verifica Electron con trasporti locali e profili di test isolati.

## 0.4.1

- Guida Chat dal punto interrogativo all’estrema destra della barra: aggiunta agenti, assegnazioni modello per chat, CLI, risposte e costi.
- Verificati apertura, chiusura, focus e scorrimento della guida in italiano e inglese a 900×700.

## 0.4.2

- Agenti e modelli nella sidebar e nel menu A: della nuova chat, prima del primo messaggio.
- Preparazione senza richieste ai modelli, conservando bozza, destinatari, risorse e allegati.
- Protezioni contro doppio clic, invio concorrente, navigazione e cambio account.
- Pannello centrato e contenuto nella finestra con comandi di aggiunta sempre accessibili.

## 0.4.3

- Pulsante Agenti e modelli direttamente nel compositore della nuova chat, senza dipendere da pannelli laterali.
- Guida aggiornata; verificati configurazione prima dell’invio, bozza/allegati, riavvio e primo modello dal nuovo ingresso.

## 0.5.0

- Chat avanzata configura agenti e modelli in una bozza locale persistente senza creare conversazioni o inviare richieste. Salva e Annulla separati.
- Elenco ricercabile con selezione multipla; destinatari A: indipendenti dalla configurazione.
- Scheda Agenti nella sidebar destra per modificare default, assegnazioni e partecipanti; rimosso il collegamento sinistro.
- Primo invio crea una sola chat con configurazione validata; bozza consumata solo all’accettazione. Recupero esplicito per invii incerti e allegati parzialmente trasferiti.
- Guida aggiornata, catalogo condiviso e controlli di accessibilità/layout.

## 0.5.1

- Chat avanzata e riepilogo spostati fuori dal riquadro del messaggio; riepilogo nascosto quando la configurazione è vuota.
- Sedici preset MCP delle Craft Apps ufficiali, incluso FigCraft, configurabili personalmente nella sezione Connettori.
- Salvataggio del preset disconnesso: installazione CLI e percorsi restano scelte dell’utente; primo avvio soltanto con Connetti.
- Gruppi riutilizzabili in Team IA e salvataggio dei partecipanti come gruppo registrati nel backlog, con ereditarietà del modello della chat come comportamento futuro predefinito.

## 0.6.0

- Totale dei costi API registrati sempre visibile nella chat, anche cambiando il modello predefinito verso un abbonamento.
- Resoconto con subtotali per agente e provider/modello, richieste, token disponibili e cronologia espandibile dei periodi di utilizzo.
- I passaggi A → B → A conservano periodi distinti e costi effettivi, con dettaglio del turno e delle richieste. Aggiornamenti durante il lavoro preservano le espansioni.
- Fatturazione e metadati acquisiti dal runtime della richiesta. Abbonamenti distinti dagli importi API mancanti e dati storici leggibili senza riscrittura.
