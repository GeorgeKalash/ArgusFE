export const DISABLED = 1

export const MANDATORY = 2

export const FORCE_ENABLED = 3

export const HIDDEN = 4

export function accessLevel({ maxAccess, name }) {
  const { accessLevel } = (maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  return accessLevel
}
