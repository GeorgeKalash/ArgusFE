import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { ContentState, EditorState, Modifier } from 'draft-js'
const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), { ssr: false })
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { tagGroups } from '@argus/shared-domain/src/resources/Tags'
import DropdownButton from '@argus/shared-ui/src/components/Shared/DropdownButton'
import styles from './TextEditor.module.css'

export default function TextEditor({ value = '', onChange }) {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())
  const [openDropdown, setOpenDropdown] = useState(null)


  useEffect(() => {
    if (!value) return

    const load = async () => {
      const { default: htmlToDraft } = await import('html-to-draftjs')

      const contentBlock = htmlToDraft(value)

      if (contentBlock) {
        const { contentBlocks, entityMap } = contentBlock
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
        setEditorState(EditorState.createWithContent(contentState))
      }
    }

    load()
  }, [value])

  const handleEditorChange = data => {
    setEditorState(data)
    if (onChange) onChange(data)
  }

  const uploadImageCallBack = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        resolve({ data: { link: e.target.result } })
      }
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const insertTag = tag => {
    const content = editorState.getCurrentContent()
    const selection = editorState.getSelection()

    const newContent = Modifier.insertText(
      content,
      selection,
      ` # ${tag} # `
    )

    const newState = EditorState.push(
      editorState,
      newContent,
      'insert-characters'
    )

    setEditorState(newState)

    if (onChange) onChange(newState)

    setOpenDropdown(null)
  }


  return (
    <>
      <div className={styles.editorRoot}>
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorChange}
          toolbarClassName='toolbarClassName'
          wrapperClassName='wrapperClassName'
          editorClassName='editorClassName'
          handleReturn={(e) => {
            return 'not-handled';
          }}
          toolbar={{
            colorPicker: {
              enableBackground: true
            },
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
            ))
          }
        />
      </div>
    </>
  )
}