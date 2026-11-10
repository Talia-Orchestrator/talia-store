# Talia Store

Public, anonymous HTTPS distribution for signed Talia resources. The store contains only the v3 index, one v2 JSON artifact per selected package, and the public verification key. Its agent catalog contains exactly ten canonical specialists. Two general-purpose agents are bundled for fresh-profile seeding by Talia desktop and do not appear in the public catalog. Legacy specialist packages remain in their source repository and are intentionally absent from the official catalog.

## Anonymous desktop source

The configured anonymous source URL is:

`https://raw.githubusercontent.com/Talia-Orchestrator/talia-store/main/catalog.signature.json`

Unauthenticated downloads require the repository and its `main` branch contents to be public. Relative artifact URLs resolve under the same `main/` origin. Talia verifies the signed index and the selected artifact bytes; package installation still requires explicit review and approval. No GitHub account, token, or sign-in is required by clients. The URL is configured in the Talia desktop source; this workspace checkout does not publish it or prove that the remote URL is live. Publication requires pushing the reviewed files to the public repository.

`public-key.txt` contains the verification key shipped by Talia desktop. The corresponding private key is never stored here or in the other resource repositories. `catalog.signature.json` is generated separately from `catalog.json` after catalog QA.

## Build

From the shared workspace after checking out `talia-agents`, `talia-skills`, `talia-connectors`, and `talia-apps` as siblings of `talia-store`, run:

```sh
node scripts/build-catalog.cjs
```

This writes `catalog.json` and the referenced `artifacts/` files. Sign the exact catalog bytes with the release signing process; do not put a private key in this repository or CI logs.

The builder selects the ten canonical specialist agents explicitly and selects the current skills, connectors, and apps from their source repositories. It emits a v3 index containing package metadata and artifact hashes, plus one v2 package artifact per entry. It also removes stale files under `artifacts/` that are no longer referenced by the new index. Review that diff before signing. If the source repositories are not siblings, set `TALIA_SOURCE_ROOT` to the directory containing them.

Run `npm test` to compare the committed catalog and artifacts with the selected sources, verify artifact digests and sizes, scan package text for personal paths and credentials, and validate the detached signature with the public key. This check does not regenerate or sign files. After rebuilding, the committed signature no longer represents the new catalog until the release owner signs the reviewed `catalog.json`; do not publish a mismatched index/signature pair.

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
