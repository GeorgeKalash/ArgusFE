import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker.js'

describe('custom date picker', () => {
  it('should render the date picker', () => {
    render(<CustomDatePicker label='Test Date' />)

    const dateInput = screen.getByRole('textbox')
    expect(dateInput).toBeInTheDocument()
  })
  it('should handle value change correctly', () => {
    const handleChange = jest.fn()
    render(
      <CustomDatePicker name='testDate' label='Test Date' value={new Date('2024-03-20')} onChange={handleChange} />
    )

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: '2024-03-21' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('should handle disabled state', () => {
    render(<CustomDatePicker label='Test Date' disabled={true} />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should call onChange with correct date value when the date is changed', () => {
    const handleChange = jest.fn()
    const testDate = new Date('2024-03-20')
    const newDate = '03/21/2024'

    render(<CustomDatePicker name='testDate' label='Test Date' value={testDate} onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: newDate } })

    const [[, actualDate]] = handleChange.mock.calls

    expect(handleChange).toHaveBeenCalledWith('testDate', expect.any(Date))
    expect(actualDate.toISOString().split('T')[0]).toBe('2024-03-21')
  })
})
