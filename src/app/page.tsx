'use client'
import { EditorState } from 'lexical'
import { useState, useRef, useEffect, useCallback } from 'react'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $insertNodes, ParagraphNode, TextNode } from 'lexical'
import { constructImportMap } from '@/app/constructImportMap'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import theme from '@/app/exampleTheme'
import ToolbarPlugin from '@/app/plugins/ToolbarPlugin'
import TreeViewPlugin from '@/app/plugins/TreeViewPlugin'
import { exportMap } from '@/app/exportMap'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import LexicalAutoLinkPlugin from '@/app/plugins/AutoLinkPlugin'
import { ListItemNode, ListNode } from '@lexical/list'
import LinkPlugin from '@/app/plugins/LinkPlugin'
import { CustomParagraphNode } from './nodes/customParagraphNode'
import { InlineImageNode } from './nodes/InlineImageNode'
import { CustomLinkNode } from './nodes/CustomLinkNode'
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
    CustomParagraphNode,
    InlineImageNode,
    CustomLinkNode,
    {
      replace: ParagraphNode,
      with: _ => {
        return new CustomParagraphNode()
      },
    },
    {
      replace: LinkNode,
      with: node => {
        const url = node?.getURL?.() || ''
        return new CustomLinkNode(url)
      },
    },
  ],
  onError(error: Error) {
    throw error
  },
  theme: theme,
}

function Editor() {
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
    if (editorRef.current) {
      editorRef.current.update(() => {
        const parser = new DOMParser()
        const unescapedHtml = html.replace(/\\"/g, '"')
        const doc = parser.parseFromString(unescapedHtml, 'text/html')

        const nodes = $generateNodesFromDOM(editorRef.current, doc)
        // Select the root
        $getRoot().clear()

        // Insert them at a selection.
        $insertNodes(nodes)
      })
    }
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

export default Editor
