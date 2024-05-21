import InputMask from 'react-input-mask'
import { FormControl, InputLabel, OutlinedInput } from '@mui/material'

const SegmentedInput = ({ segments, name, setFieldValue, values, label, error, required, readOnly }) => {
  const handleInputChange = event => {
    if (!readOnly) {
      const { value } = event.target
      setFieldValue(name, value)
    }
  }

  const createMask = () => {
    let mask = ''
    segments.forEach(segment => {
      mask += '*'.repeat(segment.value) + '-'
    })

    return mask.slice(0, -1)
  }

  const mask = createMask()

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
        value={values}
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
