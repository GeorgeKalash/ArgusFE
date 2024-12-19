import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CustomComboBox from 'src/components/Inputs/CustomComboBox.js'

describe('combobox test', () => {
  it('combobox should update value on select', async () => {
    const mockStore = [
      { key: 'option1', value: 'Option 1' },
      { key: 'option2', value: 'Option 2' }
    ]

    const handleChange = jest.fn()

    render(
      <CustomComboBox
        name='testComboBox'
        label='Test label'
        value={mockStore[0]}
        onChange={handleChange}
        type='text'
        variant='outlined'
        size='small'
        fullWidth
        required={false}
        disabled={false}
        error={false}
        store={mockStore}
      />
    )

    const inputElement = screen.getByRole('combobox')

    fireEvent.mouseDown(inputElement)

    const options = await screen.findAllByRole('option')

    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent('Option 1')

    fireEvent.click(options[1])

    expect(handleChange).toHaveBeenCalledWith('testComboBox', mockStore[1])
  })

  it('properly handles disabled state', async () => {
    const mockStore = [
      { key: 'option1', value: 'Option 1' },
      { key: 'option2', value: 'Option 2' }
    ]

    render(
      <CustomComboBox
        name='testComboBox'
        label='Test label'
        value={mockStore[0]}
        onChange={() => {}}
        store={mockStore}
        disabled={true}
      />
    )

    const inputElement = screen.getByRole('combobox')
    expect(inputElement).toBeDisabled()
  })

  it('should handle required field validation', () => {
    render(
      <CustomComboBox
        name='testComboBox'
        store={[]}
        value={null}
        label='test required field'
        required={true}
        onChange={jest.fn()}
      />
    )

    const inputElement = screen.getByRole('combobox')
    expect(inputElement).toBeRequired()
  })

  it('should handle error state correctly', () => {
    render(
      <CustomComboBox
        name='testComboBox'
        store={[]}
        value={null}
        label='test required field'
        onChange={jest.fn()}
        error={true}
      />
    )
    const inputElement = screen.getByRole('combobox')
    expect(inputElement).toHaveAttribute('aria-invalid', 'true')
  })

  it('should handle readOnly correctly', () => {
    render(
      <CustomComboBox
        name='testComboBox'
        store={[]}
        value={null}
        label='test required field'
        onChange={jest.fn()}
        readOnly={true}
      />
    )
    const inputElement = screen.getByRole('combobox')
    expect(inputElement).toHaveAttribute('readonly')
  })
})
