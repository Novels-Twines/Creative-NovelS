# Novels-Twines

The public-facing website for Novels-Twines. This repository contains the static website interface only. Novel metadata, episodes, and artwork are stored in the separate Content repository; backend and account services are maintained separately.

**Live website:** https://novels-twines.github.io/Creative-NovelS/

## 1. Project repositories

Keep each part of the project in its own repository:

- **Website:** [Creative-NovelS](https://github.com/Novels-Twines/Creative-NovelS) — pages, styling, JavaScript, and GitHub Pages deployment.
- **Content library:** [Novels-Twines-Content](https://github.com/Novels-Twines/Novels-Twines-Content) — novel details, episode files, catalogue, and approved artwork.
- **Backend:** [Novels-Twines-Backend](https://github.com/Novels-Twines/Novels-Twines-Backend) — API and account/publishing services.

Do not upload novel chapters into this website repository. Add stories through the Content repository so the website can load them from the shared catalogue.

## 2. Website features

- Home page with latest published stories.
- Novel catalogue with title, author, and genre search, genre filtering, and title sorting.
- Separate ColorNovels collection with a dedicated visual-story reading mode.
- Novel detail pages with published episode lists.
- Reading view with previous/next episode navigation, adjustable text size, page width, and reading theme.
- Responsive desktop and mobile navigation.
- Accessible focus indicators, labelled catalogue controls, keyboard-friendly story cards, and loading/error messages.

## 3. How the website is uploaded and published

The website is hosted using **GitHub Pages**.

1. Make website code or design changes in a feature branch in this repository.
2. Open a pull request from that branch into `main`.
3. Review and merge the approved pull request.
4. A GitHub Actions workflow at `.github/workflows/deploy-pages.yml` runs automatically when changes are pushed to `main`.
5. The workflow uploads the repository's static files and deploys them to GitHub Pages.
6. Check the repository's **Actions** tab. The deployment run should finish with a successful status.
7. Open the live website and refresh it to verify the change.

There is no separate build command in the current deployment workflow: GitHub Pages receives the static files directly from the repository. A change to the website code requires a website deployment.

## 4. How novels and episodes appear on the website

Novel content is loaded separately from:

[Novels-Twines-Content](https://github.com/Novels-Twines/Novels-Twines-Content)

The website reads:

- `catalog/index.json` to find the public novel and ColorNovel IDs.
- `novels/<novel-id>/novel.json` or `color-novels/<novel-id>/novel.json` for the story details.
- The matching `episodes/episode-001.md`, `episode-002.md`, and later episode files for chapter content.

The website currently fetches the Content repository's `main` branch when a visitor opens the site. It uses the raw GitHub content source first and a jsDelivr mirror as a fallback.

**Important publishing rules:**

- The novel must be listed in the correct catalogue array: `novels` or `colorNovels`.
- The novel's `status` in `novel.json` must be `published`.
- Each episode is checked separately. Its Markdown frontmatter must have `status: published` before it appears in the episode list or reader.
- Draft and pending episodes remain hidden, even when the novel itself is published.
- Uploading or merging a content change does not require a new website deployment because the website fetches the content dynamically. Allow the content host/CDN and browser cache to refresh.

For the complete GitHub upload instructions, metadata examples, episode format, artwork steps, review process, and publication checklist, follow the [Content repository README](https://github.com/Novels-Twines/Novels-Twines-Content/blob/main/README.md).

## 5. Add or update a novel — short workflow

1. Open the Content repository and create a feature branch from `main`.
2. Add or edit the novel metadata file under `novels/<novel-id>/novel.json`. For a ColorNovel, use `color-novels/<color-novel-id>/novel.json`.
3. Add each episode as a Markdown file in that story's `episodes/` folder. Follow the frontmatter template in the Content repository.
4. Keep new work as `draft` while writing and reviewing. Upload approved cover art to the Content repository's `assets/` folder.
5. Open a pull request into the Content repository's `main` branch.
6. After review and approval, update the novel and only the completed, approved episodes to `published`, set publication timestamps, and add the novel ID to `catalog/index.json`.
7. Merge the approved content pull request.
8. Open the live website, go to **Novels** or **ColorNovels**, and verify that the story and its published episodes appear.

Never mark an unfinished placeholder chapter as published just to make a novel appear complete. A published novel can appear in the catalogue with zero readable episodes while its episodes are still drafts.

## 6. Reader and ColorNovel content format

The reader interface is maintained separately in `assets/js/reader.js`. Readers can adjust text size, switch between narrow and wide reading widths, and choose a night reading background. Their preferences are saved in the browser on that device.

For ColorNovels, the reader supports image-only Markdown blocks in published episode files. Store artwork in the **Content repository**, then reference it from the episode Markdown using a path relative to the Content repository root:

```markdown
![A description of the illustrated page](assets/artwork/example-page-001.jpg)
```

Put a blank line before and after each image block. The reader displays each image as a full-width visual page with the supplied alt text. Keep images and story text out of the website repository. Only ColorNovels and episodes marked `published` in the public catalogue are displayed; draft ColorNovel episodes remain hidden.

See [reader and ColorNovel content guidance](docs/reader-and-color-content.md) for the authoring checklist.

## 7. Run the website locally

From this repository, start Python's built-in static server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## 8. Troubleshooting

- **Novel does not appear:** confirm its ID is in the correct array in the Content repository's `catalog/index.json`, and confirm its `novel.json` has `"status": "published"`.
- **Novel appears but has no episodes:** check that the episode files exist at the expected paths and that each episode's frontmatter contains `status: published`. Draft episodes are intentionally hidden.
- **Library unavailable:** check the public Content repository files, internet connection, browser console/network errors, and the raw GitHub/jsDelivr content responses. Use the website's Retry button after the connection is restored.
- **Website code change is missing:** check the GitHub Actions deployment workflow and confirm the latest Pages deployment succeeded. Refresh the browser after deployment.
- **Content-only change is missing:** the website does not need a rebuild for content updates; allow the raw content source/CDN to update and refresh the page.

## 9. Current integration boundaries

- Sign-in is a frontend placeholder until Supabase authentication and the backend are configured and connected.
- Creator Studio is a preview; creator applications, admin review, and publishing are not yet available as a complete end-to-end website workflow.
- ColorNovels has a separate catalogue and landing section. The reader supports published image-only Markdown blocks as illustrated pages; a richer page-by-page visual reading experience may be developed later.
- The public website displays only catalogue-listed novels with published metadata and only episodes individually marked published.

## 10. Security and publishing responsibility

- Never put service-role keys, database passwords, access tokens, or other secrets in this repository.
- Keep website code here; keep novel text and artwork in the Content repository; keep server-side implementation in the Backend repository.
- Publish only original or properly licensed text and artwork after review.
- Do not expose drafts, pending submissions, private creator information, or unfinished placeholder content as public work.
