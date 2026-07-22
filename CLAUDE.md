---
summary: Typ: Mikes eget dotterbolag (B2C språkapp)
---

# Fluentic AI — CLAUDE.md

> **Typ:** Mikes eget dotterbolag (B2C språkapp)
> **Global kontext:** `~/.claude/CLAUDE.md` + `~/ai_upscale_work/CLAUDE.md`
> **Agent-registry:** `~/ai_upscale_work/_shared-brain/registries/AGENTS_REGISTRY.md`
> **Mål/strategi/priser:** bor ENDAST i `~/ai_upscale_work/CLAUDE.md` — duplicera aldrig hit.

## Vad detta projekt är

Fluentic AI är Mikes egen språkapp för spanska, business-engelska, franska och arabiska. Fokus på talat, vardagligt språk — inte formellt skriftspråk. Igång men ej lanserad.

## Skills — alltid aktiva

| Skill | När |
|---|---|
| `karpathy-ai-upscale` | Auto — all kodning |
| `mike-aios-master` | Auto — Mikes kontext |
| `llm-council` | "council this" / produkt-beslut |
| `content-humanizer` | Allt in-app copy |
| `app-store-optimization` | iOS/Android App Store |

## Projekt-specifika regler

- **Talat > skrivet** — vardagligt, naturligt språk alltid före formellt
- Meningar ska låta som en människa säger dem högt
- Lär genom konversation — inga grammatik-block i primär-flow
- Spanska är prioriterat språk för MVP

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
