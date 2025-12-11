import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { ContentState, convertToRaw, EditorState } from 'draft-js'
import { Modifier } from 'draft-js'
import { tagGroups } from 'src/resources/LettersMetaTags'

const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), { ssr: false })
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

export function TagsDropdownButton({ group, editorState, onChange, openDropdown, setOpenDropdown }) {
  const isOpen = openDropdown === group.type

  const toggleDropdown = () => {
    setOpenDropdown(isOpen ? null : group.type)
  }

  const insertTag = tag => {
    const content = editorState.getCurrentContent()
    const selection = editorState.getSelection()

    const newContent = Modifier.insertText(content, selection, ` # ${tag} # `, null, null)
    const newState = EditorState.push(editorState, newContent, 'insert-characters')

    onChange(newState)
    setOpenDropdown(null)
  }

  const IconComponent = group.icon

  return (
    <div style={{ position: 'relative', marginRight: 8 }}>
      <button
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          background: 'white',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}
        onClick={toggleDropdown}
      >
        <IconComponent fontSize='small' />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'white',
            border: '1px solid #ccc',
            zIndex: 1000,
            width: 220,
            maxHeight: 250,
            overflowY: 'auto'
          }}
        >
          {group.tags.map((tag, index) => (
            <div
              key={index}
              onClick={() => insertTag(tag)}
              style={{
                padding: 8,
                cursor: 'pointer'
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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

  return (
    <>
      <style>
        {`.rdw-colorpicker-modal 
          { 
            position: fixed !important; 
            z-index: 2000 !important; 
            transform: translateY(0) !important; 
          }  
          .rdw-colorpicker-modal 
          { 
            top: auto !important;
            left: auto !important;
          } 
        } `}
      </style>
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
            
            // <Dropdown
            //   key={group.type}
            //   Image={<group.icon sx={{ color: 'black', fontSize: 20 }} />}
            //   TooltipTitle={group.type}
            //   isEditor
            //   insertTag={insertTag}
            //   map={group.tags.map(t => ({ name: t }))}
            //   navCollapsed={false}
            // />

            <TagsDropdownButton
              key={group.type}
              group={group}
              editorState={editorState}
              onChange={handleEditorChange}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />
          ))}
        />
      </div>
    </>
  )
}
