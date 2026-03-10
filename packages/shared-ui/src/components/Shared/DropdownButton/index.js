import { Popper, Paper } from '@mui/material'
import { useRef } from 'react'
import styles from '@argus/shared-ui/src/components/Shared/DropdownButton/DropdownButton.module.css'
import { ClickAwayListener } from '@mui/material'

export default function index({
  group,
  openDropdown,
  setOpenDropdown,
  onItemClick
}) {
  const isOpen = openDropdown === group.type
  const anchorRef = useRef(null)

  const toggleDropdown = () => {
    setOpenDropdown(isOpen ? null : group.type)
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
                onClick={() => onItemClick(tag)}
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
