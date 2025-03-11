import { ParagraphNode } from 'lexical'
import { $isInlineImageNode } from './InlineImageNode'

export class CustomParagraphNode extends ParagraphNode {
  static getType() {
    return 'custom-paragraph'
  }

  static clone(node) {
    return new CustomParagraphNode(node.__key)
  }

  createDOM(config) {
    const children = this.getChildren()
    if (children.length === 1 && $isInlineImageNode(children[0])) {
      // For image-only paragraphs, create a plain container
      return children[0].createDOM(config)
    }

    const div = document.createElement('div')
    // div.style = 'background: green'
    return div
  }
  updateDOM() {
    return false // Prevents unnecessary updates to the DOM
  }
}
