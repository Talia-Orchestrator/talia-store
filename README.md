<img src="site/assets/talia-symbol.svg" width="56" alt="">

# Talia Store

Talia is a desktop workspace for projects that take more than one conversation. You can give a research agent your source documents, ask a writer to turn its findings into a brief, and keep the open questions on the same project's task board. Commander coordinates the work. You choose the team, the models they use and the folder where they can deliver files.

**[Explore the interactive demo](https://talia-orchestrator.github.io/talia-store/)** · [Download the desktop preview](https://talia-orchestrator.github.io/talia-store/download-app/) · [Read the full manual (Italian)](site/docs/Manuale-Talia.md)

## Try a first project with your own documents

Suppose you have two versions of a product brief and someone asks, “What changed before Friday’s review?” You can try this with the **General Researcher** and **Content Writer** included on a fresh profile. The desktop app also includes Assistant, six starter skills and a copy of the manual.

1. **Set up the workspace.** Choose a provider and model in Settings. Create a project and select a working folder for the output.
2. **Add the two briefs to the project Library.** Give them names that distinguish the versions. Wait until both show *Ready* so the team can retrieve passages from them.
3. **Open a project chat.** Review the team and its models, then give Commander the question, the sources and the deliverable. For example:

   > Compare the March and April briefs in this project. Ask the researcher to identify changes to scope and deadlines, citing the document and section for each. Ask the writer to prepare a one-page review note. Put conflicting dates under “Needs a decision” and save the result as review-note.md in the project folder.

4. **Check the handoff.** Open a cited section and compare it with the claim in the note. If two deadlines conflict, give the decision an owner on the project board. The next conversation can start from the saved note and the open task.

The Library holds material for retrieval. The working folder is where you authorize file operations. Indexing runs locally when the required components are available. Retrieved passages used in an answer can reach the model provider you selected. [Library and source handling](site/docs/Manuale-Talia.md#manuale-3) · [Project folders](site/docs/Manuale-Talia.md#manuale-5)

## Build a team around the deliverable

| When you need… | A combination to try | What to ask for |
| --- | --- | --- |
| A decision brief from interviews and project notes | [Deep Researcher](agents/deepresearcher/) with [Source Synthesis](skills/source-synthesis/SKILL.md) | A findings table with a passage for each claim, disagreements between sources and questions still open. |
| A development plan someone can implement | [App Development Team](skills/app-development-team/team.json) with [Guided Plan](skills/guided-plan/SKILL.md) | Have the analyst clarify the requirement, the architect lay out the dependencies and the tester define how to check the result. Review the plan before implementation. |
| A presentation built from an approved report | [Presentation specialist](agents/pptmaker/) with the [PowerPoint skill](skills/office-ppt/SKILL.md) | Specify the audience, the decision they need to make and the requested file format. Ask for a slide outline first, then review the exported file in your presentation app. |

The app development bundle is one example you can inspect in full. Its descriptor names seven required roles covering analysis, architecture, UI design, frontend, backend, operations and end-to-end testing. Product Manager is optional. On a compatible host the installed preset becomes a local team you can adapt. [Inspect the preset](agents/app-architetto/team-preset.json)

## Bring the workflow back next week

A project can keep its instructions, documents and backlog across conversations. For a recurring briefing, put the audience and editorial requirements in the project instructions. Give each new issue a task and a review criterion, such as “every changed deadline links back to a source.” The board tracks work through *To do*, *In progress*, *In review* and *Done*.

Once the first briefing works, you can schedule a request to create the next one. Automatic backlog execution has its own setting. You can use scheduling to queue work for human review, or enable execution for eligible tasks while Talia is available. [Kanban and review](site/docs/Manuale-Talia.md#manuale-18) · [Scheduling and automation](site/docs/Manuale-Talia.md#manuale-9)

## What you can install from this repository

| Resource | What it adds to Talia | Example to inspect |
| --- | --- | --- |
| [Agents](agents/) | A specialist role you can add to a conversation and assign a model. | [Functional Analyst](agents/functional-analyst/) |
| [Skills](skills/) | A reusable procedure for a particular kind of work. Read the instructions to see what the agent will be asked to do. | [Deliverable Review](skills/deliverable-review/SKILL.md) |
| [Connectors](connectors/) | An integration definition for an external tool or service. Check its setup and host support before planning work around it. | [Excel connector](connectors/excel/) |
| [Apps](apps/) | A tool with its own interface for working with a result. | [CSV Viewer](apps/csv-viewer/) |
| [Library packages](library/) | Reference material you can keep in the workspace and consult across tasks. | [Talia manual package](library/manuale-talia/) |

Talia verifies the signed catalog and package contents, then presents the installation for review. Configure accounts and grant service access separately. You can read the package sources here before installing anything. [Store and permissions](site/docs/Manuale-Talia.md#manuale-8)

## Choosing models and tools

Start with one configured model. When a project needs a different mix, review the models in the chat draft and override individual agents for that conversation. For example, you can assign one model to the researcher and another to the writer while they work from the same brief. An agent added to an existing chat can receive its shared history, so check the selected provider before inviting it into a sensitive project.

If you already use a supported command-line assistant such as Claude Code or Codex, you can also bring it into the workflow using its local installation and account. Available tools and usage limits depend on that setup. The conversation’s usage panel shows model and agent breakdowns where the provider supplies data. [Models, providers and costs](site/docs/Manuale-Talia.md#manuale-23)

Tried Talia on a real task? [Tell us what you wanted to do and where you got stuck](https://github.com/Talia-Orchestrator/talia-store/issues/new?template=workflow-feedback.yml).

If you find a specialist or workflow you want to come back to, give the Store a ★ on GitHub.

<details>
<summary>Technical reference for contributors and release maintainers</summary>

## Distribution

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

The builder selects seventeen specialist agents explicitly and reads skills, connectors, apps, and Library packages from this repository. It emits a v3 index containing package metadata and artifact hashes, plus one v2 package artifact per entry. It also removes stale files under `artifacts/` that are no longer referenced by the new index. Review that diff before signing.

## Team bundles

`skills/app-development-team` is the signed bundle descriptor for the Team tab.
It stays a valid skill package so older Talia clients can still read the catalog.
`team.json` names the required agents and optional roles; each agent's signed
package declares its own skill dependencies. The host previews every package
and installs the required resources through the existing installer. Optional
roles are not installed by default. A failed installation can be retried; the
team becomes available only once all required agents are present. The bundle
never downloads or executes arbitrary URLs from `team.json`.

The connector catalog now includes WeCom, Feishu/Lark, and DingTalk CLI
references for Talia 0.10.0 or newer, alongside the existing MCP packages.
These references open Talia's built-in setup and do not run or authorize a CLI
during Store installation. Lark shares the Feishu package.

The Store also distributes 29 declarative listings for the selected Atlassian,
Google, Microsoft, Bitbucket, GitLab, GitHub, and Hugging Face services. These
listings contain no executable transport or credentials. Installing one adds
an unavailable card to Talia's connector catalog; direct authentication must
be implemented and verified before it can connect.

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

## Team sviluppo app

Il preset del team è incluso nel pacchetto firmato Senior IT Architect.
Installando i sette specialisti richiesti su un host compatibile, il team
viene creato automaticamente e resta modificabile. Il PM è opzionale.
Vedere [`teams/README.md`](teams/README.md) per limiti e comportamento.

## OpenRouter model metadata

`model-capabilities/openrouter-thinking.json` è uno snapshot compatto dei soli
livelli `reasoning_options` di tipo `effort` dichiarati per modelli OpenRouter
esatti da [Models.dev](https://github.com/anomalyco/models.dev/tree/dev/providers/openrouter/models).
`npm run build:catalog` prova ad aggiornarlo prima di rigenerare il catalogo
delle estensioni. Il feed originale è pubblico e non riceve chiavi o chat.
Il file è metadato di inferenza, non un pacchetto installabile; le policy locali
già verificate del client hanno precedenza. Un modello senza livelli enumerati
non ottiene una scala per analogia. `none` indica Off e non è uno step dello
slider: il generatore lo esclude senza scartare gli altri effort validi.

</details>
