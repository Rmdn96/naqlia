# AI Development Guide

## Purpose

AI tools may accelerate implementation, tests, documentation, and review, but they do not replace repository contracts, engineering review, or validation. Generated code is held to the same standards as human-written code.

## Context priority

Before changing code, an AI collaborator should read, in order:

1. the [Naqlia Constitution](../.ai/constitution.md) and every applicable principle document in `.ai/`;
2. the current authorized user, issue, or requirement scope and explicit non-goals;
3. the Project Blueprint, README, applicable architecture decisions, and supporting guides;
4. the owning feature's public contract and nearby tests; and
5. configuration and environment examples relevant to the change.

If a task conflicts with the Constitution or approved product scope, the AI collaborator must stop the affected work, identify the conflict, and request or document the required amendment rather than silently choosing an implementation.

The `.ai/context` directory is reserved for stable, non-secret project context. `.ai/prompts` is reserved for reusable, reviewed task prompts. Never store customer data, credentials, production logs, or private operational details in either directory.

## Prompt contract

A useful implementation prompt states:

- the desired outcome and explicit non-goals;
- the owning feature and allowed dependency boundaries;
- acceptance criteria for Arabic RTL and English LTR;
- security, privacy, accessibility, SEO, and performance constraints;
- required tests and validation commands;
- files or systems that must not be changed.

The prompt should also identify the applicable Definition of Ready and Definition of Done evidence. A prompt is not implementation authorization when a constitutional gate is unresolved.

## Change rules

- Inspect before editing; do not invent existing contracts.
- Keep changes inside the requested scope and preserve unrelated work.
- Do not generate business features during foundation-only work.
- Do not add dependencies without explaining ownership, maintenance, and security impact.
- Do not fabricate API, database, or environment contracts.
- Never expose server secrets to client code or prompts.
- Add localized messages and bidirectional UI coverage with every relevant product change.

## Required handoff

An AI-assisted change should report what changed, why, validation performed, known risks or assumptions, and any manual follow-up. Before handoff, run `npm run validate` and `npm run build` unless the task explicitly cannot support them; disclose any skipped check.
