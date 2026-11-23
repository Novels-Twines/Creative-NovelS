# Reader and ColorNovel content guidance

This guide explains how to add content that the Novels-Twines website can display without changing the website code.

## Keep the repositories separate

- **Website repository:** page layout, CSS, JavaScript, and reader controls.
- **Content repository:** novel metadata, episode Markdown, cover artwork, and illustrated pages.
- **Backend repository:** authentication, creator applications, and server-side publishing features.

Do not upload story text or artwork into the website repository.

## Add a ColorNovel

1. Create or update the ColorNovel metadata at `color-novels/<novel-id>/novel.json`.
2. Add the ColorNovel ID to the `colorNovels` array in `catalog/index.json`.
3. Keep the novel's status as `draft` while it is being prepared.
4. Add episode Markdown files under `color-novels/<novel-id>/episodes/`.
5. Store the illustrated page images in the Content repository, for example under `assets/artwork/<novel-id>/`.
6. Submit the content for review. Publish only after the artwork and episode are ready and approved.

The website only lists a ColorNovel when it is in the public catalogue and its metadata has `"status": "published"`. An episode appears only when its Markdown frontmatter has `status: published`.

## Add illustrated pages to an episode

Use a normal Markdown image block. The image path is relative to the Content repository root.

```markdown
---
id: example-color-episode-001
novelId: example-color-novel
title: The First Scene
order: 1
status: published
publishedAt: "2026-11-23T00:00:00Z"
---

# The First Scene

![The opening illustrated page](assets/artwork/example-color-novel/page-001.jpg)

![The next illustrated page](assets/artwork/example-color-novel/page-002.jpg)
```

Authoring notes:

- Put a blank line before and after each image block.
- Use meaningful alt text inside the square brackets.
- Use paths inside the Content repository; do not use local computer paths.
- Keep each page image as a separate Markdown image block.
- Normal text, headings, quotes, and simple lists can appear between illustrated pages.
- Use only artwork that is original or properly licensed.

The website renders these image blocks as individual visual pages in the ColorNovels reader. It does not generate artwork or publish draft content for you.

## Reader controls

The reading toolbar provides:

- **A− / A+:** decrease or increase text size.
- **Wide page:** switch between the standard and wider reading column.
- **Night reading:** use a darker reading surface.
- **Reset:** restore the default reading preferences.

Reader preferences are saved in the visitor's browser. They do not change the story files or affect other readers.

## Before publishing

- [ ] The novel ID is in the `colorNovels` catalogue array.
- [ ] Novel metadata is reviewed and marked `published`.
- [ ] Every episode intended for readers is reviewed and marked `published`.
- [ ] Every artwork path exists in the Content repository.
- [ ] Every image has meaningful alt text.
- [ ] Artwork is original or properly licensed.
- [ ] No drafts, private notes, or pending material are included in the public catalogue.
