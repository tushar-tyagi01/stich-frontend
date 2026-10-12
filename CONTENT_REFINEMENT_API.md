# Result screen content refinement API contract

`GET /api/projects/:projectId/results` returns a top-level `sections` array built from the latest DesignBrief's ordered `informationArchitecture.sections`, the matching archetype's `landingPageSections`, and the project's UserInput. Each section contains its brief-provided `name` and a `source` of either `"user"` or `"ai"`. No schema change is needed; the array is computed for the response. A section with configured `sourceFields` is `"user"` when at least one mapped value is present, otherwise `"ai"`. An always-included configured section with no `sourceFields` is grounded by the required business name.

Structured content changes are submitted separately from visual feedback using:

`POST /api/projects/:projectId/content-refinement`

The request body is:

```json
{
  "action": "provide_content | remove_sections | add_section",
  "sections": []
}
```

For `provide_content` and `add_section`, each entry is `{ "name": string, "content": string }`. For `remove_sections`, each entry is `{ "name": string }`. The backend validates the selected sections against the project's configured sections, applies the change to the existing Stitch screen, and saves a new generated-screen version. A successful response includes `htmlUrl`, `imageUrl`, `currentScreen`, and `status`. The frontend then re-fetches the existing results endpoint once to refresh the preview and section metadata. Invalid actions, sections, or empty content return HTTP 400; missing projects/screens return 404.

No schema change is required: the updated HTML and image URLs are saved in a new `GeneratedScreen` record.
