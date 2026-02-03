import InputMask from 'react-input-mask'
import { TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import inputs from './Inputs.module.css'

const SegmentedInput = ({ name, value, onChange, label, error, required, readOnly }) => {
  const [mask, setMask] = useState('')
  const { defaultsData } = useContext(ControlContext)
  const [isFocused, setIsFocused] = useState(false)

  const handleInputChange = event => {
    if (!readOnly) {
      const { value } = event.target
      onChange({ value, segments: value.split('-') })
    }
  }

  const createMaskFromSegments = segments => {
    let mask = ''
    segments.forEach(segment => {
      mask += '*'.repeat(segment.value) + '-'
    })

    return mask.slice(0, -1)
  }

  const getSegmentsValues = () => {
    if (value) {
      setMask(
        createMaskFromSegments(
          value.split('-').map((seg, index) => ({
            key: `GLACSeg${index}`,
            value: seg.length
          }))
        )
      )
    } else {
      const defaultSegments = defaultsData.list
        .filter(obj => ['GLACSeg0', 'GLACSeg1', 'GLACSeg2', 'GLACSeg3', 'GLACSeg4'].includes(obj.key))
        .map(obj => ({
          key: obj.key,
          value: parseInt(obj.value)
        }))
        .filter(obj => obj.value)
      setMask(createMaskFromSegments(defaultSegments))
    }
  }

  useEffect(() => {
    getSegmentsValues()
  }, [value])

  return (
    <TextField
      id={name}
      name={name}
      variant='outlined'
      fullWidth
      size='small'
      value={value ?? ''}
      onChange={handleInputChange}
      label={label}
      error={Boolean(error)}
      helperText={error}
      required={required}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      inputProps={{
        readOnly: readOnly
      }}
      InputProps={{
        classes: {
          root: inputs.outlinedRoot,
          notchedOutline: inputs.outlinedFieldset,
          input: inputs.inputBase
        },
        inputComponent: InputMask,
        inputProps: {
          mask: mask,
          alwaysShowMask: true,
          guide: false,
          readOnly: readOnly
        }
      }}
      InputLabelProps={{
        className: isFocused || value ? inputs.inputLabelShrink : inputs.inputLabel
      }}
    />
  )
}

export default SegmentedInput
