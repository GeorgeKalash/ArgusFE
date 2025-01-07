import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'
import { TrxType } from 'src/resources/AccessLevels'

const checkAccess = (name, maxAccess, required, readOnly, hidden, disabled) => {
  const generalMaxAccess = maxAccess && maxAccess.record?.maxAccess

  const { accessLevel } = (maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const isReadOnly =
    accessLevel === DISABLED || (readOnly && accessLevel !== MANDATORY && accessLevel !== FORCE_ENABLED)

  const _readOnly = maxAccess?.editMode
    ? generalMaxAccess < TrxType.EDIT || isReadOnly
    : generalMaxAccess < TrxType.ADD || isReadOnly

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const _required = (required && !_readOnly) || (readOnly && required) || accessLevel === MANDATORY

  const _disabled = disabled || accessLevel === DISABLED

  return { _readOnly, _required, _hidden, _disabled }
}

export { checkAccess }
