const TITLE_REGEX = /^[a-zA-Z0-9 -]+$/;

export const TITLE_VALIDATION_ERROR =
  "Only letters, numbers, spaces, and hyphens allowed";

export function isValidTitle(title: string): boolean {
  return title.trim().length > 0 && TITLE_REGEX.test(title);
}

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
