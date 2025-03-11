import { LinkNode } from '@lexical/link'
import type { LinkAttributes } from '@lexical/link'
import {
  $applyNodeReplacement,
  DOMExportOutput,
  DOMConversionMap,
  NodeKey,
} from 'lexical'
import {
  convertKebabCaseToCamelCase,
  convertCamelCaseToKebabCase,
} from '../utils/convertStyle'

const defaultStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  color: '#467886',
  textDecoration: 'none',
  cursor: 'pointer',
} as const

export class CustomLinkNode extends LinkNode {
  __style: string

  constructor(
    url: string,
    attributes?: LinkAttributes,
    style?: string,
    key?: NodeKey,
  ) {
    super(url, attributes, key)

    if (style) {
      // Parse incoming style string into object
      const styleObj = style.split(';').reduce(
        (acc, rule) => {
          const [key, value] = rule.split(':').map(s => s.trim())
          if (key && value) {
            // Convert kebab-case to camelCase
            const camelKey = convertKebabCaseToCamelCase(key)
            acc[camelKey] = value
          }
          return acc
        },
        { ...defaultStyle },
      )

      // Convert back to string
      this.__style = convertKebabCaseToCamelCase(
        Object.entries(styleObj)
          .map(([key, value]) => {
            // Convert camelCase back to kebab-case
            return `${key}: ${value}`
          })
          .join('; '),
      )
    } else {
      this.__style = Object.entries(defaultStyle)
        .map(([key, value]) => {
          return `${key}: ${value}`
        })
        .join('; ')
    }
  }

  static getType(): string {
    return 'custom-link'
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('a')
    element.href = this.__url
    if (this.__target) element.target = this.__target
    if (this.__rel) element.rel = this.__rel
    if (this.__title) element.title = this.__title
    if (this.__style)
      element.style.cssText = convertCamelCaseToKebabCase(this.__style)
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: Node) => ({
        conversion: convertAnchorElement,
        priority: 1,
      }),
    }
  }

  // Helper method to create a CustomLinkNode
  static importJSON(serializedNode: any): CustomLinkNode {
    const node = new CustomLinkNode(
      serializedNode.url,
      {
        rel: serializedNode.rel,
        target: serializedNode.target,
        title: serializedNode.title,
      },
      convertCamelCaseToKebabCase(serializedNode.style),
    )
    return $applyNodeReplacement(node)
  }

  static clone(node: CustomLinkNode): CustomLinkNode {
    const attributes: LinkAttributes = {
      rel: node.__rel,
      target: node.__target,
      title: node.__title,
    }
    return new CustomLinkNode(
      node.__url,
      attributes,
      convertCamelCaseToKebabCase(node.__style),
      node.__key,
    )
  }

  createDOM(): HTMLElement {
    const a = document.createElement('a')
    a.href = this.__url
    if (this.__target) a.target = this.__target
    if (this.__rel) a.rel = this.__rel
    if (this.__title) a.title = this.__title
    if (this.__style)
      a.style.cssText = convertCamelCaseToKebabCase(this.__style)
    return a
  }

  updateDOM(prevNode: CustomLinkNode, dom: HTMLElement): boolean {
    const a = dom as HTMLAnchorElement
    if (this.__url !== prevNode.__url) {
      a.href = this.__url
    }
    if (this.__target !== prevNode.__target) {
      a.target = this.__target || ''
    }
    if (this.__rel !== prevNode.__rel) {
      a.rel = this.__rel || ''
    }
    if (this.__title !== prevNode.__title) {
      a.title = this.__title || ''
    }
    if (this.__style !== prevNode.__style) {
      a.style.cssText = convertCamelCaseToKebabCase(this.__style) || ''
    }
    return false
  }
}

function convertAnchorElement(domNode: Node): { node: CustomLinkNode } | null {
  if (!(domNode instanceof HTMLAnchorElement)) {
    return null
  }
  const node = new CustomLinkNode(domNode.href, {
    rel: domNode.rel,
    target: domNode.target,
    title: domNode.title,
  })
  return { node }
}

export function $createCustomLinkNode(
  url: string,
  attributes?: LinkAttributes,
  style?: string,
  key?: NodeKey,
): CustomLinkNode {
  return $applyNodeReplacement(new CustomLinkNode(url, attributes, style, key))
}

// Helper function to check if a node is a CustomLinkNode
export function $isCustomLinkNode(node: any): node is CustomLinkNode {
  return node instanceof CustomLinkNode
}
