import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { $applyNodeReplacement, DOMExportOutput } from 'lexical'

export class CustomTableNode extends TableNode {
  __style: string

  constructor(style?: string, key?: string) {
    super(key)
    this.__style = style || ''
  }

  static getType() {
    return 'custom-table'
  }

  static clone(node: CustomTableNode): CustomTableNode {
    return new CustomTableNode(node.__style, node.__key)
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('table')
    if (this.__style) {
      element.setAttribute('style', this.__style)
    }
    return { element }
  }

  static importDOM() {
    return {
      table: (node: HTMLTableElement) => ({
        conversion: (domNode: HTMLTableElement) => {
          const style = domNode.getAttribute('style')
          return {
            node: $applyNodeReplacement(new CustomTableNode(style)),
          }
        },
        priority: 0,
      }),
    }
  }
}
