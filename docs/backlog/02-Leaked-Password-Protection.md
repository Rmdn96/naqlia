# Leaked-Password Protection

Status: blocked by current Supabase plan.

Tracking issue: [GitHub #13](https://github.com/Rmdn96/naqlia/issues/13).

## Objective

Enable Supabase Auth native leaked-password protection so sign-up and password-change operations reject known compromised or easily guessed passwords.

## Current limitation

The production project is on the Supabase Free plan. The Attack Protection page displays the feature description but no enable control. Naqlk must not implement a custom password-breach service as a workaround.

## Activation criteria

- Supabase project is upgraded to a plan that exposes the native control.
- Security owner approves the production configuration change.
- Staff passwordless email authentication is smoke-tested after activation.
- Security Advisor is rerun and the setting is documented as enabled.

## Definition of done

- native leaked-password protection is enabled in production;
- authentication regression checks pass;
- the Supabase Security Advisor no longer reports the disabled-protection warning; and
- this item is closed with configuration evidence and no credentials.
