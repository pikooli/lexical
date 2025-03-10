/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react'
import { useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TreeView } from '@lexical/react/LexicalTreeView'

export default function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [isTreeViewOpen, setIsTreeViewOpen] = useState(false)
  return (
    <div className='flex flex-col gap-2'>
      <button onClick={() => setIsTreeViewOpen(prev => !prev)}>
        {isTreeViewOpen ? 'Close Tree View' : 'Open Tree View'}
      </button>
      {isTreeViewOpen && (
        <TreeView
          viewClassName='tree-view-output'
          treeTypeButtonClassName='debug-treetype-button'
          timeTravelPanelClassName='debug-timetravel-panel'
          timeTravelButtonClassName='debug-timetravel-button'
          timeTravelPanelSliderClassName='debug-timetravel-panel-slider'
          timeTravelPanelButtonClassName='debug-timetravel-panel-button'
          editor={editor}
        />
      )}
    </div>
  )
}
