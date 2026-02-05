import dynamic from 'next/dynamic'
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { ContentState, EditorState, Modifier, convertToRaw } from 'draft-js'
import DropdownButton from '@argus/shared-ui/src/components/Shared/DropdownButton'
import { tagGroups } from '@argus/shared-domain/src/resources/Tags'
import styles from './TextEditor.module.css'

// IMPORTANT:
// Prefer moving this CSS import to _app.js / app/layout.tsx (global) if you can.
// Keeping it here works for many setups, but global is safer in monorepos.
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

// Load editor only on client
const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), { ssr: false })

export default function TextEditor({ value = '', onChange }) {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())
  const [openDropdown, setOpenDropdown] = useState(null)

  // Track last HTML we hydrated from, so we don't re-create state unnecessarily
  const lastHydratedHtmlRef = useRef('')

  // Optional: helper to see if editor has any content
  const hasContent = useMemo(() => {
    const content = editorState.getCurrentContent()
    return content.hasText()
  }, [editorState])

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    const html = typeof value === 'string' ? value : ''
    if (!html) {
      // If parent clears value, only reset if editor actually has content
      if (lastHydratedHtmlRef.current !== '' && hasContent) {
        setEditorState(EditorState.createEmpty())
        lastHydratedHtmlRef.current = ''
      }
      return
    }

    // Prevent rehydrating with same HTML
    if (html === lastHydratedHtmlRef.current) return

    let canceled = false

    const load = async () => {
      try {
        const mod = await import('html-to-draftjs')
        const htmlToDraft = mod.default || mod

        const contentBlock = htmlToDraft(html)
        if (!contentBlock || canceled) return

        const { contentBlocks, entityMap } = contentBlock
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
        const nextState = EditorState.createWithContent(contentState)

        if (canceled) return
        setEditorState(nextState)
        lastHydratedHtmlRef.current = html
      } catch (e) {
        // If parsing fails, don't crash the page
        // Keep current editor state
        // (You can console.error here if you want)
      }
    }

    load()

    return () => {
      canceled = true
    }
  }, [value, hasContent])

  const handleEditorChange = useCallback(
    data => {
      setEditorState(data)
      if (typeof onChange === 'function') onChange(data)
    },
    [onChange]
  )

  const uploadImageCallBack = useCallback(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve({ data: { link: e.target.result } })
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }, [])

  const insertTag = useCallback(
    tag => {
      const content = editorState.getCurrentContent()
      const selection = editorState.getSelection()

      const newContent = Modifier.insertText(content, selection, ` # ${tag} # `)
      const newState = EditorState.push(editorState, newContent, 'insert-characters')

      setEditorState(newState)
      if (typeof onChange === 'function') onChange(newState)

      setOpenDropdown(null)
    },
    [editorState, onChange]
  )

  return (
    <div className={styles.editorRoot}>
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbarClassName='toolbarClassName'
        wrapperClassName='wrapperClassName'
        editorClassName='editorClassName'
        handleReturn={() => 'not-handled'}
        toolbar={{
          colorPicker: { enableBackground: true },
          options: [
            'inline',
            'blockType',
            'fontSize',
            'fontFamily',
            'list',
            'textAlign',
            'colorPicker',
            'link',
            'emoji',
            'image',
            'history'
          ],
          image: {
            uploadEnabled: true,
            urlEnabled: true,
            previewImage: true,
            uploadCallback: uploadImageCallBack
          },
          link: {
            inDropdown: false,
            showOpenOptionOnHover: true
          },
          inline: { options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
          fontSize: { options: [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96] },
          fontFamily: {
            options: [
              'Arial',
              'Arial Black',
              'Comic Sans MS',
              'Courier New',
              'Georgia',
              'Helvetica',
              'Impact',
              'Lucida Sans Unicode',
              'Tahoma',
              'Times New Roman',
              'Trebuchet MS',
              'Verdana'
            ]
          }
        }}
        editorStyle={{
          minHeight: '400px',
          fontSize: '16px',
          padding: '10px',
          backgroundColor: '#fff'
        }}
        toolbarCustomButtons={tagGroups.map(group => (
          <DropdownButton
            key={group.type}
            group={group}
            onItemClick={insertTag}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
        ))}
      />
    </div>
  )
}
