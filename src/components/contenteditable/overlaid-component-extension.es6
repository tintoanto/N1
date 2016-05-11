import {ContenteditableExtension} from 'nylas-exports'
import OverlaidComponentStore from './overlaid-component-store'

export default class OverlaidComponentExtension extends ContenteditableExtension {

  static onContentChanged({editor}) {
    OverlaidComponentExtension._fixImgSrc(editor.rootNode)
  }

  /**
   * When our anchor images get pasted back into the contentediable, our
   * sanitization service strips the src attribute. Restores the src to be
   * our 1px transparent gif.
   */
  static _fixImgSrc(rootNode) {
    const cls = OverlaidComponentStore.ANCHOR_CLASS
    const imgs = Array.from(rootNode.querySelectorAll(`.${cls}`))
    for (const img of imgs) {
      if (img.getAttribute("src") !== OverlaidComponentStore.IMG_SRC) {
        img.setAttribute("src", OverlaidComponentStore.IMG_SRC)
      }
    }
  }
}
