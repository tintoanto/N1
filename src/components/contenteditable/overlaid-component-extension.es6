import {ContenteditableExtension} from 'nylas-exports'
import OverlaidComponentRegistry from './overlaid-component-registry'

export default class OverlaidComponentExtension extends ContenteditableExtension {

  static onContentChanged({editor}) {
    OverlaidComponentExtension._fixImgSrc(editor.rootNode)
    OverlaidComponentExtension._restoreOverlayAnchors(editor.rootNode)
  }

  /**
   * When our anchor images get pasted back into the contentediable, our
   * sanitization service strips the src attribute. Restores the src to be
   * our 1px transparent gif.
   */
  static _fixImgSrc(rootNode) {
    const cls = OverlaidComponentRegistry.ANCHOR_CLASS
    const imgs = Array.from(rootNode.querySelectorAll(`.${cls}`))
    for (const img of imgs) {
      if (img.getAttribute("src") !== OverlaidComponentRegistry.IMG_SRC) {
        img.setAttribute("src", OverlaidComponentRegistry.IMG_SRC)
      }
    }
  }

  static _restoreOverlayAnchors(rootNode) {
    const anchors = Array.from(rootNode.querySelectorAll(`.${OverlaidComponentRegistry.ANCHOR_CLASS}`));

    if (anchors.length === 0) { return }

    const editableRect = rootNode.getBoundingClientRect()

    const anchorState = {}
    for (const anchor of anchors) {
      const id = anchor.dataset.overlayId

      const overlayData = OverlaidComponentRegistry.getOverlaidComponentRects[id];
      if (overlayData && overlayData.rect) {
        anchor.style.width = `${overlayData.rect.width}px`
        anchor.style.height = `${overlayData.rect.height}px`
      }

      const rect = anchor.getBoundingClientRect()
      const left = rect.left - editableRect.left - 14
      const top = rect.top - editableRect.top

      anchorState[id] = {left, top}
    }

    OverlaidComponentRegistry.setAnchorState(anchorState)
  }
}
