import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { ContentState, convertToRaw, EditorState } from 'draft-js'

const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), { ssr: false })
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

export default function TextEditor({ value = '', onChange }) {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())

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
  function debugDumpStyles(label, editorState) {
    const raw = convertToRaw(editorState.getCurrentContent())
    console.log('RAW DUMP:', label, raw)

    // per-character styles
    editorState
      .getCurrentContent()
      .getBlocksAsArray()
      .forEach(block => {
        console.log(`BLOCK ${block.getKey()} text: "${block.getText()}"`)
        block.getCharacterList().forEach((charMeta, i) => {
          const styles = Array.from(charMeta.getStyle())
          if (styles.length) {
            console.log(` char ${i} styles:`, styles)
          }
        })
      })
  }

  const handleEditorChange = data => {
    setEditorState(data)
    if (onChange) onChange(data)
    debugDumpStyles('onChange', data)
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

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 8,
        width: '100%',
        marginTop: 10,
        padding: 10,
        boxSizing: 'border-box'
      }}
    >
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbarClassName='toolbarClassName'
        wrapperClassName='wrapperClassName'
        editorClassName='editorClassName'
        toolbar={{
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
      />
    </div>
  )
}
