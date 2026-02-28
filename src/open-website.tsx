import { Action, ActionPanel, getPreferenceValues, Icon, Keyboard, List } from "@raycast/api";
import { CdnLink, rewriteSlug, useCdnLinks } from "./utils/storyblok";

const preferences = getPreferenceValues<{
  spaceId: string;
  productionUrl: string;
  developmentUrl: string;
}>();

export default function Command() {
  const { data: links, isLoading, revalidate } = useCdnLinks();

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search pages...">
      {links?.map((link) => (
        <LinkItem key={link.id} link={link} revalidate={revalidate} />
      ))}
    </List>
  );
}

function LinkItem({ link, revalidate }: { link: CdnLink; revalidate: () => void }) {
  const rewrittenSlug = rewriteSlug(link.slug);
  const productionUrl = `${preferences.productionUrl.replace(/\/$/, "")}/${rewrittenSlug}`;
  const developmentUrl = `${preferences.developmentUrl.replace(/\/$/, "")}/${rewrittenSlug}`;
  const storyblokUrl = `https://app.storyblok.com/#!/me/spaces/${preferences.spaceId}/stories/0/0/${link.id}`;

  return (
    <List.Item
      title={link.name}
      subtitle={link.slug}
      icon={link.is_folder ? Icon.Folder : Icon.Document}
      accessories={[{ tag: link.published ? "published" : "draft" }]}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="Open in Production"
            url={productionUrl}
            shortcut={{ modifiers: ["cmd", "shift"], key: "p" } as Keyboard.Shortcut}
          />
          <Action.OpenInBrowser
            title="Open in Development"
            url={developmentUrl}
            shortcut={{ modifiers: ["cmd", "shift"], key: "d" } as Keyboard.Shortcut}
          />
          <Action.OpenInBrowser
            title="Open in Storyblok"
            url={storyblokUrl}
            shortcut={{ modifiers: ["cmd", "shift"], key: "s" } as Keyboard.Shortcut}
          />
          <Action
            title="Reload Links"
            icon={Icon.ArrowClockwise}
            onAction={revalidate}
            shortcut={{ modifiers: ["cmd", "shift"], key: "r" } as Keyboard.Shortcut}
          />
          <Action.CopyToClipboard title="Copy Slug" content={link.slug} />
        </ActionPanel>
      }
    />
  );
}
