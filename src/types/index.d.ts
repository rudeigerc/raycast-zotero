interface Preferences {
  zoteroBetterBibtexOutputFilePath: string;
}

interface Item {
  attachments: Attachment[];
  citationKey: string;
  creators: Creator[];
  date: string;
  DOI: string;
  select: string;
  publicationTitle: string;
  tags: Tag[];
  title: string;
  url: string;
  itemType: string;
}

interface Attachment {
  path: string;
}

interface Creator {
  firstName: string;
  lastName: string;
}

interface Tag {
  tag: string;
}
