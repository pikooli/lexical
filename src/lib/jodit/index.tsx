'use client'
import React, { useState, useRef, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { IJodit } from 'jodit/esm/types/jodit'

const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
}) as unknown as typeof import('jodit-react').default

export const JoditComponent = () => {
  const editor = useRef(null)
  const [content, setContent] = useState('')
  const [escapedContent, setEscapedContent] = useState('')

  const onChange = (content: string) => {
    setContent(content)
    setEscapedContent(
      content.replaceAll('<p', '<div').replaceAll('</p>', '</div>'),
    )
  }

  const config = useMemo(
    () => ({
      readonly: false,
      toolbarAdaptive: false, // ❌ Disables toolbar auto-resizing
      useClasses: false, // ✅ Ensures inline styles are used instead of CSS classes
      allowTableEditing: true, // ✅ Allows table modifications
      allowResizeTables: true, // ✅ Ensures table resizing works
      buttons: [
        // {
        //   icon: 'brush',
        //   popup: editor => {
        //     const div = editor.create.element('div')
        //     const input = editor.create.element('input')
        //     input.type = 'color'
        //     input.value = '#ff0000'
        //     input.onblur = () => {
        //       editor.selection.applyStyle({ color: input.value })
        //     }
        //     div.appendChild(input)
        //     return div
        //   },
        // },
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
      ],
    }),
    [],
  )

  return (
    <>
      JODIT EDITOR
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
    </>
  )
}
