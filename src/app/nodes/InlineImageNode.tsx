import {
  DOMExportOutput,
  DOMConversionMap,
  DOMConversionOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  $applyNodeReplacement,
  DecoratorNode,
} from 'lexical'

export interface InlineImagePayload {
  src: string
  altText: string
  width?: number
  height?: number
  style?: string
  key?: NodeKey
}

export type SerializedInlineImageNode = Spread<
  {
    src: string
    altText: string
    width?: number
    height?: number
    style?: string
  },
  SerializedLexicalNode
>

export class InlineImageNode extends DecoratorNode<React.ReactElement> {
  __src: string
  __altText: string
  __width?: number
  __height?: number
  __style?: string // Add style property

  static getType(): string {
    return 'inline-image'
  }

  static clone(node: InlineImageNode): InlineImageNode {
    return new InlineImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__style,
      node.__key,
    )
  }

  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    style?: string,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
    this.__style = style
  }

  static importJSON(
    serializedNode: SerializedInlineImageNode,
  ): InlineImageNode {
    const { src, altText, width, height, style } = serializedNode
    return $createInlineImageNode({ src, altText, width, height, style })
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (_node: Node) => ({
        conversion: convertImageElement,
        priority: 1, // Ensures image elements are properly handled
      }),
    }
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement('img')
    img.src = this.__src
    img.alt = this.__altText
    if (this.__width) img.width = this.__width
    if (this.__height) img.height = this.__height
    if (this.__style) img.style.cssText = this.__style
    return { element: img }
  }

  exportJSON(): SerializedInlineImageNode {
    return {
      type: 'inline-image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      style: this.__style,
    }
  }

  createDOM(): HTMLElement {
    const img = document.createElement('img')
    img.src = this.__src
    img.alt = this.__altText
    if (this.__width) img.width = this.__width
    if (this.__height) img.height = this.__height
    img.style.cssText = this.__style || ''
    return img
  }

  updateDOM(prevNode: InlineImageNode, dom: HTMLElement): boolean {
    if (this.__src !== prevNode.__src) {
      ;(dom as HTMLImageElement).src = this.__src
    }
    if (this.__altText !== prevNode.__altText) {
      ;(dom as HTMLImageElement).alt = this.__altText
    }
    if (this.__style !== prevNode.__style) {
      img.style.cssText = this.__style || ''
    }
    return false
  }

  decorate(): React.ReactElement {
    const styleObject = this.__style
      ? Object.fromEntries(
          this.__style
            .split(';')
            .filter(style => style.trim())
            .map(style => {
              const [key, value] = style.split(':').map(part => part.trim())
              return [key, value]
            }),
        )
      : undefined

    return (
      <img
        src={this.__src}
        alt={this.__altText}
        width={this.__width}
        height={this.__height}
        style={styleObject}
      />
    )
  }
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt, src, width, height, style } = domNode
    const node = $createInlineImageNode({
      src,
      altText: alt,
      width,
      style: style?.cssText,
      height,
    })
    return { node }
  }
  return null
}

export function $createInlineImageNode({
  src,
  altText,
  width,
  height,
  style,
  key,
}: InlineImagePayload): InlineImageNode {
  return $applyNodeReplacement(
    new InlineImageNode(src, altText, width, height, style, key),
  )
}

export function $isInlineImageNode(
  node: LexicalNode | null | undefined,
): node is InlineImageNode {
  return node instanceof InlineImageNode
}
