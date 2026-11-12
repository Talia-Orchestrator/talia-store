# Runbook — aggiornare Talia Store

Questo documento distingue tre oggetti che hanno controlli diversi:

| Oggetto | Dove si pubblica | Firma richiesta |
| --- | --- | --- |
| Pacchetti dell'app Talia | GitHub Release e pagina download | Firma del bundle secondo la procedura della piattaforma; su macOS le release locali attuali sono ad-hoc e non notarizzate |
| Catalogo di agenti, skill, connettori e app | `catalog.json`, `artifacts/`, `catalog.signature.json` su `main` | Ed25519 con la chiave privata del maintainer già associata a `public-key.txt` |
| Sito, manuale e changelog | `site/` e branch Pages generato | Nessuna firma Ed25519 del catalogo se `catalog.json` non cambia |

## 1. Identificare il delta

Prima di intervenire, controllare `git status`, `git diff`, branch, tag e
contenuti già pubblicati. Usare soltanto i sorgenti pubblicati su `main` nei
quattro repository `talia-agents`, `talia-skills`, `talia-connectors` e
`talia-apps`. Non incorporare file locali non committati o pacchetti ancora in
bozza. Conservare i lavori altrui.

Se cambia solo il sito o una GitHub Release, il catalogo già firmato rimane
valido: non ricostruire `catalog.json` e non rigenerare `catalog.signature.json`.

## 2. Aggiornare il catalogo delle risorse, quando necessario

1. Integrare e verificare prima i pacchetti nei rispettivi repository sorgente.
2. Preparare checkout puliti e aggiornati dei quattro `main` come directory
   sorelle. Impostare `TALIA_SOURCE_ROOT` se sono in una directory diversa da
   quella di `talia-store`. Tenere separati gli indici e i lavori locali.
3. Da `talia-store`, eseguire `npm run build:catalog`. Esaminare il diff completo
   di `catalog.json` e `artifacts/`: ID, versioni, licenze, hash, dimensioni,
   eventuali rimozioni e modifiche inattese. Non firmare un catalogo inatteso.
4. Eseguire `npm run validate` usando gli stessi sorgenti puliti. La verifica
   della vecchia firma può fallire finché il catalogo nuovo non è firmato.
5. Recuperare il percorso della chiave privata dal promemoria locale
   `talia-doc-privati/README.md`. Non mostrare il file, incollarlo in chat,
   committarlo, caricarlo in CI o passarlo come testo nell'argomento di un
   comando. Il Portachiavi macOS contiene una copia di recupero.
6. Verificare che la chiave pubblica derivata dalla privata coincida con
   `public-key.txt` e con la chiave incorporata in Talia. In caso contrario
   fermarsi: una nuova coppia richiederebbe una rotazione coordinata dell'app.
   Il confronto può essere fatto senza stampare la chiave:

   ```sh
   node -e 'const fs=require("fs"),c=require("crypto");const a=c.createPublicKey(c.createPrivateKey(fs.readFileSync(process.env.TALIA_STORE_SIGNING_KEY_FILE))).export({type:"spki",format:"der"});const b=c.createPublicKey(fs.readFileSync("public-key.txt")).export({type:"spki",format:"der"});if(!a.equals(b))process.exit(1);console.log("Chiave pubblica corrispondente")'
   ```
7. Firmare i byte definitivi del catalogo, senza modificarli dopo la firma:

   ```sh
   node tools/talia-catalog-pack.cjs sign \
     --catalog catalog.json \
     --key "$TALIA_STORE_SIGNING_KEY_FILE" \
     --out catalog.signature.json
   npm test
   ```

8. Eseguire `git diff --check`, revisionare i file generati e proporre una PR.
   La CI della PR non riceve la chiave privata: verifica la firma già presente.
   Integrare solo dopo CI verde. Su `main`, verificare che l'envelope remoto
   contenga esattamente `catalog.json`, che la firma passi con `public-key.txt`
   e che ogni artifact nuovo sia accessibile anonimamente con hash e dimensioni
   corrispondenti. Verificare poi nell'app il percorso Store → anteprima →
   installazione, distinguendo installazione da avvio del servizio esterno.

## 3. Pubblicare una nuova versione dell'app sul sito

1. Seguire il runbook di packaging del core e registrare commit/tag sorgente,
   piattaforme realmente compilate, tipo di firma, test, dimensioni e SHA-256.
   Non chiamare una firma ad-hoc «Developer ID» o «notarizzazione».
2. Preparare la GitHub Release in bozza. Caricare gli installer verificati,
   `release-manifest.json` e `SHA256SUMS.txt`; confrontare **i file caricati**
   con i digest e le dimensioni locali. Il manifesto deve puntare ai nomi esatti
   degli asset e non inventare build o piattaforme.
3. Aggiornare `site/`, manuale e changelog solo con informazioni già verificate.
   Eseguire i test del sito e del catalogo firmato, con sorgenti puliti:

   ```sh
   node --test tests/download-site.test.cjs tests/deploy-pages-branch.test.cjs tests/manual-download.test.cjs
   npm test
   ```
4. Pubblicare la Release solo dopo la presenza di tutti gli asset verificati.
   Integrare il commit del sito su `main`; il workflow Pages rigenera l'indice.
   Controllare il workflow e la pagina pubblica: versione, link, checksum,
   manuale e note. Gli installer precedenti non vanno rimossi.

## 4. Se una verifica fallisce

Non pubblicare coppie indice/firma discordanti, installer con hash diverso dal
manifesto o una pagina che dichiara disponibile una release ancora in bozza.
Identificare l'esatto file o checkout divergente. Se la chiave privata primaria
non è disponibile, usare la copia nel Portachiavi secondo il promemoria locale;
non generare una nuova chiave per aggirare il gate.
