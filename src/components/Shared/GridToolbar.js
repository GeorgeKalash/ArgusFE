import { Box, Button, Grid, Tooltip, DialogActions } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { useState, useContext } from 'react'
import { TrxType } from 'src/resources/AccessLevels'
import { ControlContext } from 'src/providers/ControlContext'
import { getButtons } from './Buttons'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

const GridToolbar = ({
  onAdd,
  leftSection,
  rightSection,
  bottomSection,
  inputSearch,
  onSearch,
  onSearchClear,
  onSearchChange,
  actions = [],
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const addBtnVisible = onAdd && maxAccess > TrxType.GET
  const [searchValue, setSearchValue] = useState('')
  const { platformLabels } = useContext(ControlContext)
  const [tooltip, setTooltip] = useState('')

  function clear() {
    setSearchValue('')
    onSearch('')
    if (onSearchClear) onSearchClear()
  }

  const handleButtonMouseEnter = text => {
    setTooltip(text)
  }

  const handleButtonMouseLeave = () => {
    setTooltip(null)
  }

  const buttons = getButtons(platformLabels)

  return (
    <DialogActions sx={{ px: '0px !important', py: '4px !important', flexDirection: 'column' }}>
      <Grid container spacing={2} sx={{ display: 'flex', px: 2, width: '100%', justifyContent: 'space-between' }}>
        <Grid item>
          <Grid container spacing={2}>
            {leftSection}
            {onAdd && addBtnVisible && (
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Tippy content={platformLabels.add} placement='bottom'>
                  <Button
                    onClick={onAdd}
                    variant='contained'
                    style={{ backgroundColor: 'transparent', border: '1px solid #4eb558' }}
                    sx={{
                      mr: 1,
                      '&:hover': {
                        opacity: 0.8
                      },
                      width: '20px',
                      height: '35px',
                      objectFit: 'contain'
                    }}
                  >
                    <img src='/images/buttonsIcons/add.png' alt={platformLabels.add} />
                  </Button>
                </Tippy>
              </Grid>
            )}
            {inputSearch && (
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', m: '0px !important' }}>
                <CustomTextField
                  name='search'
                  value={searchValue}
                  label={platformLabels.Search}
                  onClear={clear}
                  onChange={e => {
                    setSearchValue(e.target.value)
                    if (onSearchChange) onSearchChange(e.target.value)
                  }}
                  onSearch={onSearch}
                  search={true}
                  height={35}
                />
              </Grid>
            )}
            <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', m: '0px !important' }}>
              {buttons
                .filter(button => actions.some(action => action.key === button.key))
                .map((button, index) => {
                  const correspondingAction = actions.find(action => action.key === button.key)
                  const isVisible = correspondingAction.condition
                  const isDisabled = correspondingAction.disabled
                  const handleClick = correspondingAction.onClick

                  return (
                    isVisible && (
                      <div
                        className='button-container'
                        onMouseEnter={() => (isDisabled ? null : handleButtonMouseEnter(button.label))}
                        onMouseLeave={handleButtonMouseLeave}
                        key={index}
                      >
                        <Tippy content={tooltip} placement='bottom'>
                          <Button
                            onClick={handleClick}
                            variant='contained'
                            sx={{
                              mr: 1,
                              backgroundColor: button.color,
                              '&:hover': {
                                backgroundColor: button.color,
                                opacity: 0.8
                              },
                              border: button.border,
                              width: 'auto',
                              height: '35px',
                              objectFit: 'contain'
                            }}
                            disabled={isDisabled}
                          >
                            {button.image ? (
                              <img src={`/images/buttonsIcons/${button.image}`} alt={button.key} />
                            ) : (
                              button.label
                            )}
                          </Button>
                        </Tippy>
                      </div>
                    )
                  )
                })}
            </Grid>
          </Grid>
        </Grid>
        <Grid item>{rightSection}</Grid>
      </Grid>
      {bottomSection}
    </DialogActions>
  )
}

export default GridToolbar
