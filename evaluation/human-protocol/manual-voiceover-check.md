# Manual VoiceOver check (prepared — not yet run)

**Context:** Guidepup/VoiceOver automation does not function on macOS 27, so no automated or manual screen-reader test has been performed for this repo. No text in this repository claims screen-reader testing. This script exists so a human can perform the check — and until someone does, the repo's accessibility statement lists this as a disclosed limitation.

**Setup:** macOS with VoiceOver (Cmd+F5 to toggle). Safari or Chrome. Use the demo at `/demo/index.html` and the transcripts page at `/transcripts/index.html`.

## What "pass" means

Each step lists what VoiceOver should speak. If what you hear differs meaningfully (missing announcement, wrong order, unlabeled control), record it as a finding with the step number.

## Demo page (`/demo/index.html`)

| # | Action | Expected spoken output |
|---|---|---|
| 1 | Open the page | Page title: "Live demo — Socratic AI Tutor" |
| 2 | VO+U (rotor to links), activate "Skip to main content" | Focus moves into main content |
| 3 | Navigate to the key section heading | "1. Connect a model, heading level 2" |
| 4 | Move to the base URL field | "API base URL…, edit text" (label read, not a bare field) |
| 5 | Move to the API key field | "API key — kept in memory only; never stored or logged, secure edit text" (password field announced as secure) |
| 6 | Tab to Connect | "Connect, button"; Tab again: "Clear key, button, dimmed" |
| 7 | Fill fields (VO+Space to interact) and press Connect | Status line spoken: "Connected to … The key is in memory only…" |
| 8 | Move to the chat log | "Conversation with the tutor, log" — the log is announced as a log region |
| 9 | Type into the message box and press Enter | Your message is announced after sending: "You: …" with the label "You:" spoken |
| 10 | While the tutor is "typing" | "Tutor is typing…" (status region) |
| 11 | When the tutor replies (or an error appears) | New message announced without moving focus: "Tutor: …" or "Connection problem: …" |
| 12 | Press Shift+Enter in the input | No message sent; a newline is inserted |
| 13 | Tab through the chat controls | "Send, button"; "Start over, button" — all reachable, none skipped |
| 14 | Press Start over | Log empties; focus usable in the input |
| 15 | Press Clear key | "Key cleared from memory…" spoken; chat controls announce as dimmed |
| 16 | Check math in any message | Spoken as plain text, e.g. "3 x plus 5 equals 20" — no unannounced symbols |

## Transcripts page (`/transcripts/index.html`)

| # | Action | Expected spoken output |
|---|---|---|
| 1 | Open the page | Title: "Example transcripts — Socratic AI Tutor" |
| 2 | Rotor through headings | H1 "Example transcripts", then "What will appear here", "Why transcripts…", "Where the raw material lives" — logical order |
| 3 | Read the notice | "Example transcripts coming soon — pending real evaluation runs" spoken in full |

## After the check

- Record results (pass/finding per step, with what was actually heard) in a dated note; link it from `evaluation/METHODS.md` section 9 and update the README accessibility section.
- Label any results "Manual VoiceOver check (real screen reader, one user)" — a single manual pass is not a comprehensive assistive-technology audit, and that limit should be stated.
