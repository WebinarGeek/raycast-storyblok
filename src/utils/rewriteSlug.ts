const locales = ["default", "nl", "de", "es", "fr"] as const;

// keep these middle parts if the exist on the slug
const safeMiddleParts = ["category", "categorie", "kategorie", "tags", "platform"];
// remove these parts of the slug if they appear
const removeList = ["", "misc", "main-pages", "random-pages", "default"];

/**
 * Converts Storyblok slug based on folder structure to one used by the site
 * Removes parts of the slug on the remove list eg /main-pages/about => /about
 * Removes the middle parts of the slug unless they are on the safe list
 * eg /learn/marketing/blog-slug => /learn/blog-slug
 * @param slug slug to convert
 * @returns Converted slug
 */
export const rewriteSlug = (slug?: string): string => {
  if (!slug) return "";
  // split the slug and remove slug parts on the remove list
  const parts = slug.split("/").filter((x) => !removeList.includes(x));
  // Create a flag indicating if the start of the slug is a locale string
  const isTranslated = parts[0] && (locales as readonly string[]).includes(parts[0]);

  // Handle default language (remove locale prefix if it's "default")
  if (isTranslated && parts[0] === "default") parts.shift();

  // Remove middle part of slug if long and not on safe list
  if ((parts.length === 3 && !isTranslated) || (parts.length === 4 && isTranslated)) {
    const middlePart = isTranslated ? parts[2] : parts[1];
    if (!safeMiddleParts.includes(middlePart)) parts.splice(isTranslated ? 2 : 1, 1);
  }
  // join parts back together
  return `/${parts.join("/")}`;
};
