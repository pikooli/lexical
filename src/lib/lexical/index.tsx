'use client'
import { $createParagraphNode, $createTextNode, EditorState } from 'lexical'
import { useState, useRef, useEffect, useCallback } from 'react'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $insertNodes, ParagraphNode, TextNode } from 'lexical'
import { constructImportMap } from '@/lib/lexical/constructImportMap'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import theme from '@/lib/lexical/exampleTheme'
import ToolbarPlugin from '@/lib/lexical/plugins/ToolbarPlugin'
import TreeViewPlugin from '@/lib/lexical/plugins/TreeViewPlugin'
import { exportMap } from '@/lib/lexical/exportMap'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { CustomTableNode } from '@/lib/lexical/nodes/customTableNode'
import LexicalAutoLinkPlugin from '@/lib/lexical/plugins/AutoLinkPlugin'
import { ListItemNode, ListNode } from '@lexical/list'
import LinkPlugin from '@/lib/lexical/plugins/LinkPlugin'
import { CustomParagraphNode } from '@/lib/lexical/nodes/customParagraphNode'
import { InlineImageNode } from '@/lib/lexical/nodes/InlineImageNode'
import { CustomLinkNode } from '@/lib/lexical/nodes/CustomLinkNode'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error)
}

function EditorRefPlugin({ editorRef }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // Store the editor instance in the ref passed from parent
    editorRef.current = editor

    return () => {
      editorRef.current = null
    }
  }, [editor, editorRef])

  return null
}

const editorConfig = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: 'React.js Demo',
  nodes: [
    ParagraphNode,
    TextNode,
    LinkNode,
    AutoLinkNode,
    ListItemNode,
    ListNode,
    InlineImageNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    // CustomLinkNode,
    // CustomTableNode,
    CustomParagraphNode,
    {
      replace: ParagraphNode,
      with: _ => {
        return new CustomParagraphNode()
      },
    },
    // {
    //   replace: LinkNode,
    //   with: node => {
    //     const url = node?.getURL?.() || ''
    //     return new CustomLinkNode(url)
    //   },
    // },
    // {
    //   replace: TableNode,
    //   with: _ => {
    //     return new CustomTableNode()
    //   },
    // },
  ],
  onError(error: Error) {
    throw error
  },
  theme: theme,
}
function oldImport(editor, htmlString) {
  if (editor) {
    editor.update(() => {
      const parser = new DOMParser()
      const unescapedHtml = htmlString.replace(/\\"/g, '"')
      const doc = parser.parseFromString(unescapedHtml, 'text/html')

      const nodes = $generateNodesFromDOM(editor, doc)
      // Select the root
      $getRoot().clear()

      // Insert them at a selection.
      $insertNodes(nodes)
    })
  }
}
function convertDOMToLexical(editor, htmlString) {
  const parser = new DOMParser()
  const unescapedHtml = htmlString.replace(/\\"/g, '"')
  const doc = parser.parseFromString(unescapedHtml, 'text/html')

  // First, traverse the DOM and attach the custom style attribute
  attachLexicalStyleAttributes(doc.body)

  // Now, recursively convert the DOM to Lexical nodes
  function recursiveConvert(domNode) {
    if (domNode.nodeType === Node.TEXT_NODE) {
      return $createTextNode(domNode.textContent)
    }
    if (domNode.nodeType === Node.ELEMENT_NODE) {
      // For demonstration, assume all elements become a "generic" custom element node
      // You might want to handle different elements (e.g., paragraphs, divs, spans) separately.
      const lexicalNode = $createParagraphNode() // or a custom generic node

      // If a style is set, apply it
      const style = domNode.getAttribute('data-lexical-style')
      if (style && lexicalNode.setStyle) {
        lexicalNode.setStyle(style)
      }

      // Recursively convert children and append them
      domNode.childNodes.forEach(child => {
        const childNode = recursiveConvert(child)
        if (childNode) {
          lexicalNode.append(childNode)
        }
      })
      return lexicalNode
    }
    return null
  }

  // Convert all top-level child nodes
  const nodes = []
  doc.body.childNodes.forEach(child => {
    const node = recursiveConvert(child)
    if (node) {
      nodes.push(node)
    }
  })

  editor.update(() => {
    $getRoot().clear()
    $insertNodes(nodes)
  })
}
function importHTMLWithStyles(editor, htmlString) {
  if (editor) {
    const parser = new DOMParser()
    const unescapedHtml = htmlString.replace(/\\"/g, '"')
    const doc = parser.parseFromString(unescapedHtml, 'text/html')

    editor.update(() => {
      const nodes = $generateNodesFromDOM(editor, doc)

      nodes.forEach(node => {
        if (node.getType && node.getType() !== 'text') {
          const domElement = doc.querySelector(node.getType())
          console.log(
            'domElement',
            node.getType(),
            domElement?.getAttribute('style'),
          )
          if (domElement && domElement.getAttribute('style')) {
            node.setStyle(domElement.getAttribute('style')) // Store inline styles
          }
        }
      })
      $getRoot().clear()
      $insertNodes(nodes)
    })
  }
}
export function LexicalComponent() {
  const editorRef = useRef(null)

  const [editorState, setEditorState] = useState<string>()

  const onChange = (editorState: EditorState) => {
    editorState.read(() => {
      if (editorRef.current) {
        const html = $generateHtmlFromNodes(editorRef.current)
        setEditorState(html)
      }
    })
  }

  const onImportHtml = useCallback((html: string) => {
    // oldImport(editorRef.current, html)
    importHTMLWithStyles(editorRef.current, html)
  }, [])

  return (
    <div className='flex flex-col gap-2 p-4'>
      <div className='grid grid-cols-2 gap-2'>
        <div>
          <label htmlFor='editor'>Editor : </label>
          <div className='border border-blue-500 rounded-md'>
            <LexicalComposer initialConfig={editorConfig}>
              <EditorRefPlugin editorRef={editorRef} />
              <RichTextPlugin
                contentEditable={<ContentEditable className='min-h-[500px]' />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <OnChangePlugin onChange={onChange} />
              <ToolbarPlugin />
              <LinkPlugin />
              <TreeViewPlugin />
              <ListPlugin />
              <LexicalAutoLinkPlugin />
              <TablePlugin />
            </LexicalComposer>
          </div>
        </div>
        <div className='flex flex-col'>
          <label htmlFor='importHtml'>Import HTML : </label>
          <textarea
            onChange={e => onImportHtml(e.target.value)}
            className='border border-blue-500 rounded-md p-2 h-full'
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='editorState'>Editor State HTML diplayed : </label>
          <div
            className='border border-red-500 rounded-md p-2'
            dangerouslySetInnerHTML={{ __html: editorState }}
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='editorState'>Editor State brut displayed: </label>
          <div className='border border-green-500 rounded-md p-2'>
            {editorState}
          </div>
        </div>
      </div>
      <ul>
        <li>test</li>
        <li>test</li>
        <li>test</li>
      </ul>
      <ol>
        <li>test</li>
        <li>test</li>
      </ol>
    </div>
  )
}
