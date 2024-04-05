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
  dateAdded: string;
  dateModified: string;
  abstractNote: string;
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
