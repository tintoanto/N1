
// The "Anchor" is the element we place in the actual contenteditable
// component to keep track of where we should overlay the main
// component.
export const ANCHOR_CLASS = "n1-overlaid-component-anchor-container";

export const IMG_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// Need to give it 1px transparent src to prevent a border that
// ignores all CSS attempts to clear it!
export function buildAnchorTag(id) {
  return `<img class="${ANCHOR_CLASS}" data-overlay-id="${id}" src="${IMG_SRC}">`
}
