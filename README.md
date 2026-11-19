# Novels-Twines

The public-facing website for Novels-Twines. This repository contains the static frontend only; the content library and backend are maintained separately.

## Website experience

- Home page with a featured introduction and latest published stories.
- Novel catalogue with title, author, and genre search, genre filtering, and title sorting.
- Separate ColorNovels collection.
- Novel detail pages with approved episode lists.
- Reading view with previous/next episode navigation.
- Responsive navigation for desktop and mobile.
- Accessible focus indicators, labelled catalogue controls, keyboard-friendly story cards, and live loading/error states.
- Clear empty-library messages when no approved stories are available.

## Related repositories

- [Content library](https://github.com/Novels-Twines/Novels-Twines-Content) — novel metadata, episode Markdown, schemas, and approved artwork.
- [Backend API](https://github.com/Novels-Twines/Novels-Twines-Backend) — API and account/publishing services.

## Run locally

Use Node.js or Python's built-in static server. From this directory, run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Content loading

The site reads `catalog/index.json` from the public Content repository and loads only records marked `published`. Episodes must also be marked `published`. Draft and pending records should never be added to the public catalogue.

If the catalogue is empty, the site shows an explanatory empty state. It does not invent demo stories or treat placeholder chapters as finished content.

## Current limitations

- Sign-in is a clearly labelled frontend placeholder until the selected authentication service and backend integration are configured.
- Creator Studio is a preview; creator applications, admin review, and publishing are not live yet.
- ColorNovels has a separate catalogue and landing section, but full colour-page artwork and a visual-page reader still need to be built.
- The content repository currently contains draft starter records, not complete public chapters.

## Safety and maintenance

- Do not put service-role keys, database passwords, access tokens, or other secrets in this repository.
- Keep website code here; do not copy novel text or backend implementation into this repository.
- Publish only original or properly licensed text and artwork after review.
