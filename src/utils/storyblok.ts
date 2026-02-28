import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";

export type CdnLink = {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  is_folder: boolean;
  parent_id: number;
  published: boolean;
  real_path: string | null;
  position: number;
  is_startpage: boolean;
  published_at: string | null;
  updated_at: string | null;
};

const CDN_BASE = "https://api.storyblok.com";

export function useCdnLinks() {
  const { previewToken } = getPreferenceValues<{ previewToken: string }>();
  const perPage = 1000;

  return useCachedPromise(
    async (token: string) => {
      const baseUrl = `${CDN_BASE}/v2/cdn/links`;
      const baseParams: Record<string, string> = {
        token,
        per_page: String(perPage),
        page: "1",
        version: "draft",
        include_dates: "1",
      };

      const firstResponse = await fetch(`${baseUrl}?${new URLSearchParams(baseParams)}`);
      if (!firstResponse.ok) throw new Error(firstResponse.statusText);

      const total = parseInt(firstResponse.headers.get("total") ?? "0", 10);
      const totalPages = Math.ceil(total / perPage);
      const firstData = (await firstResponse.json()) as { links: Record<string, CdnLink> };

      let allLinks: CdnLink[] = Object.values(firstData.links);

      if (totalPages > 1) {
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
          const params = new URLSearchParams({ ...baseParams, page: String(page) });
          pagePromises.push(
            fetch(`${baseUrl}?${params}`).then((r) => r.json() as Promise<{ links: Record<string, CdnLink> }>),
          );
        }
        const pages = await Promise.all(pagePromises);
        for (const pageData of pages) {
          allLinks = allLinks.concat(Object.values(pageData.links));
        }
      }

      return allLinks;
    },
    [previewToken],
    {
      keepPreviousData: true,
      execute: !!previewToken,
    },
  );
}
