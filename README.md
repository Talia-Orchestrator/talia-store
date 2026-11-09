# Talia Store

Public, anonymous HTTPS distribution for signed Talia resources. The store contains only the v3 index, one v2 JSON artifact per selected package, and the public verification key. Its agent catalog contains exactly ten canonical specialists. Two general-purpose agents are bundled for fresh-profile seeding by Talia desktop and do not appear in the public catalog. Legacy specialist packages remain in their source repository and are intentionally absent from the official catalog.

## Anonymous desktop source

The configured anonymous source URL is:

`https://raw.githubusercontent.com/Talia-orchestator/talia-store/main/catalog.signature.json`

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
