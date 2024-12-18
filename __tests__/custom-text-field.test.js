import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CustomTextField from 'src/components/Inputs/CustomTextField.js'

describe('CustomTextField test', () => {
  it('should render custom text field', () => {
    render(
      <CustomTextField
        label='Test Field'
        value=''
        onChange={() => {}}
        type='text'
        variant='outlined'
        size='small'
        fullWidth
        required={false}
        disabled={false}
        error={false}
      />
    )
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
  })

  it('should pass max length ', async () => {
    render(
      <CustomTextField
        label='Test Field'
        value=''
        onChange={() => {}}
        type='text'
        variant='outlined'
        size='small'
        fullWidth
        required={false}
        disabled={false}
        error={false}
        maxLength='44'
      />
    )
    const input = screen.getByLabelText('Test Field')
    expect(input).toHaveAttribute('maxLength', '44')
  })

  it('should default max length to 1000', async () => {
    render(
      <CustomTextField
        label='Test Field'
        value=''
        onChange={() => {}}
        type='text'
        variant='outlined'
        size='small'
        fullWidth
        required={false}
        disabled={false}
        error={false}
      />
    )
    const input = screen.getByLabelText('Test Field')
    expect(input).toHaveAttribute('maxLength', '1000')
  })

  it('should pass min length attribute', async () => {
    render(
      <CustomTextField
        label='Test Field'
        value=''
        onChange={() => {}}
        type='text'
        variant='outlined'
        size='small'
        fullWidth
        required={false}
        disabled={false}
        error={false}
        minLength='1'
      />
    )
    const input = screen.getByLabelText('Test Field')
    expect(input).toHaveAttribute('minLength', '1')
  })
})
