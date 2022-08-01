import { Action, ActionPanel, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { existsSync, readFileSync } from "fs";
import { useEffect, useState } from "react";

const preferences: Preferences = getPreferenceValues<Preferences>();

const EmptyView = () => {
  return (
    <List>
      <List.EmptyView icon="zotero-icon.png" title="Raycast Extension for Zotero" />
    </List>
  );
};

const Command = () => {
  const filePath = preferences.zoteroBetterBibtexOutputFilePath;
  if (!existsSync(filePath)) {
    showToast({
      style: Toast.Style.Failure,
      title: "Failed to open the file",
      message: `File not found: ${filePath}`,
    });
    return <EmptyView />;
  }

  const data = readFileSync(filePath);

  const [showDetails, setShowDetails] = useCachedState("show-details", false);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    setItems(JSON.parse(data.toString()).items);
  }, []);

  return items.length === 0 ? (
    <EmptyView />
  ) : (
    <List isLoading={items === undefined} isShowingDetail={showDetails}>
      {items.map((item: Item) => (
        <List.Item
          key={item.citationKey}
          icon={`zotero/treeitem/treeitem-${item.itemType}@2x.png`}
          title={item.title}
          subtitle={`${item.creators[0].lastName}${item.creators.length > 1 ? " et al." : ""}`}
          actions={
            <ActionPanel>
              <Action.Open title="Open the File" target={item.attachments[0].path} />
              <Action.Open title="Select in Zotero" icon="zotero-icon.png" target={item.select} />
              <Action.OpenInBrowser title="Open in Browser" url={item.url} />
              <Action
                icon={Icon.AppWindowSidebarRight}
                shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                title={showDetails ? "Hide Details" : "Show Details"}
                onAction={() => setShowDetails((value) => !value)}
              />
            </ActionPanel>
          }
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Type"
                    icon={`zotero/treeitem/treeitem-${item.itemType}@2x.png`}
                    text={item.itemType}
                  />
                  <List.Item.Detail.Metadata.Label title="Title" text={item.title} />
                  <List.Item.Detail.Metadata.Label
                    title="Author(s)"
                    text={item.creators
                      .map((creator) => `${creator.firstName} ${creator.lastName}`)
                      .reduce((prev, cur) => `${prev}, ${cur}`)}
                  />
                  <List.Item.Detail.Metadata.Label title="Publication Date" text={item.date} />
                  {item.publicationTitle && (
                    <List.Item.Detail.Metadata.Label title="Publication" text={item.publicationTitle} />
                  )}
                  {item.DOI && <List.Item.Detail.Metadata.Label title="DOI" text={item.DOI} />}
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Tags" />
                  {item.tags.map((tag) => (
                    <List.Item.Detail.Metadata.Label key={tag.tag} title={tag.tag} />
                  ))}
                </List.Item.Detail.Metadata>
              }
            />
          }
        />
      ))}
    </List>
  );
};

export default Command;
