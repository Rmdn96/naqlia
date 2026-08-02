# AI Development Guide

## Purpose

AI tools may accelerate implementation, tests, documentation, and review, but they do not replace repository contracts, engineering review, or validation. Generated code is held to the same standards as human-written code.

## Context priority

Before changing code, an AI collaborator should read, in order:

1. the current user or issue scope;
2. this repository's README and applicable guides;
3. the owning feature's public contract and nearby tests;
4. configuration and environment examples relevant to the change.

The `.ai/context` directory is reserved for stable, non-secret project context. `.ai/prompts` is reserved for reusable, reviewed task prompts. Never store customer data, credentials, production logs, or private operational details in either directory.

## Prompt contract

A useful implementation prompt states:

- the desired outcome and explicit non-goals;
- the owning feature and allowed dependency boundaries;
- acceptance criteria for Arabic RTL and English LTR;
- security, privacy, accessibility, SEO, and performance constraints;
- required tests and validation commands;
- files or systems that must not be changed.

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
