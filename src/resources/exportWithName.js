export function exportWithName(component, { width, height }) {
  component.width = width
  component.height = height

  return component
}
