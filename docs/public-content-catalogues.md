# Public Characters and Upcoming Story Catalogues

The website reads these optional JSON files from the separate
`Novels-Twines-Content` repository. Missing files are treated as empty
catalogues, so the main novel library continues to work.

## Character catalogue

File: `characters/index.json`

The file may be a JSON array or an object with a `characters` array.

Each public character entry must include:

- `id`: stable unique identifier.
- `name`: public character name.
- `novelId`: ID of a novel already listed in the public catalogue and marked published.
- `status`: must be `published`.
- `approvalStatus`: must be `approved`.

Optional fields:

- `role`: short character role.
- `introduction`: public profile introduction.
- `image`: path to approved artwork inside the Content repository.

The website only displays a character when both publication and approval
conditions are satisfied and its `novelId` matches a currently published novel.
Draft, pending, rejected, and unlinked character records are not displayed.

Example structure (replace placeholder values with approved content):

```json
{
  "characters": [
    {
      "id": "character-id",
      "name": "Public character name",
      "novelId": "published-novel-id",
      "role": "Character role",
      "introduction": "Approved public introduction.",
      "image": "assets/characters/character-image.jpg",
      "status": "published",
      "approvalStatus": "approved"
    }
  ]
}
```

## Upcoming stories catalogue

File: `upcoming/index.json`

The file may be a JSON array or an object with an `upcomingNovels` or
`items` array.

Each public announcement must include:

- `id`: stable unique identifier.
- `title`: public announcement title.
- `status`: must be `published`.
- `approvalStatus`: must be `approved`.

Optional fields:

- `teaser`: approved public teaser.
- `genre`: public genre label.
- `cover`: path to approved cover artwork in the Content repository.
- `expectedDate`: expected release date.
- `dateConfirmed`: set to `true` only when the expected date is confirmed.

The website never displays unapproved or unpublished announcements. A release
date is shown only when `dateConfirmed` is explicitly `true`; otherwise the
website displays that the date has not been announced.

Example structure (replace placeholder values with approved content):

```json
{
  "upcomingNovels": [
    {
      "id": "upcoming-story-id",
      "title": "Public announcement title",
      "teaser": "Approved public teaser.",
      "genre": "Genre",
      "cover": "assets/covers/upcoming-cover.jpg",
      "expectedDate": "2027-03",
      "dateConfirmed": false,
      "status": "published",
      "approvalStatus": "approved"
    }
  ]
}
```

These files belong in `Novels-Twines-Content`, not in the website repository.
Do not place drafts, private notes, pending submissions, or unpublished story
material in public catalogue files.
