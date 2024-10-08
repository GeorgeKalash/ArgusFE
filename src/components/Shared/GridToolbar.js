import { Box, Button, Grid, Tooltip, DialogActions } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { useState, useContext } from 'react'
import { TrxType } from 'src/resources/AccessLevels'
import { ControlContext } from 'src/providers/ControlContext'
import { getButtons } from './Buttons'

const GridToolbar = ({
  onAdd,
  leftSection,
  rightSection,
  bottomSection,
  middleSection,
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
      <style>
        {`
          .button-container {
            position: relative;
            display: inline-block;
          }
          .toast {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #333333ad;
            color: white;
            padding: 3px 7px;
            border-radius: 7px;
            opacity: 0;
            transition: opacity 0.3s, top 0.3s;
            z-index: 1;
          }
          .button-container:hover .toast {
            opacity: 1;
            top: -40px;
          }
        `}
      </style>
      <Grid container spacing={2} sx={{ display: 'flex', px: 2, width: '100%', justifyContent: 'space-between' }}>
        <Grid item>
          <Grid container spacing={2}>
            {leftSection}
            {onAdd && addBtnVisible && (
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Tooltip title={platformLabels.add}>
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
                </Tooltip>
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
            {middleSection && (
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                {middleSection}
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
                        {button.image ? tooltip && <div className='toast'>{tooltip}</div> : null}
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
