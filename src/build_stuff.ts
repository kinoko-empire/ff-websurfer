type BookmarkTreeNode = Awaited<
  ReturnType<typeof browser.bookmarks.getTree>
>[number];

type NodeContainer = {
  nodes: Array<BookmarkTreeNode>;
};

const NODE_TYPES = {
  bookmark: "bookmark",
  folder: "folder",
  separator: "separator",
};

async function retrieveRootNode() {
  return await browser.bookmarks.getTree();
}

function flattenBookmarks(
  bookmarkNode: BookmarkTreeNode,
  container: NodeContainer
) {
  // nodes of type "bookmark" are the only type that have a defined url
  // other types are "folder" and "separator". The type "folder" has the url ommitted
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNodeType
  if (bookmarkNode.type === NODE_TYPES.bookmark && bookmarkNode.url) {
    container.nodes.push(bookmarkNode);
  }

  // a node type of "bookmark" does not a defined "children" property
  // type of "folder" does have children
  // unsure of "separator" type
  if (bookmarkNode.type !== NODE_TYPES.bookmark && bookmarkNode.children) {
    for (const child of bookmarkNode.children) {
      flattenBookmarks(child, container);
    }
  }
}

async function main1() {
  const root = await retrieveRootNode();
  const bookmarkContainer: NodeContainer = {
    nodes: [],
  };

  flattenBookmarks(root[0], bookmarkContainer);

  return bookmarkContainer;
}

browser.runtime.onInstalled.addListener(() => {
  main1().then((tree) =>
    console.log("the whole tree????? TResdosShinji!!!!!", tree)
  );
});
