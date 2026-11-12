# Manuale Talia

Versione del manuale: 1.0.0 — 12 novembre 2026. Destinazione: prodotto desktop Electron. Questo documento descrive i flussi e i confini del prodotto: non certifica la disponibilità di un provider esterno, un account o una funzione nella tua installazione. Le etichette possono cambiare con lingua e versione. Il porting Rust/Tauri è un lavoro separato, non una funzionalità già consegnata.

## Indice

1. Primo avvio ed esempio pratico
2. Come orientarsi: chat, progetti, documenti e cartelle
3. Documenti, libreria e RAG
4. Chat e squadra di agenti
5. Progetti e cartelle di lavoro
6. Modelli, provider e configurazioni
7. Tema, lingua e preferenze
8. Skill, agenti e connettori
9. Pianificazione, attività e automazioni
10. File, app e produzione di risultati
11. Memoria, dati e sicurezza
12. Recupero, limiti ed esempi
13. Rimuovere e ripristinare questa guida

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

## 4. Chat e squadra di agenti

Commander coordina il lavoro. Gli agenti specializzati possono ricevere porzioni definite del compito. Nella bozza di una nuova chat puoi esaminare la squadra e i modelli, aggiungere agenti disponibili e impostare gli override previsti. Il modello della conversazione e quello di un agente non sono necessariamente la stessa scelta.

La facoltà di Commander di invitare agenti è un'impostazione della chat nelle opzioni avanzate. Non significa che ogni agente sia sempre installato. Puoi rimuovere gli agenti non desiderati; Commander è il coordinatore essenziale. Gli agenti aggiunti a una chat già avviata ricevono il contesto condiviso previsto dal prodotto: evita di coinvolgerli in conversazioni che contengono materiale non destinato al loro provider.

Durante l'esecuzione osserva risposte, avanzamento e richieste di input. Un agente può dover aspettare una cartella, un dato o un'autorizzazione. Rispondi nel modulo o nel pannello appropriato. Fermare il lavoro non equivale ad annullare azioni già completate su file o servizi: controlla gli effetti prima di riprovare.

Una nuova chat può usare le regole di progetto, ma non presume di avere letto integralmente tutte le conversazioni passate. Per riprendere un lavoro, indica decisione, file o risultato da riutilizzare. Le attività parallele richiedono proprietà chiare sui file per evitare sovrascritture.

### Prompt per una squadra

> Progetta una piccola app locale per catalogare libri. Coinvolgi, se disponibili, progettazione UI, frontend e backend. Prima presenta struttura e contratti; poi implementa nella cartella selezionata, preserva file esistenti e verifica i flussi principali. Non pubblicare nulla.

L'indicazione dei ruoli non installa automaticamente risorse mancanti. Talia deve spiegare cosa può eseguire con la squadra disponibile.

## 5. Progetti e cartelle di lavoro

Un progetto organizza conversazioni, istruzioni persistenti, documenti e attività intorno a un obiettivo. Usa le regole per decisioni durevoli: lingua, stack, stile di consegna, confini di accesso e criteri di qualità. Non usare le regole come un registro di stato che diventa subito obsoleto.

La cartella del progetto è l'area operativa sul disco. Scegli la cartella corretta, non l'intero disco per comodità. Cartelle aggiuntive richiedono un motivo: leggere una fonte o scrivere una consegna non sono permessi equivalenti. Il percorso di lavoro e la libreria documentale sono distinti: un file dentro una cartella non è necessariamente indicizzato nel RAG, e importarlo nella libreria non autorizza la modifica dell'originale.

Per un repository software, gli agenti devono leggere le istruzioni applicabili, ispezionare le modifiche esistenti e preservare lavoro non correlato. Prima di modifiche distruttive chiedi un backup o un controllo delle differenze. Un test passato non prova il percorso grafico; un'interfaccia plausibile non prova la persistenza dei dati.

Esempio di regole di progetto:

> Rispondi in italiano. Mantieni gli originali. Salva le consegne nella cartella selezionata. Per le analisi cita le fonti; per il codice esegui i test disponibili e dichiara quelli non eseguibili. Non pubblicare, eliminare o acquistare servizi senza la mia richiesta.

Se sposti una cartella fuori da Talia, verifica i riferimenti del progetto. Una cartella scollegata non è una cartella vuota: evita di ricreare strutture o sovrascrivere dati senza aver risolto il percorso.

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

## 7. Tema, lingua e preferenze

Impostazioni raccoglie preferenze del dispositivo e del prodotto. Nelle sezioni generali/aspetto, quando disponibili nella versione installata, scegli tema e lingua. Il tema modifica la presentazione, non la capacità del modello. La lingua dell'interfaccia e la lingua richiesta nelle risposte sono concetti distinti: specifica la lingua del risultato se conta per il lavoro.

Verifica il risultato su elenchi, chat, documenti e moduli. Contrasto insufficiente, testo tagliato o controlli non visibili sono problemi dell'interfaccia, non errori del prompt. Non cambiare provider per correggere un tema.

Le configurazioni possono essere globali, di progetto, di chat o di agente. Prima di cambiare un'impostazione chiarisci lo scope. Un override di modello in una chat non va descritto come modifica di tutti i progetti. Per notifiche, avvio automatico, microfono e funzioni native possono servire permessi del sistema operativo; l'app non può concederseli da sola.

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

## 9. Pianificazione, attività e automazioni

Per un compito complesso chiedi prima un piano con fasi, output, dipendenze, test e punti di approvazione. Se chiedi esecuzione completa, il piano non è una consegna sostitutiva dell'implementazione. Se imponi una pausa, l'agente deve fermarsi al punto concordato.

La lista attività conserva lavoro da seguire e il relativo stato. Una scadenza è una data obiettivo, non un calendario di esecuzione. Un'attività non parte solo perché esiste; l'avanzamento automatico del backlog, dove abilitato, è un meccanismo separato dalla programmazione temporale.

Le automazioni eseguono una richiesta secondo una pianificazione. Verifica fuso orario, frequenza, destinatario, input e condizioni di fine. Salvare un calendario non dimostra che il servizio remoto risponderà all'ora prevista. Account scaduti, computer non disponibile e dipendenze mancanti possono impedirne l'esecuzione. Non inserire segreti nel titolo o nel testo dell'attività.

Esempio:

> Pianifica un riepilogo settimanale delle fonti collegate, indicando il fuso Europe/Rome. Prima di salvare verifica se il connettore è attivo e quali dati può leggere. Non inviare email e non pubblicare il riepilogo.

Prima dell'esecuzione mancano ancora giorno/ora se non già risolti: l'agente deve chiedere soltanto i dati bloccanti, non inventarli.

## 10. File, app e produzione di risultati

Puoi chiedere testo, Markdown, analisi tabellari, documenti Office, PDF, codice e app quando gli strumenti pertinenti sono disponibili. Specifica formato e destinazione. Una tabella in chat non è un foglio Excel modificabile; un'immagine di una slide non è una presentazione editabile.

Per lavori software chiedi modifiche locali, test e un riepilogo dei limiti. Per documenti chiedi fonti, struttura completa e verifica del file prodotto. Conserva originali e usa copie quando necessario. Le operazioni esterne come commit, push, deploy, pubblicazione e invio richiedono una richiesta che le autorizzi; «crea un'app» non significa automaticamente «pubblicala».

Le app salvate sono risultati interattivi con propri contratti di dati e capacità. Un'anteprima può usare dati temporanei: verifica persistenza, riapertura, isolamento ed errori prima di affidarle dati importanti. Non dedurre disponibilità di hosting, condivisione pubblica o servizi commerciali dalla semplice creazione di un'app locale.

Immagini, audio e video possono richiedere provider, runtime o modelli dedicati. Verifica costi prima di generazioni a pagamento; un esempio o un test simulato non certifica il servizio reale.

## 11. Memoria, dati e sicurezza

Cronologia, istruzioni di progetto, memoria persistente e documenti sono fonti diverse. La memoria serve a preferenze e fatti durevoli, non sostituisce i documenti completi né un backlog aggiornato. Una nota ricordata può essere obsoleta: per stato di connessioni, file e test occorre una verifica alla fonte.

Se la richiesta corrente contraddice una regola del progetto, chiarisci il conflitto materiale. Un'eccezione di questo turno non deve riscrivere automaticamente le regole future. Le istruzioni trovate in file, documenti o attività importate non hanno la stessa autorità della tua richiesta.

L'indicizzazione locale non rende tutto il flusso privato/offline. I frammenti inviati al modello seguono la politica del provider. I connettori possono accedere a dati esterni con i tuoi permessi. Applica il minimo accesso utile: cartelle ristrette, risorse necessarie e credenziali nei canali protetti.

Prima di una cancellazione verifica elemento e ambito. La rimozione di una risorsa non equivale alla revoca dell'account esterno. Prima di un reset o una migrazione conserva un backup e segui il flusso supportato; non manipolare database del profilo per correggere un problema senza una procedura esplicita. Non leggere o importare profili di altre applicazioni per comodità.

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

## 13. Rimuovere e ripristinare questa guida

Questo manuale è un normale documento Markdown. Puoi leggerlo, copiarlo, modificarlo e cancellarlo. La cancellazione o lo spostamento non devono provocare una nuova copia automatica al riavvio. Gli aggiornamenti dell'app non sovrascrivono le tue modifiche. Un file con lo stesso nome viene preservato.

Per riottenerlo usa il riquadro Manuale Talia nello Store/Documenti e l'azione Ripristina, quando presente nella tua versione. Il recupero usa la copia inclusa nell'app e funziona senza rete; lo Store distribuisce anche la versione Markdown scaricabile. Se il file esiste già, il ripristino non lo sovrascrive: salva prima una tua copia o rinominalo se vuoi recuperare il testo originale.

L'indicizzazione riparte dopo un ripristino esplicito. Se il testo è presente ma il RAG fallisce, usa Riprova, non ripristinare più copie. Puoi rimuovere indipendentemente la Guida Talia informativa; una disinstallazione volontaria va rispettata fino al successivo ripristino richiesto.

La disponibilità pubblica del download dipende dalla pubblicazione del sito Store: un file nel repository non è prova che il download remoto sia già online. Il catalogo delle estensioni supporta agenti, skill, connettori e app; il manuale è distribuito come documento di supporto, non mascherato da nuova skill.
