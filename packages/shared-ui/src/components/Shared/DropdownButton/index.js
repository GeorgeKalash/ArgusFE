import { EditorState, Modifier } from 'draft-js'
import { Popper, Paper } from '@mui/material'
import { useRef } from 'react'
import styles from '@argus/shared-ui/src/components/Shared/DropdownButton/DropdownButton.module.css'
import { ClickAwayListener } from '@mui/material'

export default function index({
  group,
  editorState,
  onChange,
  openDropdown,
  setOpenDropdown
}) {
  const isOpen = openDropdown === group.type
  const anchorRef = useRef(null)

  const toggleDropdown = () => {
    setOpenDropdown(isOpen ? null : group.type)
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

    onChange(newState)
    setOpenDropdown(null)
  }

  const IconComponent = group.icon

  return (
    <div className={styles.wrapper}>
      <button
        ref={anchorRef}
        className={styles.button}
        onClick={toggleDropdown}
      >
        <IconComponent fontSize="small" />
      </button>

      <Popper
        open={isOpen}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        sx={{
            zIndex: theme => theme.zIndex.modal + 1
        }}
      >
        <ClickAwayListener
            onClickAway={event => {
            if (anchorRef.current?.contains(event.target)) return
            setOpenDropdown(null)
            }}
        >
            <Paper className={styles.menu} elevation={0}>
            {group.tags.map((tag, index) => (
                <div
                    key={index}
                    className={styles.item}
                    onClick={() => insertTag(tag)}
                >
                {tag}
                </div>
            ))}
            </Paper>
        </ClickAwayListener>
      </Popper>

    </div>
  )
}
