# Novels-Twines

A responsive static website frontend for the Novels-Twines reading platform.

## Pages and features
- Home page with featured stories and latest updates
- Novels catalogue with title/author search, genre filtering, and sorting
- Separate ColorNovels collection
- Novel details and episode list
- Sample reading view with previous/next navigation
- Creator Studio preview
- Responsive mobile navigation

## Run locally
Open `index.html` in a modern browser, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Development notes
- The displayed titles and episode text are demonstration placeholders.
- Sign-in and Creator Studio are frontend previews; authentication and publishing will be connected to the separate backend.
- This repository contains the website frontend only. Novel and episode content will be managed separately.
- No API keys, credentials, or backend secrets belong in this repository.
