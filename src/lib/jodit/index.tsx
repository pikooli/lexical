'use client'
import React, { useState, useRef, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { IJodit } from 'jodit/esm/types/jodit'

const JoditEditor = dynamic(() => import('jodit-pro-react'), {
  ssr: false,
}) as unknown as typeof import('jodit-pro-react').default

export const JoditComponent = () => {
  const editor = useRef(null)
  const [content, setContent] = useState('')
  const [escapedContent, setEscapedContent] = useState('')
  const joditRef = useRef<IJodit>(null)

  const onChange = (content: string) => {
    setContent(content)
    setEscapedContent(
      content.replaceAll('<p', '<div').replaceAll('</p>', '</div>'),
    )
  }

  useEffect(() => {
    import('jodit-pro-react').then(mod => {
      joditRef.current = mod.Jodit
      mod.Jodit.modules.Dummy = function (editor: IJodit) {
        this.insertDummyImage = function (
          w: number,
          h: number,
          textcolor: string,
          bgcolor: string,
        ) {
          const image = editor.createInside.element('img')
          image.setAttribute(
            'src',
            'http://dummyimage.com/' +
              w +
              'x' +
              h +
              '/' +
              (textcolor || '000') +
              '/' +
              (bgcolor || 'fff'),
          )
          editor.selection.insertNode(image)
          editor.setEditorValue() // for syncronize value between source textarea and editor
        }
      }
    })
  }, [])

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Start typings...',
      toolbarAdaptive: false, // ❌ Disables toolbar auto-resizing
      buttons: [
        // 'source',
        // '|',
        // 'bold',
        // 'strikethrough',
        // 'underline',
        // 'italic',
        // '|',
        // 'ul',
        // 'ol',
        // '|',
        // 'outdent',
        // 'indent',
        // '|',
        // 'font',
        // 'fontsize',
        // 'brush',
        // 'paragraph',
        // '|',
        // 'insertTimestamp', // Add our button to the toolbar
        // {
        //   name: 'insertDate',
        //   tooltip: 'Insert current Date',
        //   exec: (editor: IJodit) => {
        //     editor.s.insertHTML(new Date().toDateString())
        //   },
        // },
        {
          name: 'lock',
          tooltip: 'Change Text Color',
          exec: (editor: IJodit) => {
            editor.execCommand('background', false, '#ff00ff')
          },
        },
        // {
        //   iconURL: 'images/dummy.png',
        //   tooltip: 'insert Dummy Image',
        //   exec: function (editor: IJodit) {
        //     editor.dummy.insertDummyImage(100, 100, 'f00', '000')
        //   },
        // },
      ],
      events: {
        afterInit: function (editor) {
          editor.dummy = new joditRef.current.modules.Dummy(editor)
        },
      },
    }),
    [],
  )

  return (
    <div className='grid grid-cols-2 gap-4'>
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        tabIndex={1} // tabIndex of textarea
        onBlur={onChange}
        onChange={newContent => {}}
      />
      <div className='border border-gray-300 rounded-md p-4'>
        Content :{content}
      </div>
      <div className='border border-gray-300 rounded-md p-4'>
        Escaped Content :{escapedContent}
      </div>
    </div>
  )
}
