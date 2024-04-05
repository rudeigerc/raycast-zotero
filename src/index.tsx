import { Action, ActionPanel, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { existsSync, readFileSync } from "fs";
import { useEffect, useState } from "react";

const preferences = getPreferenceValues<Preferences>();

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

  const buffer = readFileSync(filePath);
  const data = JSON.parse(buffer.toString()).items as Item[];
  const tags = data
    .flatMap((item: Item) => item.tags.map((tag) => tag.tag))
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort((a, b) => String(a).localeCompare(String(b)));
  tags.unshift("All");

  const [showDetails, setShowDetails] = useCachedState("show-details", false);
  const [items, setItems] = useState<Item[]>([]);
  const [tag, setTag] = useState<string>("");

  const onTagChange = (newValue: string) => {
    setTag(newValue);
    if (newValue !== "All") {
      setItems(data.filter((item) => item.tags.map((tag) => tag.tag).includes(newValue)));
    }
  };

  useEffect(() => {
    setItems(data);
  }, []);

  if (items.length === 0) {
    return <EmptyView />;
  }

  return (
    <List
      isLoading={items === undefined}
      isShowingDetail={showDetails}
      searchBarPlaceholder="Search title..."
      searchBarAccessory={
        <List.Dropdown value={tag} tooltip="Tags" placeholder="Search tags..." onChange={onTagChange}>
          {tags.map((tag) => (
            <List.Dropdown.Item key={tag} title={tag} value={tag} icon={tag === "All" ? null : Icon.Tag} />
          ))}
        </List.Dropdown>
      }
    >
      {items
        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        .map((item: Item) => (
          <List.Item
            key={item.citationKey}
            icon={`zotero/treeitem/treeitem-${item.itemType}@2x.png`}
            title={item.title}
            subtitle={`${item.creators[0].lastName}${item.creators.length > 1 ? " et al." : ""}`}
            actions={
              <ActionPanel>
                <Action.Open
                  title="Open the File"
                  target={item.attachments.filter((value) => value.path?.endsWith(".pdf"))[0]?.path}
                />
                <Action.Open title="Select in Zotero" icon="zotero-icon.png" target={item.select} />
                {item.url && (
                  <Action.OpenInBrowser
                    shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                    title="Open in Browser"
                    url={item.url}
                  />
                )}
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
                markdown={item.abstractNote}
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
                      text={item.creators.map((creator) => `${creator.firstName} ${creator.lastName}`).join(", ")}
                    />
                    <List.Item.Detail.Metadata.Label title="Publication Date" text={item.date} />
                    {item.publicationTitle && (
                      <List.Item.Detail.Metadata.Label title="Publication" text={item.publicationTitle} />
                    )}
                    {item.DOI && <List.Item.Detail.Metadata.Label title="DOI" text={item.DOI} />}
                    {item.tags.length > 0 && (
                      <>
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.TagList title="Tags">
                          {item.tags.map((tag) => (
                            <List.Item.Detail.Metadata.TagList.Item key={tag.tag} text={tag.tag} icon={Icon.Tag} />
                          ))}
                        </List.Item.Detail.Metadata.TagList>
                      </>
                    )}
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
