# Calm Harbor

Calm Harbor is a small mental-wellness companion for everyday stress. It offers a supportive guided chat, private mood check-ins, campus activity information, quick games, video discovery, and help finding human support.

> Calm Harbor is a wellbeing tool, not medical advice, diagnosis, treatment, or emergency care. If someone may be in immediate danger, contact local emergency services or a trusted person now.

## What works in this demo

- Guided, scripted coping chat with grounding prompts and crisis-language escalation.
- Mood check-ins and chat history saved in the current browser.
- VYUHA participation contact and SR University club schedule, with unknown event details clearly marked for confirmation.
- In-app reminders checked while the app is open, with optional browser notifications after permission is granted. Delivery is not guaranteed when the app is closed, paused, or offline.
- Small interactive activities and links to discover funny or motivational videos.
- Privacy controls to clear locally saved information.

There is no account, cloud sync, external AI service, or backend in this version. The scripted chat is not an AI therapist. Content entered in the app stays in that browser unless the user clears browser storage. Do not enter sensitive information on a shared device.

## Run locally

Requirements: Node.js 20 or newer and pnpm 9 or newer.

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/calm-harbor run dev
```

The app's production bundle can be generated with:

```bash
pnpm --filter @workspace/calm-harbor run build
```

## Publish the project to GitHub

Create an empty repository on GitHub, then run these commands from the repository root, replacing the URL with your own:

```bash
git add .
git commit -m "Build Calm Harbor wellness app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Keep `pnpm-lock.yaml` in the repository for reproducible installs. Do not commit secrets or local environment files.

## Before using this with real people

The VYUHA listing was supplied as happening next week, but its exact date, time, venue, and fee were not provided; confirm that it is still upcoming and verify those details with the organizer before attending or paying. The SR University club schedule was also supplied by the app owner and has not been independently confirmed. Video links open uncurated YouTube search results. Review crisis language and contact details with qualified local mental-health professionals for each launch region. Browser-only storage and reminders are not suitable for confidential records or guaranteed notifications.
