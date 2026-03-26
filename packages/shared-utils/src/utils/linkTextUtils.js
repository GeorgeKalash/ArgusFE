export const measureTextWidth = (text, inputEl, textMeasureEl) => {
  if (!textMeasureEl || !inputEl) return 0
  const style = window.getComputedStyle(inputEl)

  textMeasureEl.style.font = style.font
  textMeasureEl.style.letterSpacing = style.letterSpacing
  textMeasureEl.style.textTransform = style.textTransform
  textMeasureEl.textContent = text || ''

  return textMeasureEl.getBoundingClientRect().width
}

export const isClickOnText = ({ e, inputEl, textMeasureEl }) => {
  if (!inputEl) return false

  const valueText = (inputEl.value ?? '').toString()
  if (!valueText) return false

  const rect = inputEl.getBoundingClientRect()
  const clickX = e.clientX - rect.left

  const style = window.getComputedStyle(inputEl)
  const paddingLeft = parseFloat(style.paddingLeft || '0')
  const paddingRight = parseFloat(style.paddingRight || '0')

  const textWidth = measureTextWidth(valueText, inputEl, textMeasureEl)

  const textStart = paddingLeft
  const textEnd = rect.width - paddingRight
  const effectiveTextEnd = Math.min(textStart + textWidth, textEnd)

  return clickX >= textStart && clickX <= effectiveTextEnd
}