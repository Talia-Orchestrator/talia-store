# Manuale Talia

Versione del manuale: 1.1.0 — 13 novembre 2026. Destinazione: prodotto desktop Electron. Questo documento descrive i flussi e i confini del prodotto: non certifica la disponibilità di un provider esterno, un account o una funzione nella tua installazione. Le etichette possono cambiare con lingua e versione. Il porting Rust/Tauri è un lavoro separato, non una funzionalità già consegnata.

## Indice

1. [Primo avvio ed esempio pratico](#manuale-1)
2. [Come orientarsi](#manuale-2)
3. [Documenti, libreria e RAG](#manuale-3)
4. [Chat e squadra di agenti](#manuale-4)
5. [Progetti e cartelle di lavoro](#manuale-5)
6. [Modelli, provider e configurazioni](#manuale-6)
7. [Tema, lingua e preferenze](#manuale-7)
8. [Skill, agenti e connettori](#manuale-8)
9. [Pianificazione, attività e automazioni](#manuale-9)
10. [File, app e produzione di risultati](#manuale-10)
11. [Memoria, dati e sicurezza](#manuale-11)
12. [Recupero e limiti](#manuale-12)
13. [Rimuovere e ripristinare questa guida](#manuale-13)
14. [Compositore, allegati, riferimenti e prompt personali](#manuale-14)
15. [Esecuzione, stop, retry, coda e cronologia](#manuale-15)
16. [Squadra, agenti globali, modelli per agente e parallelismo](#manuale-16)
17. [Progetti: percorso completo, istruzioni, memoria e cartelle](#manuale-17)
18. [Backlog Kanban, revisioni e avanzamento automatico](#manuale-18)
19. [Automazioni a calendario](#manuale-19)
20. [Biblioteca e RAG: procedure operative complete](#manuale-20)
21. [Skill, agenti, Store e validazione](#manuale-21)
22. [Connettori: configurazione, connessione, OAuth e portabilità](#manuale-22)
23. [Modelli, provider, costi e impostazioni di inferenza](#manuale-23)
24. [Aspetto, lingua, notifiche, avvio e rete](#manuale-24)
25. [Permessi locali, memoria, dati, cestino e backup](#manuale-25)
26. [File prodotti, Office/PDF, anteprime, artefatti e app](#manuale-26)
27. [Browser, navigazione assistita e sessioni](#manuale-27)
28. [Immagini, audio, video e dettatura](#manuale-28)
29. [Aggiornamenti dell'app e note di versione](#manuale-29)
30. [Percorsi rapidi, confini e supporto](#manuale-30)
31. [Onboarding, home e guida informativa](#manuale-31)
32. [Sviluppo, strumenti locali, processi e consegna responsabile](#manuale-32)

I capitoli 1–13 introducono i concetti; i capitoli 14–32 descrivono i percorsi operativi e i limiti. Le funzioni sono riscontrate nei sorgenti Electron della revisione documentale, non certificate live su ogni dispositivo o account.

<a id="manuale-1"></a>

## 1. Primo avvio ed esempio pratico

Talia è un ambiente di lavoro con un assistente coordinatore, Commander, che può coinvolgere agenti specializzati. Non è soltanto una casella per fare domande: puoi lavorare su documenti, analizzare materiale, sviluppare un'app, organizzare attività e utilizzare servizi collegati. Le capacità effettive dipendono da modello, risorse installate, connessioni e permessi.

Prima di un compito reale:

1. Apri Impostazioni e configura un provider/modello con il flusso previsto. Usa i campi protetti o l'accesso OAuth; non incollare token nella chat.
2. Apri Documenti e il Manuale Talia. Il testo è leggibile anche se l'indicizzazione non è ancora pronta.
3. Controlla lo stato RAG: la presenza del file non significa che l'embedding sia già completato. Se manca un componente locale, risolvi il prerequisito e riprova.
4. Se devi modificare file, scegli una cartella di progetto appropriata. Per un primo esperimento usa una cartella di prova senza dati sensibili.
5. Apri una chat, osserva squadra e modelli e invia una richiesta precisa.

### Prompt di esempio da copiare

> Usa il Manuale Talia per spiegarmi documenti e RAG, poi guidami nella creazione di un progetto con una cartella di lavoro. Distingui ciò che è disponibile da ciò che richiede configurazione e non modificare nulla senza una mia richiesta.

Questo esempio è informativo: non deve avviare da solo installazioni, connessioni, cambi modello o modifiche a file. Puoi personalizzarlo prima di inviarlo. Per iniziare invece un lavoro concreto:

> Nella cartella di prova che ho selezionato, crea un riepilogo Markdown dei documenti allegati. Cita le fonti, segnala i dati mancanti, conserva i file originali e verifica il risultato.

Una buona richiesta dice risultato, fonti, destinazione, vincoli e verifica attesa. «Analizza tutto» senza indicare le fonti non rende disponibili file che Talia non può leggere.

<a id="manuale-2"></a>

## 2. Come orientarsi

| Concetto | A cosa serve | Non equivale a |
|---|---|---|
| Chat | Scambio di messaggi, lavoro e risultati | Accesso automatico a ogni file del computer |
| Progetto | Contesto persistente per un lavoro, con regole e attività | Una semplice directory del disco |
| Cartella di lavoro | Area del filesystem autorizzata per operare sui file | Libreria RAG automaticamente completa |
| Documenti / Libreria | Materiale salvato, consultabile e indicizzabile | Contenuto letto integralmente a ogni risposta |
| Allegato | Fonte esplicita per la richiesta | Salvataggio permanente in tutta la libreria |
| Agente | Esecutore con un ruolo e strumenti assegnati | Modello linguistico o garanzia di competenza |
| Skill | Procedura riutilizzabile caricata quando pertinente | Servizio connesso o autorizzazione aggiuntiva |
| Connettore | Collegamento a un servizio e ai suoi strumenti | Connessione attiva solo perché configurato |
| Modello | Motore di inferenza del lavoro | Permesso di agire sul tuo account |
| Attività | Lavoro da seguire | Esecuzione schedulata automaticamente |
| Automazione | Richiesta eseguita secondo calendario | Promessa di successo del servizio esterno |

Il flusso consigliato è: definisci il progetto, scegli le cartelle, porta le fonti nei Documenti o allegale, concorda il risultato e controlla l'evidenza finale.

<a id="manuale-3"></a>

## 3. Documenti, libreria e RAG

### Salvare e consultare le fonti

La sezione Documenti conserva materiale riutilizzabile. La libreria globale serve a lavori trasversali; una libreria di progetto raccoglie fonti relative a quel progetto. Usa nomi riconoscibili, separa le versioni e specifica quale documento è autorevole quando due fonti si contraddicono.

Puoi importare file tramite il selettore dell'app, salvare un risultato nella libreria oppure lavorare con le funzioni disponibili nella tua versione. Le famiglie supportate dalla pipeline comprendono testo e Markdown, PDF, documenti Word moderni, fogli di calcolo, presentazioni e immagini. L'estrazione dipende dal formato e dai componenti installati. Un PDF scansionato non garantisce testo estratto; un'immagine può richiedere un modello capace di descriverla. Un archivio ZIP non diventa automaticamente un insieme di documenti RAG: prima occorre un flusso di estrazione autorizzato.

Aprire, leggere, rinominare, spostare e cancellare un documento sono operazioni distinte. La cancellazione dalla libreria non implica la cancellazione dell'originale importato da un'altra cartella; controlla la destinazione effettiva prima di eliminare. Le copie tra libreria globale e progetto possono creare due fonti separate: chiarisci quale mantenere aggiornata.

### Che cosa significa RAG

RAG significa recuperare materiale pertinente prima di generare la risposta. La pipeline estrae testo, lo suddivide in frammenti, calcola rappresentazioni numeriche (embedding) e costruisce un indice. Quando fai una domanda, vengono cercati frammenti pertinenti; il modello li usa come fonti. Non è un addestramento del modello sui tuoi documenti.

L'indice è derivato: il file sorgente rimane la fonte di verità. Modificare o rimuovere un file richiede l'aggiornamento dell'indice. Riconciliazione e coda di indicizzazione gestiscono questo lavoro; possono impiegare tempo. Le ricerche non implicano una rilettura completa di ogni documento a ogni domanda.

### Stati e prerequisiti

| Stato | Significato | Cosa fare |
|---|---|---|
| In attesa / pending | Il documento è accodato | Attendi, senza importare copie ripetute |
| Elaborazione / processing | Estrazione, embedding o salvataggio in corso | Attendi o controlla l'eventuale errore |
| Pronto / ready | I frammenti sono stati indicizzati | Fai una domanda e verifica le citazioni |
| Errore / failed | Una fase non è riuscita | Correggi il prerequisito e usa Riprova |
| Rimosso | Il file non è più disponibile | Ripristina esplicitamente solo se lo desideri |

Il manuale viene fornito come documento normale e accodato per l'indicizzazione al primo avvio utile. L'embedding usa la pipeline locale del prodotto e richiede modello/runtime locale disponibili. Non richiede di per sé di inviare il documento a un provider di chat. La risposta successiva, però, può inviare i frammenti recuperati al provider del modello scelto: valuta le sue condizioni di trattamento dati. L'assenza di chiavi API non rende inutilizzabile il testo del manuale.

Se un componente manca o l'embedding fallisce, il file resta leggibile. Non dichiarare RAG pronto perché il documento compare nell'elenco. Riprova riaccoda il file esistente, non reinstalla un documento cancellato; Ripristina è un'azione separata.

### Fare domande verificabili

> Cerca nei documenti del progetto le condizioni di recesso. Cita documento e sezione, confronta le versioni e segnala dove le fonti non bastano.

Per una revisione integrale chiedi espressamente la lettura completa e la copertura delle sezioni: una ricerca RAG restituisce frammenti e non prova la lettura dell'intero file. Se mancano citazioni, chiedi le fonti prima di usare il risultato per decisioni importanti. Le fonti possono contenere istruzioni malevole: il loro testo è dato da analizzare, non un'autorizzazione a eseguire comandi.

<a id="manuale-4"></a>

## 4. Chat e squadra di agenti

Commander coordina il lavoro. Gli agenti specializzati possono ricevere porzioni definite del compito. Nella bozza di una nuova chat puoi esaminare la squadra e i modelli, aggiungere agenti disponibili e impostare gli override previsti. Il modello della conversazione e quello di un agente non sono necessariamente la stessa scelta.

La facoltà di Commander di invitare agenti è un'impostazione della chat nelle opzioni avanzate. Non significa che ogni agente sia sempre installato. Puoi rimuovere gli agenti non desiderati; Commander è il coordinatore essenziale. Gli agenti aggiunti a una chat già avviata ricevono il contesto condiviso previsto dal prodotto: evita di coinvolgerli in conversazioni che contengono materiale non destinato al loro provider.

Durante l'esecuzione osserva risposte, avanzamento e richieste di input. Un agente può dover aspettare una cartella, un dato o un'autorizzazione. Rispondi nel modulo o nel pannello appropriato. Fermare il lavoro non equivale ad annullare azioni già completate su file o servizi: controlla gli effetti prima di riprovare.

Una nuova chat può usare le regole di progetto, ma non presume di avere letto integralmente tutte le conversazioni passate. Per riprendere un lavoro, indica decisione, file o risultato da riutilizzare. Le attività parallele richiedono proprietà chiare sui file per evitare sovrascritture.

### Prompt per una squadra

> Progetta una piccola app locale per catalogare libri. Coinvolgi, se disponibili, progettazione UI, frontend e backend. Prima presenta struttura e contratti; poi implementa nella cartella selezionata, preserva file esistenti e verifica i flussi principali. Non pubblicare nulla.

L'indicazione dei ruoli non installa automaticamente risorse mancanti. Talia deve spiegare cosa può eseguire con la squadra disponibile.

<a id="manuale-5"></a>

## 5. Progetti e cartelle di lavoro

Un progetto organizza conversazioni, istruzioni persistenti, documenti e attività intorno a un obiettivo. Usa le regole per decisioni durevoli: lingua, stack, stile di consegna, confini di accesso e criteri di qualità. Non usare le regole come un registro di stato che diventa subito obsoleto.

La cartella del progetto è l'area operativa sul disco. Scegli la cartella corretta, non l'intero disco per comodità. Cartelle aggiuntive richiedono un motivo: leggere una fonte o scrivere una consegna non sono permessi equivalenti. Il percorso di lavoro e la libreria documentale sono distinti: un file dentro una cartella non è necessariamente indicizzato nel RAG, e importarlo nella libreria non autorizza la modifica dell'originale.

Per un repository software, gli agenti devono leggere le istruzioni applicabili, ispezionare le modifiche esistenti e preservare lavoro non correlato. Prima di modifiche distruttive chiedi un backup o un controllo delle differenze. Un test passato non prova il percorso grafico; un'interfaccia plausibile non prova la persistenza dei dati.

Esempio di regole di progetto:

> Rispondi in italiano. Mantieni gli originali. Salva le consegne nella cartella selezionata. Per le analisi cita le fonti; per il codice esegui i test disponibili e dichiara quelli non eseguibili. Non pubblicare, eliminare o acquistare servizi senza la mia richiesta.

Se sposti una cartella fuori da Talia, verifica i riferimenti del progetto. Una cartella scollegata non è una cartella vuota: evita di ricreare strutture o sovrascrivere dati senza aver risolto il percorso.

<a id="manuale-6"></a>

## 6. Modelli, provider e configurazioni

Il provider è il servizio o runtime che offre i modelli. Il modello è la scelta concreta usata per generare la risposta. Le modalità di accesso possono comprendere API, OAuth o runtime locali, a seconda del provider e della versione. La presenza del nome nel catalogo non dimostra che il tuo account possa usarlo.

In Impostazioni → Modelli puoi configurare i collegamenti disponibili. Il selettore del compositore permette di visualizzare i modelli, cambiare modello e aprire Configura modelli per aggiungerne uno. Aggiorna la discovery quando previsto: disponibilità e nomi possono cambiare sul servizio.

Controlla queste dimensioni prima di scegliere:

- qualità e finestra di contesto per documenti lunghi;
- supporto per strumenti, immagini e altre modalità;
- latenza e limiti di frequenza;
- costi e condizioni del tuo account;
- località e riservatezza del trattamento;
- compatibilità con l'agente o runtime usato.

Cambiare modello non concede nuovi permessi sul filesystem e non collega servizi esterni. Un modello testuale non acquisisce capacità di generare video soltanto perché riceve un prompt video. Alcune funzioni usano strumenti o modelli diversi da quello della chat.

Le chiamate ai provider possono essere fatturate secondo il tuo contratto. Le stime nell'app non sostituiscono il rendiconto del provider. Non applicare a Talia i piani, i crediti o la membership commerciale di Orkas. Non esiste una garanzia universale di offline: per inferenza remota, download, discovery e servizi connessi serve rete. Un runtime locale richiede componenti adeguati e risorse del dispositivo.

Per un errore di accesso controlla provider scelto, account, autenticazione e disponibilità del modello. Usa solo i pannelli protetti per le credenziali. Non incollare log completi che possono contenere token o URL OAuth.

<a id="manuale-7"></a>

## 7. Tema, lingua e preferenze

Impostazioni raccoglie preferenze del dispositivo e del prodotto. Nelle sezioni generali/aspetto, quando disponibili nella versione installata, scegli tema e lingua. Il tema modifica la presentazione, non la capacità del modello. La lingua dell'interfaccia e la lingua richiesta nelle risposte sono concetti distinti: specifica la lingua del risultato se conta per il lavoro.

Verifica il risultato su elenchi, chat, documenti e moduli. Contrasto insufficiente, testo tagliato o controlli non visibili sono problemi dell'interfaccia, non errori del prompt. Non cambiare provider per correggere un tema.

Le configurazioni possono essere globali, di progetto, di chat o di agente. Prima di cambiare un'impostazione chiarisci lo scope. Un override di modello in una chat non va descritto come modifica di tutti i progetti. Per notifiche, avvio automatico, microfono e funzioni native possono servire permessi del sistema operativo; l'app non può concederseli da sola.

<a id="manuale-8"></a>

## 8. Skill, agenti e connettori

### Skill

Una skill è un pacchetto di istruzioni, riferimenti e talvolta risorse di lavoro. Aiuta l'agente a usare una procedura consistente: revisione di una consegna, analisi, redazione o sviluppo. Viene caricata quando pertinente, non tutta dentro ogni messaggio. Installare non significa eseguire; una skill non deve attribuirsi autorità che la richiesta non concede.

Le skill di default sono rimovibili. Se ne disinstalli una, il seed non deve reinstallarla a ogni avvio. Puoi ripristinarla esplicitamente dallo Store o dal percorso previsto. Una skill personale, una skill di agente e una risorsa globale possono avere ambiti diversi: controlla la fonte per evitare duplicati con lo stesso nome.

La Guida Talia informativa riusa la guida prodotto esistente, con identità tecnica stabile `talia-guide`. È fornita di default e consultabile globalmente finché installata. Non è obbligatoria né indispensabile per avviare l'app; rimuoverla e rimuovere il manuale sono scelte indipendenti. La guida spiega, ma non compie operazioni al posto della procedura proprietaria.

### Agenti

Un agente combina ruolo, istruzioni e risorse assegnate. Usa agenti specializzati per lavori con proprietà e risultati chiari: UI, frontend, backend, revisione o ricerca. Il nome del ruolo non dimostra la presenza degli strumenti: chiedi verifiche concrete. Gli agenti, salvo Commander, sono rimovibili; il prodotto deve funzionare anche con una squadra minima.

### Connettori

Un connettore espone strumenti di un servizio locale o remoto, spesso tramite MCP. Pochi collegamenti possono essere integrati nel prodotto; gli altri provengono dallo Store. Configurazione, eventuale CLI, autenticazione e connessione sono passaggi distinti.

«Configurato» non significa «Connesso». Prima di chiedere un'azione sul tuo account controlla lo stato della connessione e gli strumenti effettivamente disponibili. La procedura di configurazione deve provare la connessione: un preset salvato non dimostra accesso al servizio. Per gli strumenti locali possono servire un eseguibile installato e permessi di sistema; per quelli remoti, account e rete.

Disconnettere non significa cancellare i dati sul servizio. Disinstallare un connettore non revoca necessariamente token sul provider: usa anche le impostazioni di sicurezza del servizio quando necessario. Nessun connettore deve essere presentato come obbligatorio per il funzionamento base dell'app.

### Store e fiducia

Lo Store distribuisce risorse opzionali. Controlla autore, descrizione, versione e prerequisiti. I pacchetti possono cambiare il comportamento degli agenti: installa solo fonti che ritieni affidabili. L'installazione di una risorsa non deve eseguire automaticamente operazioni sul tuo account. La disponibilità locale di un pacchetto non prova che la sua versione sia già pubblicata nel catalogo remoto.

<a id="manuale-9"></a>

## 9. Pianificazione, attività e automazioni

Per un compito complesso chiedi prima un piano con fasi, output, dipendenze, test e punti di approvazione. Se chiedi esecuzione completa, il piano non è una consegna sostitutiva dell'implementazione. Se imponi una pausa, l'agente deve fermarsi al punto concordato.

La lista attività conserva lavoro da seguire e il relativo stato. Una scadenza è una data obiettivo, non un calendario di esecuzione. Un'attività non parte solo perché esiste; l'avanzamento automatico del backlog, dove abilitato, è un meccanismo separato dalla programmazione temporale.

Le automazioni eseguono una richiesta secondo una pianificazione. Verifica fuso orario, frequenza, destinatario, input e condizioni di fine. Salvare un calendario non dimostra che il servizio remoto risponderà all'ora prevista. Account scaduti, computer non disponibile e dipendenze mancanti possono impedirne l'esecuzione. Non inserire segreti nel titolo o nel testo dell'attività.

Esempio:

> Pianifica un riepilogo settimanale delle fonti collegate, indicando il fuso Europe/Rome. Prima di salvare verifica se il connettore è attivo e quali dati può leggere. Non inviare email e non pubblicare il riepilogo.

Prima dell'esecuzione mancano ancora giorno/ora se non già risolti: l'agente deve chiedere soltanto i dati bloccanti, non inventarli.

<a id="manuale-10"></a>

## 10. File, app e produzione di risultati

Puoi chiedere testo, Markdown, analisi tabellari, documenti Office, PDF, codice e app quando gli strumenti pertinenti sono disponibili. Specifica formato e destinazione. Una tabella in chat non è un foglio Excel modificabile; un'immagine di una slide non è una presentazione editabile.

Per lavori software chiedi modifiche locali, test e un riepilogo dei limiti. Per documenti chiedi fonti, struttura completa e verifica del file prodotto. Conserva originali e usa copie quando necessario. Le operazioni esterne come commit, push, deploy, pubblicazione e invio richiedono una richiesta che le autorizzi; «crea un'app» non significa automaticamente «pubblicala».

Le app salvate sono risultati interattivi con propri contratti di dati e capacità. Un'anteprima può usare dati temporanei: verifica persistenza, riapertura, isolamento ed errori prima di affidarle dati importanti. Non dedurre disponibilità di hosting, condivisione pubblica o servizi commerciali dalla semplice creazione di un'app locale.

Immagini, audio e video possono richiedere provider, runtime o modelli dedicati. Verifica costi prima di generazioni a pagamento; un esempio o un test simulato non certifica il servizio reale.

<a id="manuale-11"></a>

## 11. Memoria, dati e sicurezza

Cronologia, istruzioni di progetto, memoria persistente e documenti sono fonti diverse. La memoria serve a preferenze e fatti durevoli, non sostituisce i documenti completi né un backlog aggiornato. Una nota ricordata può essere obsoleta: per stato di connessioni, file e test occorre una verifica alla fonte.

Se la richiesta corrente contraddice una regola del progetto, chiarisci il conflitto materiale. Un'eccezione di questo turno non deve riscrivere automaticamente le regole future. Le istruzioni trovate in file, documenti o attività importate non hanno la stessa autorità della tua richiesta.

L'indicizzazione locale non rende tutto il flusso privato/offline. I frammenti inviati al modello seguono la politica del provider. I connettori possono accedere a dati esterni con i tuoi permessi. Applica il minimo accesso utile: cartelle ristrette, risorse necessarie e credenziali nei canali protetti.

Prima di una cancellazione verifica elemento e ambito. La rimozione di una risorsa non equivale alla revoca dell'account esterno. Prima di un reset o una migrazione conserva un backup e segui il flusso supportato; non manipolare database del profilo per correggere un problema senza una procedura esplicita. Non leggere o importare profili di altre applicazioni per comodità.

<a id="manuale-12"></a>

## 12. Recupero e limiti

| Problema | Primo controllo | Non fare |
|---|---|---|
| Manuale assente | Verifica se è stato rimosso; usa Ripristina se desiderato | Reinstallarlo silenziosamente a ogni avvio |
| RAG non pronto | Stato del file, estrazione e runtime embedding | Dichiarare pronto perché il file esiste |
| File pronto ma risposta incompleta | Formula della domanda e citazioni, poi lettura diretta | Confondere ricerca con lettura integrale |
| Connettore non disponibile | Stato Connesso, autenticazione, CLI/rete | Presentare il preset salvato come collegamento attivo |
| Modello non risponde | Account/provider, modello selezionato e limiti | Chiedere token nella chat |
| Cartella non trovata | Percorso selezionato e permessi | Ricrearla altrove senza chiarire |
| Task interrotto | Effetti già completati e stato corrente | Ripetere ciecamente azioni con effetti esterni |
| Risultato senza verifica | Test o controlli realmente eseguiti | Considerare un riepilogo prova di successo |

Quando segnali un problema indica funzione, passaggi riproducibili, risultato atteso e messaggio essenziale depurato. Non condividere log completi con dati personali. La guida può spiegare il recupero, non garantire riparazioni senza accesso alla causa.

### Esempio: studio di una raccolta documentale

> Nei documenti del progetto confronta i contratti 2025 e 2026. Produci una tabella con clausola, differenza e fonte. Leggi integralmente le sezioni sui pagamenti; marca come non verificabili le pagine non estratte. Non modificare i contratti.

### Esempio: analisi dati

> Analizza il foglio allegato: verifica colonne, righe duplicate e valori mancanti; documenta le regole di pulizia. Salva un rapporto e una copia pulita, lasciando invariato l'originale. Non inventare dati mancanti.

### Esempio: apprendimento del prodotto

> Spiegami la differenza fra skill, agente e connettore usando un esempio del mio progetto. Se non puoi verificare le risorse installate, dichiaralo invece di supporle presenti.

<a id="manuale-13"></a>

## 13. Rimuovere e ripristinare questa guida

Questo manuale è un normale documento Markdown. Puoi leggerlo, copiarlo, modificarlo e cancellarlo. La cancellazione o lo spostamento non devono provocare una nuova copia automatica al riavvio. Gli aggiornamenti dell'app non sovrascrivono le tue modifiche. Un file con lo stesso nome viene preservato.

Per riottenerlo usa il riquadro Manuale Talia nello Store/Documenti e l'azione Ripristina, quando presente nella tua versione. Il recupero usa la copia inclusa nell'app e funziona senza rete; lo Store distribuisce anche la versione Markdown scaricabile. Se il file esiste già, il ripristino non lo sovrascrive: salva prima una tua copia o rinominalo se vuoi recuperare il testo originale.

L'indicizzazione riparte dopo un ripristino esplicito. Se il testo è presente ma il RAG fallisce, usa Riprova, non ripristinare più copie. Puoi rimuovere indipendentemente la Guida Talia informativa; una disinstallazione volontaria va rispettata fino al successivo ripristino richiesto.

La disponibilità pubblica del download dipende dalla pubblicazione del sito Store: un file nel repository non è prova che il download remoto sia già online. Il catalogo delle estensioni supporta agenti, skill, connettori e app; il manuale è distribuito come documento di supporto, non mascherato da nuova skill.

<a id="manuale-14"></a>

## 14. Compositore, allegati, riferimenti e prompt personali

### 14.1 Scrivere e inviare una richiesta

**Percorso:** Nuova attività oppure una chat esistente → compositore in basso. Prima dell'invio verifica destinatario, modello, squadra, risorse e cartella. L'interfaccia distingue l'aggiunta di agenti dall'aggiunta di allegati: un file non è un membro della squadra.

1. Scrivi l'obiettivo e specifica cosa non deve essere modificato.
2. Usa il selettore modello per **vedere i modelli**, **cambiare modello** o aprire **Configura modelli** e **aggiungerne uno**. Se nessuno è configurato, completa prima Impostazioni → Modelli.
3. Aggiungi gli allegati con il pulsante dedicato o il trascinamento supportato; attendi il termine del caricamento e controlla eventuali rifiuti. Puoi rimuovere un allegato dalla bozza prima di inviare.
4. Controlla il destinatario; usa `@` e il selettore degli agenti per indirizzare il testo. Un nome non risolto non installa un agente. Le menzioni possono instradare parti della richiesta: non usarle casualmente se vuoi un solo responsabile.
5. Il selettore risorse consente di richiamare skill, connettori collegati e documenti disponibili. I suggerimenti `$` per le skill e `/` per i connettori non sono comandi di shell: scegli la risorsa effettiva nel menu. I riferimenti inseriti sono distinti dal normale testo del prompt.
6. Premi **Invia**. Nel compositore chat Invio invia; Maiusc+Invio inserisce una nuova riga. Durante la composizione IME completa prima il testo. Il pulsante Invia resta il percorso esplicito se il campo o il contesto usa scorciatoie diverse.

**Risultato:** la richiesta compare nella conversazione e l'esecuzione mostra attività, risposte e richieste di input. Una bozza inserita da un esempio o da un template non viene inviata automaticamente.

**Se non parte:** risolvi prima caricamenti ancora aperti, modello non configurato, campi richiesti o errore mostrato. Non premere ripetutamente Invia per superare una connessione incerta: verifica se esiste già una richiesta nella chat.

> Leggi gli allegati completati, elenca nome e copertura realmente letta, poi crea una sintesi Markdown. Non modificare gli originali e chiedi solo gli input indispensabili.

### 14.2 Formati: allegato, lettura e indice non sono la stessa cosa

| Ingresso | Formati/famiglie ammesse dal codice | Limite o distinzione importante |
|---|---|---|
| Testo | Markdown, TXT, CSV/TSV, JSON/JSONL/NDJSON, YAML, log, HTML/XML, RST, TeX, sottotitoli SRT/VTT e comuni sorgenti/configurazioni | Testo UTF-8; importazione non significa esecuzione del codice |
| PDF | `.pdf` | Allegato fino a 100 MiB; scansioni, cifratura e testo mancante possono impedire l'estrazione |
| Word | `.docx`, `.docm` | Allegato fino a 20 MiB; non è promessa di esecuzione macro né supporto `.doc` |
| Fogli | `.xlsx`, `.xlsm`, `.xls` | Allegato fino a 50 MiB; l'ammissione di `.xls` non garantisce estrazione: il lettore segnala i formati Office legacy non gestiti |
| Presentazioni | `.pptx`, `.pptm` | Allegato fino a 50 MiB; `.ppt` non è incluso |
| Immagini in input | PNG, JPG/JPEG, WebP, GIF | Allegato fino a 20 MiB; analisi e indicizzazione dipendono dalla capacità visiva/descrittore |
| Video in chat | MP4, WebM, MOV, M4V, OGV | Fino a 200 MiB; allegare non garantisce analisi di ogni frame |
| Audio in chat | MP3, WAV, OGG, OPUS, M4A, AAC, FLAC | Fino a 50 MiB; riprodurre non equivale a trascrivere |
| ZIP in chat | `.zip` | Fino a 8 MiB, riferimento opaco per strumenti di importazione; non è estratto né eseguito automaticamente |
| Biblioteca | Testo, PDF, Office moderno, `.xls` ammesso, immagini raster sopra | Limite di ammissione 200 MiB/file; audio, video e ZIP non sono ingressi generici della Biblioteca |

Il compositore ammette al massimo **20 allegati distinti per messaggio non inviato**. I limiti di estrazione, anteprima, indicizzazione, modello e contesto possono essere più restrittivi dell'upload. Un'estensione visualizzabile in anteprima locale, per esempio SVG, non diventa per questo un formato ammesso per input visivo o RAG. Per errori di formato converti una **copia** in un formato supportato; non limitarti a cambiare l'estensione.

### 14.3 Citare messaggi e riusare un lavoro

Nel menu del messaggio usa copia o citazione; le citazioni possono includere i riferimenti ai file. La selezione di più messaggi serve a comporre un contesto esplicito, non a concedere accesso indiscriminato alla cronologia. Il flusso di riferimento a un'attività permette di cercare il lavoro di origine, scegliere una destinazione globale o di progetto e proseguire in una nuova attività. Se la fonte non viene trovata, individua la conversazione corretta anziché ricostruirne a memoria i risultati.

> Riprendi il lavoro che ho citato: verifica prima i file prodotti e le decisioni ancora valide. Non dare per attuali test eseguiti prima delle ultime modifiche.

### 14.4 Libreria di prompt personali

**Percorso:** pulsante **Prompt** nella barra dell'editor di nuova attività, chat o progetto. È una libreria locale di testi riutilizzabili, distinta da skill e istruzioni di progetto.

1. Apri Prompt → Nuovo prompt; compila titolo, descrizione e corpo.
2. Usa `$argomento` o `${argomento}` e dichiara la variabile corrispondente. I tipi sono testo, numero, vero/falso e scelta; puoi impostare obbligatorietà e default. `$$` inserisce un dollaro letterale.
3. Salva oppure prova **Anteprima senza salvare**; compila i campi e controlla il testo esatto.
4. Inserisci al cursore/selezione, in fondo, oppure sostituisci dopo conferma. Allegati e riferimenti restano separati; l'inserimento non invia né cambia modello, destinatario o connessioni.
5. Per riuso esterno seleziona le definizioni → Esporta. Importa presenta una revisione: crea copie con nuovi ID, ignora o sostituisci esplicitamente i conflitti.

**Esempio di corpo:** `Confronta i documenti su $argomento e produci un rapporto in $lingua con fonti e limiti.` Dichiara due variabili testuali. I valori sostituiti non vengono reinterpretati come ulteriori variabili.

**Risultato:** testo modificabile nella bozza. **Recupero:** se la bozza cambia mentre il dialogo è aperto, riaprilo; se manca una variabile obbligatoria, compilala e rigenera l'anteprima. Non conservare segreti nei prompt: il JSON locale non è un keystore.

Limiti del formato attuale: 200 prompt o 4 MiB totali, corpo 64 KiB, 32 variabili, 50 scelte per enum, risultato 256 KiB. Import/export riguarda definizioni, non valori compilati, autorizzazioni o account. La distribuzione dei prompt tramite cataloghi di skill/agenti non è attualmente supportata.

<a id="manuale-15"></a>

## 15. Esecuzione, stop, retry, coda e cronologia

### 15.1 Seguire un'esecuzione e rispondere agli input

**Percorso:** chat → messaggi e dettagli del processo. Le fasi distinguono preparazione, autenticazione, chiamate strumenti, attese, compattazione del contesto ed errori. Apri i dettagli quando serve verificare ciò che è stato realmente eseguito; il testo «sto lavorando» da solo non dimostra un effetto su file o account.

Un modulo di input richiede dati strutturati; un pannello CLI interattivo permette input durante un processo. Inserisci credenziali soltanto nel pannello protetto appropriato, non nel testo della chat. Una richiesta di permesso non è un normale dato mancante: leggi azione e destinazione prima di approvarla. Se il lavoro è in attesa, rispondi alla richiesta attuale senza reinviare l'intero compito.

**Risultato atteso:** risposta finale con file, controlli effettuati e limiti. Se l'agente consegna soltanto un piano quando avevi chiesto implementazione completa, il lavoro non è concluso.

### 15.2 Fermare e riprovare

1. Usa **Stop** per interrompere la risposta/esecuzione interessata. Controlla lo stato finale o l'eventuale arresto ancora in corso.
2. Verifica file e azioni già completati: Stop non esegue rollback, non ritira email già inviate e non annulla job remoti già accettati.
3. Per una risposta fallita o vuota usa **Riprova** dove disponibile oppure formula una richiesta di ripresa indicando il punto confermato.
4. Prima di ripetere operazioni con effetti esterni chiedi una verifica di idempotenza o dello stato sul servizio.

> Riprendi dopo l'interruzione: ispeziona lo stato effettivo, conserva i risultati corretti e ripeti solo i passaggi mancanti. Non duplicare invii, acquisti o pubblicazioni.

Un retry richiede il messaggio sorgente: se è stato eliminato o non è disponibile, non aspettarti che l'app lo ricostruisca. Errori di account, rate limit o runtime mancante richiedono la correzione della causa prima del retry.

### 15.3 Coda della chat e attività in esecuzione

La coda nella conversazione è distinta dal backlog persistente. Puoi vedere richieste in attesa e lavori assegnati; dove la UI lo consente, modificare il testo accodato, salvare la modifica, riordinare, inviare subito, annullare o fermare un lavoro. Le dipendenze/attese mostrate spiegano perché un incarico non parte. «Esegui comunque» non è una soluzione neutra: usalo solo se intendi superare la condizione indicata.

Se modifichi una richiesta mentre la coda cambia, riapri la voce corrente in caso di conflitto. Non confondere richiesta annullata, lavoro fermato, errore e risultato completato. Una coda vuota non prova che i file siano corretti.

### 15.4 Cronologia e organizzazione

**Percorso:** barra laterale → conversazione; menu della chat per rinominare, fissare, spostare in un progetto, portare fuori dal progetto, archiviare o eliminare, secondo le azioni presenti. Usa titoli informativi. Prima di spostare una chat considera le regole e la cartella del progetto di destinazione; non equivale a spostare automaticamente tutti i file del disco.

La cronologia viene caricata per pagine. I controlli per messaggi più recenti, navigazione dei turni e caricamento ulteriore aiutano nelle conversazioni lunghe. Una pagina visibile non è tutta la cronologia. In caso di errore usa il retry di caricamento e verifica di aver aperto la conversazione giusta. La compattazione del contesto è una gestione tecnica del budget del modello, non una cancellazione della cronologia né prova che ogni dettaglio sia presente nel turno corrente.

### 15.5 Ricerca globale e ricerca web

**Percorso:** ricerca dell'app → inserisci la query → **Invio** → filtri/tipi disponibili. La ricerca locale raccoglie risultati di chat, progetti, attività e documenti; lo scope del progetto e la copertura dell'indice contano. Risultati e snippet possono arrivare progressivamente; se lo stato dice indicizzazione in corso, «nessun risultato» non dimostra assenza della fonte. Apri il risultato e verifica il contesto. Le ricerche precedenti si possono pulire nella superficie dedicata.

La ricerca **web** è invece uno strumento usato nella richiesta, configurabile in Impostazioni → Modelli → Ricerca. Usa servizi configurati, capacità di ricerca del modello o fallback disponibili: non garantisce accesso a pagine private, paywall o ogni sito. Per fatti aggiornati chiedi data, fonti e verifica; non confondere lo snippet di scoperta con l'intero contenuto.

> Cerca sul web la documentazione ufficiale aggiornata di questa libreria. Distingui versioni e fonti primarie; non installare né aggiornare pacchetti.

**Recupero:** per ricerca locale incompleta controlla scope e stato indice; per il web controlla rete e servizio. Cambiare modello non ripara automaticamente un indice locale mancante.

<a id="manuale-16"></a>

## 16. Squadra, agenti globali, modelli per agente e parallelismo

### 16.1 Comporre la squadra prima e dopo il primo messaggio

**Percorso:** Nuova attività → riquadro squadra / **+ Aggiungi agenti**; in chat → gestione della squadra. Cerca gli agenti installati e abilitati, selezionali con le checkbox e applica. I membri esistenti e i candidati da aggiungere sono distinti. Gli agenti globali non richiedono un binding preventivo al progetto per poter essere scelti: l'appartenenza alla **singola chat** resta esplicita.

Un binding nel progetto organizza risorse consigliate: non rende automaticamente ogni agente membro di ogni chat. Un agente disattivato o assente non è un candidato operativo. Non installare uno specialista soltanto perché il suo ruolo compare in un esempio.

La bozza mostra squadra e modelli prima dell'invio. Puoi controllare il modello di ciascun membro e usare un override per quella chat. Il modello predefinito dell'agente, quello globale e la selezione della conversazione hanno scope diversi. Nella chat iniziata i nuovi agenti ricevono attualmente **l'intera cronologia condivisa**: controlla i dati presenti e il provider scelto prima di aggiungerli. Questo non autorizza la lettura di cartelle esterne.

**Risultato:** i membri selezionati sono visibili nella squadra della chat. **Recupero:** se il catalogo non si carica, riprova senza sostituire la squadra; se un modello non è più disponibile, correggi la selezione. Rimuovere un membro non cancella i messaggi già pubblicati.

### 16.2 Inviti di Commander e delega

Nelle **Avanzate della chat**, **Commander invita agenti** consente al coordinatore di aggiungere collaboratori disponibili; è attivo di default e puoi disattivarlo per quella conversazione. Non equivale a installazione automatica o autorizzazione aggiuntiva. Commander resta essenziale; gli altri agenti sono rimovibili.

> Usa gli agenti già disponibili. Assegna al backend il contratto API, al frontend i componenti e al revisore i test; nessuno deve modificare lo stesso file senza coordinamento. Se manca un ruolo, segnala il limite.

### 16.3 Consentire lavori in parallelo

**Percorso:** Avanzate della singola chat → **Consenti lavori in parallelo**. È un controllo per chat, non un nuovo pannello operativo da tenere aperto. La disponibilità dipende dal supporto runtime esposto dalla versione.

Attivo consente nuovi avvii paralleli ammessi dalle regole del runtime. Disattivarlo impedisce **nuovi** avvii ma **non ferma** i lavori già ammessi, compresi quelli già in coda. Per interrompere un lavoro usa Stop. Errori e approvazioni continuano a essere necessari: parallelismo non significa bypass dei permessi.

Usalo per compiti indipendenti con output separati. Per lavori sugli stessi file chiedi proprietà esplicite e verifica finale integrata. Non interpretare il numero di risposte come velocità garantita: provider, limiti e risorse del computer possono rendere il parallelo meno conveniente.

### 16.4 Ragionamento e runtime CLI/ACP

Dove compare il controllo di ragionamento/thinking, scegli soltanto i valori dichiarati per quel modello/runtime. La UI distingue configurazione globale del modello, default agente e override chat. Un controllo assente, fisso o non disponibile non è una promessa di supporto nascosto. Il ragionamento interno non è una fonte da citare né un sostituto dei test.

Gli agenti CLI/ACP richiedono eseguibile compatibile, autenticazione e directory corretta. Nella scheda agente controlla runtime, modello, ragionamento e permessi effettivamente disponibili; alcuni parametri sono gestiti dal runtime o sono solo parzialmente supportati. Non dare per universale la compatibilità fra famiglie CLI. Installa o aggiorna soltanto tramite il flusso supportato, con conferma quando richiesta. Un runtime rilevato non dimostra che il login o l'inferenza reale funzionino.

<a id="manuale-17"></a>

## 17. Progetti: percorso completo, istruzioni, memoria e cartelle

### 17.1 Creare e organizzare un progetto

**Percorso:** Progetti nella barra laterale → nuovo progetto → nome → dettaglio. Organizza chat, attività, documenti e risorse nella relativa area. Dal menu puoi rinominare o eliminare; prima di eliminare controlla conversazioni attive e automazioni collegate. L'app avvisa in presenza di lavoro in corso: non aggirare quel controllo.

**Obiettivo/regole:** apri il riquadro delle istruzioni → Modifica → salva testo completo e coerente. Sono direttive persistenti per i lavori del progetto, non un prompt inviato una sola volta. Una modifica non certifica la rilettura di tutte le chat già avviate. **Memoria progetto:** il riquadro fatti e decisioni conserva conoscenza durevole; modifica o elimina le note diventate inesatte. Le note non sono istruzioni eseguibili solo perché contengono imperativi.

> Imposta come regole del progetto: fonti citate, originali conservati, consegne Markdown e test per il codice. Non inserire stati temporanei o credenziali. Chiedimi prima di modificare regole già in conflitto.

**Risultato:** progetto con contesto esplicito e chat riconoscibili. **Recupero:** se il salvataggio fallisce, conserva il testo in una copia e ricarica lo stato corrente prima di riprovare. Non presumere che una modifica non salvata sia già applicata.

### 17.2 Cartella principale, cartelle aggiuntive e scope

**Percorso:** chip cartella/workspace nel compositore o nel progetto → cartella predefinita, recenti o selettore nativo. Puoi aprire la cartella nel file manager, scegliere una nuova destinazione e gestire cartelle aggiuntive. Rimuovere una cartella dall'elenco disponibile non significa cancellarne i file.

Nella home senza progetto il workspace è quello globale predefinito. Nella chat di progetto il workspace appartiene al progetto e la scelta si applica alle sue conversazioni: controlla lo scope prima di cambiarlo. La Biblioteca del progetto è un'area documentale distinta dalla cartella operativa. La cartella principale non autorizza da sola ogni percorso del computer.

1. Scegli una cartella dedicata, con backup se contiene lavoro importante.
2. Aggiungi altre cartelle soltanto per fonti o destinazioni necessarie.
3. Chiedi una ricognizione in sola lettura prima di modificare un repository sconosciuto.
4. Conserva istruzioni locali, file dell'utente e modifiche non correlate.

**Recupero:** per un percorso spostato o permesso negato correggi la selezione. Un collegamento mancante non prova che il contenuto sia stato cancellato. Tornare alla cartella predefinita non è una migrazione automatica dei dati.

### 17.3 Collaborazione: limite attuale

I progetti locali e la squadra di agenti non equivalgono a collaborazione cloud fra persone. La voce di invito membri può mostrare un avviso di indisponibilità nel prodotto indipendente: non esiste una garanzia di condivisione remota, account commerciali o sincronizzazione multi-dispositivo. Per condividere un risultato usa un file esportato con autorizzazione esplicita, non un link immaginato.

<a id="manuale-18"></a>

## 18. Backlog Kanban, revisioni e avanzamento automatico

### 18.1 Creare, assegnare e seguire un'attività

**Percorso:** **Da fare / To-do** globale oppure attività del progetto. Crea una voce con richiesta completa, responsabile se necessario, data obiettivo e allegati. Modifica o elimina dal menu; apri la conversazione collegata per vedere l'esecuzione. Le viste per progetto e la board permettono di distinguere i lavori senza copiare manualmente gli stessi task.

Gli stati del backlog sono **da fare (`todo`)**, **in corso (`progress`)**, **in revisione (`review`)**, **completato (`done`)**. La board runtime della chat può invece mostrare coda, esecuzione, attesa input, blocco, errore o stop: sono due registri diversi. Non tradurre automaticamente «agente ha risposto» in «attività completata».

**Esegui** avvia il lavoro e associa una conversazione. Un task già in esecuzione non va lanciato di nuovo. La scadenza non è uno scheduler. Gli allegati del task sono fonti persistenti di quella richiesta: non presumere che il modello li abbia già letti integralmente.

> Crea nel backlog tre attività: inventario fonti, analisi e revisione finale. Specifica risultati e criteri di verifica. Non avviarle e non marcarle completate adesso.

**Recupero:** se il run è occupato apri la conversazione corrente; se il risultato è incompleto conserva il task aperto con i fatti verificati. Una dipendenza dichiarata deve risultare realmente soddisfatta, non soltanto in revisione.

### 18.2 Revisione e dipendenze

Il passaggio **Review** separa consegna tecnica e decisione finale. Esamina output e controlli, poi approva/completa oppure richiedi correzioni tramite le azioni disponibili. Le dipendenze possono bloccare i lavori successivi finché il predecessore non è completato. Non usare «Done» per sbloccare artificialmente la coda.

I riferimenti fra task, allegati e conversazioni non sono una garanzia di tutti i flussi end-to-end: verifica ogni relazione importante nella versione installata. L'esecuzione manuale non sostituisce una dipendenza mancante o una richiesta di approvazione ancora aperta.

### 18.3 Avanzamento automatico del backlog

Il controllo di avanzamento automatico nel contesto delle attività/progetto è un **opt-in**, distinto dalle automazioni a calendario e dal parallelismo della chat. Leggi l'ambito, il dispositivo e gli eventuali limiti giornalieri prima di attivarlo. Il driver seleziona attività eleggibili rispettando stato e dipendenze; non è un'autorizzazione a pubblicare, spendere o ignorare revisioni.

**Risultato:** avvio dei task eleggibili nel contesto previsto. **Recupero:** disattiva l'avanzamento per impedire nuove partenze, controlla la chat e usa Stop per il lavoro corrente. Un task fermato non va rimesso automaticamente in esecuzione senza esaminare gli effetti già avvenuti.

<a id="manuale-19"></a>

## 19. Automazioni a calendario

**Percorso:** **Auto** globale o contesto di progetto → nuova automazione. Sono disponibili esecuzione singola, intervallo orario, giornaliera, settimanale e mensile; il form espone i campi pertinenti, i giorni e le condizioni di fine. Si possono scegliere destinatario e risorse disponibili, allegare fonti, modificare, attivare/disattivare, eseguire subito ed eliminare.

1. Definisci contenuto operativo e risultato, evitando segreti nel titolo/testo.
2. Scegli progetto o ambito globale e destinatario disponibile. Se l'agente, skill o connettore non è più disponibile correggi il riferimento.
3. Compila data/ora o frequenza. Verifica **fuso del dispositivo**, giorno del mese e regola di ultimo giorno quando proposta; una data scritta nel prompt non sostituisce i campi del calendario.
4. Imposta fine per data o numero di esecuzioni se desiderata. Salva e verifica il riepilogo.
5. Apri le conversazioni collegate all'automazione per verificare le esecuzioni reali. **Esegui ora** è un'avviamento esplicito, non una modifica della frequenza.

> Ogni lunedì alle 9, nel fuso del dispositivo Europe/Rome, prepara un riepilogo dei documenti del progetto e salvalo localmente. Prima di salvare segnala se manca un collegamento necessario. Non inviare messaggi esterni.

**Risultato:** calendario salvato e automazione visibile, non una certificazione di esecuzione futura. Il computer/app e le dipendenze devono essere disponibili; sospensione, riavvio, cambio d'ora, rete e login scaduto possono incidere. Il prodotto indipendente non promette un servizio cloud sempre acceso né sync su un altro dispositivo. Disabilitare sospende nuove esecuzioni: controlla separatamente il run già partito. Eliminare la regola non revoca azioni esterne già concluse.

**Recupero:** controlla stato abilitato, dispositivo, riepilogo orario, esecuzioni collegate, account e risorse; correggi la causa prima di Esegui ora per evitare doppioni.

<a id="manuale-20"></a>

## 20. Biblioteca e RAG: procedure operative complete

### 20.1 Importare, creare, modificare e organizzare

**Percorso:** Documenti/Biblioteca → selettore **globale/progetto**. Nel menu della radice o di una cartella puoi caricare, creare una cartella o un testo. Il trascinamento supportato permette organizzazione interna e import; non trascinare elementi su se stessi o sovrascrivere conflitti ignorando gli avvisi.

1. Scegli prima lo scope corretto; usa il progetto per fonti specifiche e il globale per materiale trasversale.
2. Carica dal selettore e attendi il riepilogo: nomi duplicati, file nascosti, estensioni o contenuti non ammessi possono essere rifiutati.
3. Apri il file. Per Markdown/testo usa lettura/modifica e salva; il lettore distingue anteprima parziale e contenuto editabile. Per Office/PDF/immagini usa anteprima o Apri nel sistema quando proposta.
4. Rinomina dal menu; per organizzare più elementi selezionali e usa il trasferimento. Distingui **Copia** da **Sposta**, verifica scope/cartella di destinazione e gestisci i conflitti senza perdere l'originale.
5. Salva le modifiche prima di cambiare documento o scope, oppure scegli consapevolmente scarta/annulla.

**Risultato:** file nella Biblioteca selezionata; indicizzazione come passaggio separato. **Recupero:** upload fallito non equivale a file importato; per conflitti scegli altro nome/destinazione. Un errore di anteprima non prova che i byte del file siano persi: prova l'apertura nel programma adatto.

### 20.2 Indicizzazione locale e immagini

La pipeline riconcilia i file con l'indice, estrae testo, genera embedding e salva frammenti. Gli stati pending/processing/ready/failed sono per documento; un errore dell'intero servizio può rendere lo stato sconosciuto. Gli indici globali e di progetto hanno contesti separati. La ricerca non include automaticamente ogni file delle cartelle autorizzate.

Per le immagini la descrizione richiede un componente/modello visivo configurato e può fallire separatamente dall'upload. Il modello di embedding locale è distinto dal modello della chat e dal descrittore delle immagini. Il backend vettoriale può usare componenti locali differenti; non serve inventare un campo di configurazione nella UI per cambiarlo. La presenza di codice Chroma o di un runtime non prova che la tua installazione lo stia usando.

**Procedura di recupero:** apri lo stato del documento; se manca runtime/modello ripristina quel prerequisito tramite il percorso supportato della distribuzione; poi usa **Riprova** per il documento fallito. Attendi lo stato nuovo. Non cancellare database del profilo o importare duplicati per simulare un indice pronto. Se non esiste un controllo utente per il componente mancante, segnala l'errore per assistenza: il manuale non prescrive comandi di installazione non verificati.

### 20.3 Chiedere risposte con fonti e copertura

Puoi usare **Chiedi a Commander** sul file o selezionare una fonte nel compositore. Chiedi documento, sezione/pagina quando disponibile e limiti di estrazione. Le citazioni vanno aperte e confrontate con la fonte: non tutti i formati conservano paginazione o riferimenti equivalenti. RAG pertinente non è lettura integrale e «ready» non prova qualità della risposta.

> Leggi integralmente questo manuale e confronta le sue sezioni con la lista di funzioni che allego. Riporta le porzioni non lette. Usa RAG solo per trovare fonti aggiuntive, non come prova di copertura completa.

Per un documento lungo richiedi esplicitamente lettura paginata completa e conteggio delle sezioni. Per dati normativi o contrattuali conserva la versione e verifica le parti decisive nell'originale. I frammenti usati nella risposta possono essere inviati al provider chat, anche con embedding locale.

### 20.4 Eliminare, ripristinare, scaricare

Elimina dal menu o dal lettore dopo aver controllato scope e nome. L'indice va riconciliato con la rimozione; non usare una vecchia citazione come prova che il file esista ancora. Non presumere che ogni eliminazione dalla Biblioteca produca una voce nel cestino: la conservazione dipende dall'operazione. Mantieni un backup dei tuoi documenti importanti.

Per il **Manuale Talia**: Biblioteca globale → card → Apri; per un fallimento RAG usa Riprova. Se rimosso: Store → card Manuale → **Ripristina in Biblioteca**, che usa la copia inclusa nell'app e non richiede rete. **Scarica Markdown** usa invece il sito pubblico e non importa né indicizza quel download. Il browser può chiedere destinazione o annullare: «download richiesto» non è conferma di salvataggio.

Il seed non ricrea un manuale cancellato/spostato né sovrascrive la tua copia modificata. Un aggiornamento dell'app può quindi includere un manuale nuovo senza aggiornare il documento già personalizzato. Per confrontarlo scarica la nuova copia e conserva la tua. Manuale e skill `talia-guide` hanno rimozioni indipendenti; nessuno dei due è un requisito obbligatorio per l'avvio.

<a id="manuale-21"></a>

## 21. Skill, agenti, Store e validazione

### 21.1 Gestire una skill

**Percorso:** Skill → elenco, ricerca/categoria → dettaglio. Verifica se è builtin, personale, globale, privata di agente o proveniente da catalogo. Usa **Attiva/Disattiva** per disponibilità senza disinstallazione; **Usa** prepara una richiesta con la risorsa, non garantisce che ogni sua istruzione sarà applicabile.

Puoi creare una skill, modificarne descrizione e contenuto tramite i controlli previsti, importare una directory o una fonte URL supportata, oppure installare dallo Store. L'importazione di uno ZIP nella chat è soltanto l'ingresso a un importatore con proprie verifiche, non esecuzione automatica. La modifica tramite assistenza va esaminata prima di considerarla corretta. Una skill può avere file di riferimento/script: fidati della fonte e controlla i prerequisiti.

**Risultato:** risorsa installata e abilitata nel proprio scope. **Recupero:** per rifiuto di validazione leggi il rapporto e correggi contenuto/metadati; non forzare l'importazione di codice sconosciuto per comodità. Disinstallazione e rimozione di pacchetti possono segnalare dipendenze o risorse condivise: esamina l'impatto.

### 21.2 Creare o personalizzare un agente

**Percorso:** Agenti → nuovo o dettaglio → modifica. Imposta nome, descrizione, workflow, risorse, runtime e formato di output proposto. I formati automatico, testo, dashboard e artefatto orientano la consegna; non creano strumenti mancanti. Avatar e colore distinguono visivamente il ruolo, non la qualità del modello.

La scheda può mostrare memoria e impostazioni del runtime. Le conversazioni di configurazione di un agente o di una skill sono distinte dal lavoro nel progetto. Verifica il risultato in una chat normale: un workflow salvato non prova che tutte le sue azioni funzionino. Gli agenti disabilitati possono restare nell'elenco senza essere eleggibili per nuovi inviti. Non puoi eliminare Commander come un comune specialista.

> Crea un agente revisore che distingua difetti, ipotesi e verifiche mancanti, senza modificare automaticamente i file. Usa soltanto risorse già disponibili; mostrami il workflow prima del primo uso.

### 21.3 Installare e aggiornare risorse nello Store

**Percorso:** Store → ricerca e filtri per tipo/stato → dettaglio → installazione/aggiornamento. Le famiglie di estensioni sono agenti, skill, connettori e app. Il manuale è una card documentale separata, non un pacchetto skill duplicato.

1. Controlla fonte/autore, versione, compatibilità host e dipendenze.
2. Esamina il piano e gli impatti prima di installare/aggiornare. Una risorsa condivisa può essere usata da più agenti.
3. Se sono presenti modifiche locali, non sovrascriverle alla cieca: conserva una copia e scegli la strategia proposta.
4. Dopo l'esito, verifica la risorsa nell'area appropriata. Un connettore installato richiede ancora configurazione e connessione.
5. Per rimuovere usa la disinstallazione esplicita; togliere una fonte di catalogo non è necessariamente disinstallare i pacchetti già presenti.

Il catalogo può mostrare risorse in cache e fonti da aggiornare. Una cache valida non prova l'ultima versione remota; un errore rete/firma/digest non va aggirato scaricando pacchetti non verificati. I builtin di primo avvio sono rimovibili; il tombstone impedisce reinstallazioni automatiche. Solo un ripristino/installazione richiesto può reintrodurli.

### 21.4 Regole di validazione personalizzate

**Percorso:** Impostazioni → Generali → **Validazione personalizzata**: stato, file di regole, ricarica e attivazione. Controlla script, blocchi eseguibili, metadati skill e JSON agente prima di salvataggio/installazione. Non è una sandbox runtime né una garanzia di sicurezza del pacchetto. Una regola caricata male va corretta, non compensata ampliando i permessi di esecuzione.

<a id="manuale-22"></a>

## 22. Connettori: configurazione, connessione, OAuth e portabilità

### 22.1 Collegare un servizio

**Percorso:** Connettori → catalogo/Store o **Aggiungi server MCP**. Per il server personale scegli **remoto HTTP** oppure **comando locale stdio**, compila i campi e usa **Aggiungi e connetti**. La UI salva e tenta handshake/discovery: **configurato** e **connesso** restano stati distinti. **Usa** è operativo soltanto con strumenti collegati e abilitati.

- **HTTP:** inserisci URL Streamable HTTP e autenticazione prevista. HTTPS è richiesto salvo loopback locale. Non è disponibile un trasporto SSE generico separato.
- **Stdio:** comando eseguibile, argomenti uno per riga e variabili ambiente nel formato richiesto. Il processo parte sul tuo computer a ogni connessione con i privilegi del tuo utente: non è una sandbox. La directory `cwd` non è un campo della form attuale.
- **Preset/CLI:** un pacchetto può richiedere installazione dell'eseguibile, percorso e login. Rilevamento o configurazione salvata non provano connessione. Non tutti i connettori storici basati su relay sono operativi nel prodotto indipendente.

I campi header/ambiente possono essere visibili durante l'inserimento: usa l'area di configurazione, non la chat, e non condividere screenshot. Un preset non autorizza azioni sul servizio. Dopo la connessione chiedi prima una verifica in sola lettura.

> Verifica quali strumenti espone il connettore già connesso. Riporta cosa puoi leggere e quali azioni scrivono sul servizio; non eseguire scritture.

### 22.2 OAuth diretto per MCP personale

Per un server HTTP compatibile seleziona OAuth. Scegli registrazione dinamica se il server la supporta oppure client preregistrato con parametri forniti dal servizio/amministratore. Il browser di sistema completa il consenso e ritorna al callback loopback locale. Puoi annullare. Client ID, eventuale segreto e scope vanno nei campi dedicati; non combinarli con un header Authorization manuale.

Il servizio deve supportare discovery e callback/metodi compatibili; OAuth non rende qualunque endpoint interoperabile. Per porta occupata, callback errato, scope mancanti o login scaduto correggi la configurazione e ricollega. Dopo un refresh incerto può essere richiesta una nuova autenticazione: non ritentare manualmente token copiati da log.

### 22.3 Modificare, disabilitare, disconnettere e rimuovere

Apri **⋯** nella scheda. Disattivare limita disponibilità senza equivalere a revoca remota. Disconnettere/rimuovere l'istanza è distinto dal logout o dalla revoca sul servizio. La modifica di un MCP personale richiede reinserimento dei campi trasporto sensibili e conferma di sostituzione; non vengono precompilati o mantenuti in modo occulto. La nuova connessione può fallire lasciando visibile un errore correggibile.

**Recupero:** verifica percorso CLI, rete, account, autorizzazioni e discovery. Riprova dopo aver corretto la causa; non ripetere automaticamente tool di scrittura falliti con esito incerto. La UI opera sull'intero connettore: l'esistenza di un'API backend per sotto-tool non equivale a un selettore grafico per ogni singolo strumento.

### 22.4 Esportare e importare configurazioni MCP

**Esporta configurazione** dalla scheda consente di scegliere i campi da includere, generare anteprima dopo conferma se si includono valori e salvare il JSON. I campi esclusi diventano riferimenti `$ref`, non segreti recuperabili dal destinatario. Rivedi il file: nome server, URL, argomenti e percorsi possono essere privati.

**Importa JSON** → scegli file o incolla → valida/anteprima → risolvi i riferimenti nei campi dedicati → **Salva senza connettere**. Le istanze importate restano pending: avvia esplicitamente **Connetti**. Non partono automaticamente al successivo bootstrap.

Il formato Talia v1 e un subset `mcpServers` sono supportati; non tutti i dialetti, `cwd`, SSE, interpolazioni ambiente o grant OAuth. Limiti attuali: 256 KiB e 32 server per importazione. Non è un backup completo di token, tool selezionati o stato di connessione. Se il file viene rifiutato correggi lo schema, non rimuovere la validazione.

<a id="manuale-23"></a>

## 23. Modelli, provider, costi e impostazioni di inferenza

**Percorso:** Impostazioni → **Modelli** → schede Chat, Ricerca, Immagini, Video, Sintesi vocale. Sono configurazioni separate: una chiave chat non abilita automaticamente ogni servizio multimediale.

### 23.1 Aggiungere e verificare un modello chat

1. Premi Aggiungi modello, scegli provider e modello tramite discovery oppure endpoint personalizzato supportato.
2. Usa accesso OAuth o API key nel pannello protetto. Per un endpoint personalizzato controlla URL, protocollo, ID modello e compatibilità strumenti; non bastano il nome o la risposta di una pagina web.
3. Esegui il test connessione disponibile e salva. Un test positivo non prova ogni modalità, limite o costo.
4. Riordina le voci dove previsto: la prima è predefinita, le successive costituiscono la catena di fallback configurata. Il comportamento effettivo dipende dall'adapter e dagli errori: non promette continuità senza perdita.
5. Nel compositore seleziona la voce desiderata; nella squadra controlla gli override dei membri.

**Antigravity** è un provider dedicato nelle impostazioni con proprio flusso di accesso, eventuale runtime e discovery. Le modalità personali/Business/Enterprise richiedono i parametri previsti dal servizio, per esempio progetto e regione se richiesti. Non inventare un account Enterprise né nasconderlo sotto un altro provider. Compatibilità, licenza e modelli restano dipendenti dal servizio e dal tuo account.

**Risultato:** configurazione selezionabile, non promessa di accesso permanente. **Recupero:** per modello rimosso aggiorna discovery e correggi la selezione; per autenticazione scaduta accedi di nuovo; per rate limit attendi o scegli una voce realmente autorizzata. Non incollare URL OAuth completi, chiavi o log integrali nella chat.

### 23.2 Scope, thinking, consumo e stime

Default globale, preferenza agente, modello di chat e override per membro possono differire. Prima di un cambiamento controlla dove viene applicato. Le capacità di inferenza variano: un valore thinking salvato ma non valido per il runtime va corretto, non considerato una nuova abilità.

Il pannello costi della conversazione espone uso/costi registrati e ripartizioni per modello/agente e periodo quando i dati esistono. I prezzi di catalogo, le stime e l'uso dei runtime CLI hanno provenienze e limiti distinti. Un dato mancante non equivale a costo zero; l'app non sostituisce la fattura o il pannello del provider. La finestra di contesto e la compattazione non sono una promessa di lettura infinita.

Non applicare abbonamenti/crediti Orkas al prodotto Talia indipendente. Residui di compatibilità nel codice o stringhe storiche non provano che il relativo servizio sia abilitato.

<a id="manuale-24"></a>

## 24. Aspetto, lingua, notifiche, avvio e rete

### 24.1 Aspetto e lingua

**Percorso:** Impostazioni → Generali → Tema/Lingua. I temi esposti sono **Soft light**, **Dark Slate**, **Anthracite Yellow**; la variante gialla usa l'accento del prodotto. Cambiare tema non cambia provider o dati. La lingua UI è distinta dalla lingua del risultato richiesto; nuove stringhe possono ricadere nel fallback inglese se la traduzione manca.

Puoi ridimensionare finestra e barra laterale; scala/zoom e dimensioni del display influenzano il layout. Se un controllo non è raggiungibile segnala vista, tema e dimensioni, non tentare di risolvere modificando le credenziali. Per una consegna scrivi esplicitamente «in italiano» quando necessario.

### 24.2 Notifiche e avvio automatico

**Percorso:** Impostazioni → Generali → Avvio automatico e notifiche attività. Le notifiche riguardano conclusione, errore o necessità di intervento quando Talia non è in primo piano. Servono permessi del sistema: il toggle nell'app non può scavalcarli. Usa **Apri impostazioni di sistema** se proposto. L'avvio automatico dipende dalla piattaforma e dal tipo di installazione; uno stato non supportato va rispettato.

Chiudere una finestra può lasciare l'app in background; uscire completamente è un'azione diversa. Se ci sono lavori attivi leggi l'avviso prima di terminare. Sospensione del computer e rete interrotta possono incidere sulle esecuzioni e sulle automazioni. Non considerare il badge una prova di successo del compito: apri il risultato.

### 24.3 Proxy e rete aziendale

**Percorso:** Impostazioni → **Rete**. Scegli la modalità esposta (sistema/automatica, diretta, PAC o manuale); per proxy manuale compila HTTP/HTTPS ed esclusioni. Se HTTPS è vuoto viene usato il proxy HTTP secondo il riepilogo. Le destinazioni loopback restano escluse. Non inserire credenziali nell'URL del proxy.

Puoi selezionare un certificato aziendale PEM aggiuntivo dove previsto: la verifica TLS resta attiva. **Test connessione** prova i valori correnti senza salvarli, credenziali o chiamate al modello; una risposta di rete non convalida account o licenza. **Salva** può richiedere riavvio; i lavori già attivi conservano la connessione precedente.

**Recupero:** verifica modalità, URL, esclusioni, certificato e messaggio essenziale; applica il riavvio richiesto solo dopo aver gestito i lavori in corso. Il routing dei runtime esterni/CLI non è universalmente identico a quello Electron: per un errore limitato a un runtime segnala quel dominio senza disabilitare TLS né ampliare i permessi.

<a id="manuale-25"></a>

## 25. Permessi locali, memoria, dati, cestino e backup

### 25.1 Tre modalità di accesso locale

**Percorso:** Impostazioni → Generali → Permessi operazioni locali. Le modalità sono **Prudente/Cautious** (workspace e approvazione azioni sensibili), **Standard** (tutti i file con approvazioni sensibili) e **Fidato/Trusted** (accesso ampio senza quelle approvazioni). Leggi le descrizioni effettive nella tua lingua.

Usa il minimo accesso necessario. Non passare a Fidato come rimedio generico a un errore. Una selezione della cartella, una conferma di comando, la cancellazione di un file e il consenso di un servizio sono controlli diversi. Le CLI e i server stdio possono avere privilegi propri: i controlli dell'app non sono una sandbox universale. Un'approvazione precedente non autorizza automaticamente un'azione diversa o un altro account.

**Recupero:** per diniego controlla l'operazione e il percorso richiesti; se legittimi usa il flusso di autorizzazione pertinente. Per stop o cambio account non riutilizzare un vecchio pannello di consenso.

### 25.2 Memoria e revisione automatica

**Percorso:** Impostazioni → Dati → Memoria, oppure memoria nel progetto/scheda agente. Gli ambiti utente, condiviso, progetto e agente non sono intercambiabili. Leggi, correggi o rimuovi note inesatte; esportazione/importazione disponibili non equivalgono al backup di tutti i dati dell'app.

> Ricorda nel solo progetto che i rapporti approvati usano unità metriche. Non salvare numeri di documenti personali, credenziali o stato temporaneo dei task.

In Generali il controllo **Revisione automatica degli agenti** gestisce riflessioni periodiche sul lavoro e aggiornamenti comportamentali previsti. Disabilitarlo interrompe revisioni automatiche future, non cancella la memoria precedente. Non è addestramento dei pesi del modello né garanzia di miglioramento continuo. Se la memoria è piena rivedi/elimina note superate, non presumere che una nuova nota sia stata salvata senza ricevuta.

### 25.3 Directory dati e pulizia cronologia

**Percorso:** Impostazioni → Dati → Directory dati → Apri nel file manager. Contiene dati locali del prodotto, non necessariamente tutti gli originali delle cartelle esterne. La pulizia della cronologia filtra per anzianità/ultimo utilizzo e permette selezione per progetto o attività: esamina anteprima e selezione prima della conferma.

Non cancellare manualmente database, registry o indici per liberare spazio mentre l'app lavora. La pulizia cache ricostruibile, la cancellazione di cronologia e la cancellazione di fonti sono operazioni con conseguenze diverse. Un pulsante tecnico interno non è automaticamente una funzione grafica disponibile.

### 25.4 Cestino e ripristino

**Percorso:** Impostazioni → Dati → **Cestino**. Le eliminazioni coperte da snapshot possono essere ripristinate o eliminate definitivamente. Controlla tipo, contenuti e conflitti prima di ripristinare; un elemento già presente non va sovrascritto alla cieca. La cancellazione definitiva non è un modo reversibile di nascondere una voce.

Non ogni rimozione di file, pacchetto o dato esterno passa da questo cestino. La revoca sul servizio e il ripristino del manuale/skill seguono flussi distinti. Eliminare un progetto può coinvolgere chat e automazioni: leggi il riepilogo, interrompi i lavori necessari e conserva le consegne importanti.

### 25.5 Backup e riservatezza: ciò che non è garantito

Non è documentata una procedura grafica universale di **backup completo e ripristino multipiattaforma** di profilo, segreti, app, cartelle esterne e servizi. L'export di prompt, memoria o configurazioni MCP è **parziale** e non lo sostituisce. Per un backup del filesystem usa strumenti affidabili del sistema, chiudi l'app dopo aver gestito i lavori e includi separatamente gli originali esterni. Non importare profili di altre applicazioni e non ripristinare database a caldo.

La presenza di cifratura locale non equivale a un keystore hardware/OS né a protezione da chi possiede interamente il profilo. Proteggi dispositivo e backup; non esportare segreti nei normali deliverable. Embedding locale, modello remoto e connettore esterno hanno trattamenti distinti.

<a id="manuale-26"></a>

## 26. File prodotti, Office/PDF, anteprime, artefatti e app

### 26.1 Dal prompt alla consegna verificabile

**Percorso:** chat → file prodotti/chip → lettore o pannello File. Chiedi formato concreto, destinazione e controllo. Apri il file finale, non soltanto l'anteprima del messaggio. I file possono essere rinominati, esportati, rivelati nel sistema o salvati in Biblioteca tramite i flussi disponibili. Una consegna non salvata in Biblioteca non è automaticamente fonte globale RAG.

> Crea un DOCX modificabile e un PDF del rapporto; controlla struttura e impaginazione, conserva gli originali e indica cosa non hai potuto verificare. Non inviare né pubblicare i file.

Word, Excel e PowerPoint richiedono un risultato realmente editabile. Per fogli verifica formule, valori e tipi; per slide layout e contenuti; per PDF estrazione e pagine. Conversione, rendering e OCR dipendono dai componenti disponibili. Macro e formati Office legacy non sono automaticamente supportati. Se un lettore mostra soltanto parte del file, non usarlo come prova di copertura totale.

**Recupero:** chip con file mancante → verifica se è stato spostato/eliminato o se il workspace è cambiato. Non ricreare un originale a memoria. Un errore di preview può essere distinto dal file: apri con l'app nativa ed esamina l'errore essenziale.

### 26.2 Testo, dashboard e artefatti interattivi

Un messaggio Markdown è una narrazione; una dashboard è uno snapshot strutturato; un artefatto è un'interfaccia interattiva con click/input/calcoli. Specifica quale serve. Un grafico visualizzato non implica che esista un XLSX con dati e formule.

Le anteprime HTML e le app usano isolamento e regole di navigazione/risorse. Link non autorizzati o asset mancanti possono essere rifiutati intenzionalmente; non disabilitare le protezioni. Per modifiche chiedi di preservare dati, testare i flussi normali e riaprire il risultato. Dati temporanei dell'anteprima non sono prova di persistenza.

> Crea un'app locale per catalogare libri con inserimento, ricerca e modifica. Verifica persistenza dopo chiusura e riapertura, segnala il contratto dati usato e non pubblicare online.

### 26.3 Salvare e riaprire un'app

Dall'artefatto usa il salvataggio previsto; nella sezione **App** puoi elencare, aprire nell'app, rinominare, aprire per modifica ed eliminare. Prima di una sostituzione leggi l'impatto sui dati e usa l'esportazione dati proposta se necessario. Un pacchetto app e i suoi dati sono entità distinte.

**Risultato:** app riapribile nell'host con capacità consentite, non un sito pubblico automaticamente distribuito. La preparazione della condivisione e l'esistenza di chiamate publish nel codice non certificano hosting indipendente: la pubblicazione cloud non è una funzione consegnata da presumere nel clone. Un SDK o una bozza di manifesto non garantiscono supporto di ogni integrazione.

**Recupero:** per conflitti di salvataggio o recupero apri la scelta proposta; conserva l'app precedente e i dati prima di sostituire. Testa il normale punto d'ingresso, non solo funzioni interne.

<a id="manuale-27"></a>

## 27. Browser, navigazione assistita e sessioni

**Percorso:** dettagli della conversazione → scheda **Browser**. Il pannello permette schede, indirizzo/navigazione, attivazione/chiusura, apertura esterna e interazione con la pagina; le capacità agentiche dipendono dagli strumenti disponibili. È distinto dalla ricerca web testuale.

1. Definisci sito e obiettivo. Per un accesso fai login nel pannello/browser previsto, non condividere password con l'agente in chat.
2. Controlla richieste per upload, download, permessi e azioni sensibili.
3. Se necessario interagisci direttamente, annota/indica elementi con il controllo previsto e restituisci il lavoro all'agente.
4. Verifica destinazione e contenuto di download/upload; una pagina caricata non prova il completamento di un modulo.

> Apri la documentazione pubblica e trova la sezione installazione. Non accedere al mio account, scaricare eseguibili o inviare form; riporta fonti e limiti.

Le sessioni e i profili browser sono separati dal browser personale. Non promettere importazione di cookie, password o profili. Passkey e autenticazione dipendono da sistema/sito e non sono universalmente qualificate. CAPTCHA, policy del sito e pagine dinamiche possono richiedere intervento umano.

**Recupero:** ricarica la scheda o correggi l'URL; risolvi il consenso pertinente senza ampliare l'accesso a tutto il dispositivo. Per problemi di sessione accedi nuovamente nel flusso supportato. Un'azione già eseguita sul sito non è annullata chiudendo il pannello. Non usare un'anteprima HTML locale come prova di un workflow browser reale.

<a id="manuale-28"></a>

## 28. Immagini, audio, video e dettatura

### 28.1 Immagini

**Percorso:** Impostazioni → Modelli → Immagini; poi richiesta in chat con risorse pertinenti disponibili. Configura provider/modello e account nel pannello dedicato. Generazione, modifica con riferimenti e analisi visiva sono capacità differenti. Risoluzione, formati, numero di immagini e costi dipendono dal servizio.

> Genera una proposta di illustrazione per questa brochure usando il riferimento allegato. Prima indica provider, costo noto o non noto e limiti; salva il risultato e non pubblicarlo.

**Risultato:** file visualizzabile e salvabile, con provenienza quando disponibile. **Recupero:** verifica stato del job, profilo immagini e compatibilità del riferimento; per un esito remoto incerto controlla il job prima di ripetere una generazione a pagamento. Una preview mancante non dimostra che il job non sia stato fatturato.

### 28.2 Video e revisione

**Percorso:** configurazione in Modelli → Video; lavoro in chat con workflow/strumenti video disponibili e pannello di revisione quando prodotto. Il codice include job, riferimenti, controllo produzione, consegna e review: non significa che ogni provider supporti tutte le opzioni o che un editor timeline completo sia sempre esposto.

Definisci durata, rapporto d'aspetto, fonti, audio e destinazione; chiarisci i punti di approvazione prima di render o chiamate costose. Nel pannello di review controlla versione, approvazioni e asset collegati. Un'approvazione su una versione non vale automaticamente per una nuova modifica.

> Prepara storyboard e piano video di 30 secondi. Fermati prima di generazione a pagamento/render finale; elenca fonti, musica autorizzata e prerequisiti mancanti.

**Recupero:** consulta stato e errore del job, verifica runtime/asset/servizio, poi riprendi il passaggio mancante. Non dichiarare finale un'anteprima né promettere montaggio, sincronizzazione audio o recovery universali non provati.

### 28.3 Sintesi vocale e file audio

**Percorso:** Modelli → Sintesi vocale → provider, voce, modello e formato dove richiesti. Chiedi lingua, testo, voce autorizzata, destinazione e verifica della durata. Alcuni servizi richiedono endpoint/resource ID specifici nei campi dedicati.

> Crea un audio in italiano del testo approvato, senza imitare persone reali. Prima verifica servizio e costo; salva il file e segnala durata e controlli realmente eseguiti.

**Recupero:** per voce non disponibile correggi il profilo; per audio non riproducibile verifica file, codec e errore. Configurazione TTS non è configurazione del microfono; allegare un audio non ne garantisce la trascrizione.

### 28.4 Dettatura locale nel compositore

**Percorso:** icona microfono accanto a Invia. Nel prodotto indipendente usa cattura audio e riconoscimento locale con runtime Whisper, modello e ffmpeg disponibili. Consenti il microfono nelle impostazioni del sistema quando richiesto, registra, poi premi Stop. Il testo provvisorio può cambiare mentre parli; la trascrizione finale usa l'intera registrazione e corregge il provvisorio. **Non invia automaticamente il messaggio.**

Limite attuale: 120 secondi per registrazione. Gli aggiornamenti sono riconoscimenti su finestre audio, non streaming nativo né latenza garantita; rumore e lingua incidono. Controlla sempre il testo prima di inviare, specialmente numeri e nomi. Se modifichi manualmente il campo o cambi compositore il risultato tardivo non deve sovrascrivere la nuova bozza.

**Recupero:** permesso negato → impostazioni microfono OS; runtime/modello assente → risolvi il prerequisito della distribuzione, non una chiave Orkas. In assenza di input fisico continua a digitare: la chat non deve dipendere dalla dettatura.

<a id="manuale-29"></a>

## 29. Aggiornamenti dell'app e note di versione

**Percorso:** controllo aggiornamenti/indicatore versione nell'interfaccia → pannello aggiornamenti. Puoi controllare disponibilità, aprire il download pubblico, scaricare quando supportato e seguire il passaggio specifico della piattaforma. Le **note di versione** e il giornale delle modifiche spiegano cosa cambia; consultarli non installa nulla.

Su macOS il flusso può scaricare e verificare l'installer, poi aprirlo per **sostituzione manuale** dell'app: non promette aggiornamento silenzioso, firma Apple o notarizzazione. Su piattaforme/modalità automatiche compatibili può comparire riavvio dopo download pronto; l'esistenza del pulsante nel codice non qualifica ogni installer o sistema. Da sorgente o su distribuzioni non supportate può esserci soltanto il percorso manuale.

1. Leggi versione e note, verifica provenienza del download.
2. Gestisci lavori attivi e conserva backup prima di sostituzioni importanti.
3. Attendi il download e i controlli d'integrità; non aprire un file con errore di checksum.
4. Segui installer/riavvio proposto e controlla versione e dati dopo l'avvio.

**Recupero:** errore controllo → verifica rete e riprova; errore download → usa il retry previsto; checksum o origine incoerenti → fermati e segnala. Un file presente nel repository non dimostra che il rilascio sia pubblico. Aggiornare l'app, aggiornare un pacchetto Store e ripristinare il manuale sono tre operazioni indipendenti.

<a id="manuale-30"></a>

## 30. Percorsi rapidi, confini e supporto

| Voglio… | Da dove partire | Risultato da controllare |
|---|---|---|
| Imparare Talia | Nuova attività → Scopri Talia → Prova il prompt | Bozza modificabile, mai inviata da sola |
| Trovare il manuale | Biblioteca globale → Manuale Talia | Testo leggibile; stato RAG separato |
| Recuperare il manuale eliminato | Store → Ripristina in Biblioteca | Copia locale reinserita, indice accodato |
| Consultare la guida informativa | Richiesta di spiegazione con `talia-guide` installata | Risposta basata sul manuale e limiti espliciti |
| Analizzare fonti | Biblioteca/progetto o allegati → richiesta con citazioni | Copertura, riferimenti e porzioni non lette |
| Lavorare su file | Cartella/workspace + richiesta con vincoli | File reali, originali conservati, verifiche |
| Coinvolgere specialisti | Squadra → Aggiungi agenti → modelli | Membership esplicita prima dell'invio |
| Seguirmi un lavoro futuro | To-do/Kanban | Task con stato, non calendario implicito |
| Eseguire secondo orario | Auto | Calendario e conversazioni delle esecuzioni |
| Collegare un servizio | Connettori → configura e connetti | Stato connesso e strumenti scoperti |
| Salvare un'app | Artefatto → salva → App | Riapertura e dati persistenti verificati |

**Confini da ricordare:** nessun accesso universale a file/account; nessuna installazione obbligatoria di specialisti o skill; nessun successo live dedotto da codice, mock o configurazione; nessuna collaborazione/hosting cloud indipendente implicita; nessun backup completo o sandbox universale promessi; nessun supporto automatico di tutti i provider e sistemi operativi. La guida spiega il prodotto, non sostituisce i gate del workflow operativo.

Per assistenza descrivi area, percorso seguito, risultato atteso/osservato, versione e messaggio essenziale depurato. Non inviare token, cookie, URL OAuth, percorsi privati o interi log. Per una revisione del manuale indica la funzione concreta e la sezione mancante: la copertura può essere verificata contro le superfici del prodotto, non soltanto contro una descrizione storica.

<a id="manuale-31"></a>

## 31. Onboarding, home e guida informativa

La home distingue partire da un obiettivo preciso ed esplorare cosa Talia può fare con il tuo contesto. Non serve collegare tutti gli account o installare tutti gli agenti per iniziare. Scegli un piccolo lavoro reversibile; la proposta di collegare servizi è facoltativa, non un prerequisito del testo in chat.

**Percorso iniziale consigliato:** configura un modello → apri il manuale dalla card → scegli una cartella di prova se servono file → prepara la squadra → inserisci e rivedi il prompt → invia. La home può mostrare riepiloghi dei lavori e dei loro esiti; apri la conversazione per leggere la prova concreta, non basarti soltanto su un'etichetta.

**Scopri Talia → Prova il prompt** inserisce un testo nella bozza senza invio. Con bozza o allegati già presenti, la scelta Sostituisci riguarda il testo e gli allegati non vengono rimossi. Se la bozza cambia durante il dialogo, il contenuto nuovo viene preservato. Annulla lascia il lavoro corrente intatto.

I pulsanti di aiuto delle sezioni Chat, Skill, Agenti, Connettori, Biblioteca, To-do, Auto e App aprono spiegazioni locali. Non avviano operazioni e non dimostrano lo stato dei servizi.

La skill informativa canonica è **`talia-guide`**: fornita di default, disponibile globalmente finché installata, consultabile quando pertinente. Non è un secondo Commander e non cambia l'autorità dei comandi. Il vecchio identificatore è gestito soltanto come alias di compatibilità; non installare una seconda guida per mantenere il vecchio nome. Il manuale leggibile, la skill di spiegazione e il pannello di aiuto locale sono tre superfici distinte.

> Spiegami le funzioni che posso usare oggi con le risorse disponibili. Parti da un esempio sicuro, indica dove si trova ciascun controllo e separa configurazione, esecuzione e verifica. Non installare o collegare nulla.

**Recupero:** se la guida è stata rimossa, ripristinala esplicitamente dalla card nello Store se desiderato; il manuale resta utilizzabile indipendentemente. Se nessuna fonte è leggibile, l'assistente deve dichiararlo e non inventare istruzioni o attestare una lettura che non ha eseguito.

<a id="manuale-32"></a>

## 32. Sviluppo, strumenti locali, processi e consegna responsabile

**Percorso:** chat/progetto con cartella selezionata → richiesta concreta a Commander o a un agente dotato degli strumenti pertinenti. Le capacità locali possono comprendere ricerca file/testo, lettura paginata, scrittura, patch, differenze, shell e processi persistenti. Non tutte le toolchain sono preinstallate e una skill non concede nuovi privilegi da sola.

1. Chiedi ricognizione di istruzioni, struttura, dipendenze e modifiche già presenti.
2. Definisci proprietà dei file quando lavorano più agenti; separa contratti API, UI e verifica.
3. Richiedi modifiche reversibili e test disponibili, con elenco dei controlli saltati o non eseguibili.
4. Per server o comandi lunghi usa il processo/sessione supportato: un comando avviato non è un server verificato. Esamina output, porta e risposta effettiva.
5. Usa Stop o il controllo di processo per interrompere quando necessario. Fermare la chat non garantisce l'annullamento di un job esterno; verifica i processi e gli effetti.
6. Ricevi file reali e riepilogo con limiti. Commit, push, merge, build distribuibili, deploy e pubblicazione non sono impliciti nella creazione del codice: autorizzali separatamente se desiderati e rispetta il workflow del progetto.

> Nella cartella selezionata correggi questo errore. Leggi prima le istruzioni del repository, preserva le modifiche locali, implementa sul ramo feature previsto e verifica con i test pertinenti. Non fare commit, push, merge, packaging o deploy.

Per autenticazione, password e conferme interattive usa la sessione protetta, non un comando contenente un segreto in chat. I permessi di shell e le dipendenze native differiscono fra sistemi; un test su macOS non dimostra esito Windows/Linux. Un test unitario interno non sostituisce il percorso normale nell'interfaccia o un servizio reale.

**Recupero:** build/test fallito → conserva il messaggio essenziale e verifica prerequisiti e snapshot dei file; non dichiarare una prova verde con un verificatore indisponibile. Se altri processi cambiano i file durante la suite, indica la finestra e ripeti i controlli invalidati sullo stato stabile, senza cancellare il lavoro altrui.
