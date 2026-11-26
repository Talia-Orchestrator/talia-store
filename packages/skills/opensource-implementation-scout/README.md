# opensource-implementation-scout

Shared Talia skill package. The instruction entrypoint is SKILL.md; the package
contains declarative text, one reference document and one deterministic script.

The default mode is anonymous: no login, no token and no SSH key. The script
queries two public services only, the Sourcegraph public code search and the
public GitHub API for repositories and licenses. A GitHub token is optional and
is read from the command argument only; it is never stored in the package.

See LICENSE and NOTICE for license and provenance.
