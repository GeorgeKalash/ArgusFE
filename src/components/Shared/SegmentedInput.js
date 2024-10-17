import InputMask from 'react-input-mask'
import { FormControl, InputLabel, OutlinedInput } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'

const SegmentedInput = ({ name, value, onChange, label, error, required, readOnly }) => {
  const [mask, setMask] = useState('')
  const { defaultsData } = useContext(ControlContext)

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
    <FormControl variant='outlined' fullWidth error={error} size='small' required={required}>
      <InputLabel
        htmlFor={name}
        size='small'
        sx={{ background: 'white', paddingInline: '5px', transform: 'translate(9px, -9px) scale(0.75)' }}
      >
        {label}
      </InputLabel>
      <OutlinedInput
        id={name}
        value={value}
        onChange={handleInputChange}
        label={label}
        notched={false}
        inputComponent={InputMask}
        inputProps={{
          mask: mask,
          alwaysShowMask: true,
          guide: false,
          readOnly: readOnly
        }}
        required={required}
      />
      {error}
    </FormControl>
  )
}

export default SegmentedInput
