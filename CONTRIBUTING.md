# Contributing

The store is a generated distribution. Change source packages in the relevant `talia-agents`, `talia-skills`, `talia-connectors`, or `talia-apps` repository, then regenerate `catalog.json` and `artifacts/` with `npm run build:catalog`. Review the complete generated diff, especially artifact deletion, before signing. The build does not create or update `catalog.signature.json`.

Keep every package declarative. Do not add secrets, private account data, absolute machine paths, install-time commands, or generated binaries. ArtCraft and other referenced software retain their own licenses and must be installed separately. Every published package artifact must include its `LICENSE` and `NOTICE` files.

Run `npm test` after rebuilding. It validates selected source contents and the detached signature but never regenerates artifacts or signs the catalog. The detached signature is produced by the release owner after validation; never commit or upload the private signing key. Do not publish a new index with an old signature or artifacts.
