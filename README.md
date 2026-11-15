# Talia Store

Public, anonymous HTTPS distribution for signed Talia resources. This repository is the source of truth for selected packages under `agents/`, `skills/`, `connectors/`, `apps/`, and `library/`. The signed v3 index and v2 artifacts are generated from these local directories. Talia desktop bundles Assistant, General Researcher, ContentWriter, six starter skills, and the complete manual for offline first use; the Store supplies all optional packages and updates.

## Anonymous desktop source

The configured anonymous source URL is:

`https://raw.githubusercontent.com/Talia-Orchestrator/talia-store/main/catalog.signature.json`

Unauthenticated downloads require the repository and its `main` branch contents to be public. Relative artifact URLs resolve under the same `main/` origin. Talia verifies the signed index and the selected artifact bytes; package installation still requires explicit review and approval. No GitHub account, token, or sign-in is required by clients. The URL is configured in the Talia desktop source; this workspace checkout does not publish it or prove that the remote URL is live. Publication requires pushing the reviewed files to the public repository.

`public-key.txt` contains the verification key shipped by Talia desktop. The corresponding private key is never stored here or in the other resource repositories. `catalog.signature.json` is generated separately from `catalog.json` after catalog QA.

## Build

From this repository, run:

```sh
node scripts/build-catalog.cjs
```

This writes `catalog.json` and the referenced `artifacts/` files. Sign the exact catalog bytes with the release signing process; do not put a private key in this repository or CI logs.

The builder selects fifteen specialist agents explicitly and reads skills, connectors, apps, and Library packages from this repository. It emits a v3 index containing package metadata and artifact hashes, plus one v2 package artifact per entry. It also removes stale files under `artifacts/` that are no longer referenced by the new index. Review that diff before signing.

The connector catalog now includes WeCom, Feishu/Lark, and DingTalk CLI
references for Talia 0.10.0 or newer, alongside the existing MCP packages.
These references open Talia's built-in setup and do not run or authorize a CLI
during Store installation. Lark shares the Feishu package.

Run `npm test` to compare the committed catalog and artifacts with the selected sources, verify artifact digests and sizes, scan package text for personal paths and credentials, and validate the detached signature with the public key. This check does not regenerate or sign files. After rebuilding, the committed signature no longer represents the new catalog until the release owner signs the reviewed `catalog.json`; do not publish a mismatched index/signature pair.

Il procedimento completo per aggiornare catalogo, release dell'app e pagina download è in [`docs/store-update-runbook.md`](docs/store-update-runbook.md).

## Pagina download

La pagina pubblica usa il contenuto di `site/` e gli eseguibili delle Releases. `npm run build:download-site` genera l’indice dai manifest verificati delle versioni pubblicate.

Il workflow `pages.yml` pubblica uno snapshot nel branch generato `gh-pages`, con commit lineari e controllo contro esecuzioni obsolete. Richiede poi esplicitamente un build GitHub Pages. La configurazione Pages del repository deve usare il branch `gh-pages`, percorso `/`. I contributi alla pagina modificano `site/`, il builder e i test sul branch principale.

Il job usa il token standard del repository con permessi Contents e Pages in scrittura. Il client legge solo file statici pubblici. I cataloghi firmati delle risorse mantengono il proprio percorso di distribuzione.

### Release locali manuali sul sito download

L'indice `site/releases.json` è generato da `scripts/build-download-site.cjs`
leggendo l'asset pubblico `release-manifest.json`, non dalla sola presenza di
DMG/ZIP nella release. Il frontend `site/app.js` mostra disponibilità e checksum
per ogni piattaforma; non modifica i feed di aggiornamento.

Per l'eccezione locale autorizzata macOS Apple Silicon, il manifesto schema 1
usa `buildSource: "local"`, `channel: "main"`, versione SemVer semplice e tag
`v<version>`, commit sorgente e data pubblicazione. Sono ammessi solo file
`darwin-arm64` con `automaticUpdate: false`; `runNumber` e `runAttempt` sono
vietati per non inventare una provenienza CI. URL, dimensioni e presenza degli
asset sono controllati come per le release CI. I checksum devono corrispondere
agli artifact verificati e al file SHA256SUMS allegato. Gli altri formati CI
restano invariati. Questo metadato pubblico non espone il core privato.

Il 10 novembre 2026 la 0.8.1 era assente dal sito perché mancava il manifesto;
il deploy Pages era riuscito ma l'indicizzatore la saltava. Regressioni coperte
in `tests/download-site.test.cjs`: inclusione locale, assenza dati CI fittizi,
rifiuto di piattaforme aggiuntive, updater, tag errati e asset mancanti.
Si tratta solo di metadati/renderer statici sostituibili, senza IPC Electron,
provider, credenziali o dipendenze dal futuro backend Rust.

## Recupero guided-plan e manuale — 14 novembre 2026

L'aggiornamento coordinato con `talia-skills` aggiunge guided-plan 0.1.0: il
catalogo passa a 62 risorse (27 skill), senza cambiare le 61 voci precedenti.
La skill raccoglie requisiti, presenta il piano ed esegue solo dopo conferma;
il testo SKILL coincide con il seed già nel core. La firma usa la chiave
Ed25519 esistente: nessuna rotazione della trust root.

Il manuale scaricabile è allineato byte per byte al documento canonico core
1.1.0, incluse le correzioni Providers già su main core. Non si tratta di una nuova versione dell'app né di una build. Le correzioni
Windows dei vecchi commit non vengono importate in questa PR documentale.
Per setup, aggiornamento del catalogo e pubblicazione del sito vedere
[il runbook](docs/store-update-runbook.md). Per rollback preparare una PR che
rimuova solo il nuovo pacchetto e rigeneri e firmi il catalogo con la stessa
chiave, senza ripristinare vecchi feed o installer. Il manuale può essere
ripristinato separatamente tramite PR; nessuna chiave o credenziale è in Git.
