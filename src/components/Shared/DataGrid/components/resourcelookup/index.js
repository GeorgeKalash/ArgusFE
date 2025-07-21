import { useEffect } from 'react'
import edit from './edit'
import { checkAccess } from 'src/lib/maxAccess'

const ViewComponent = ({ column: { props, name }, data, value, setFieldValidation, gridName }) => {
  const fullName = `${gridName}.${name}`
  const { _required, _hidden } = checkAccess(fullName, props.maxAccess, props.required, props.readOnly, props.hidden)

  useEffect(() => {
    if (typeof setFieldValidation === 'function') {
      setFieldValidation(prev => {
        const existing = prev?.[fullName]

        const next = {
          required: _required && !_hidden
        }

        const isEqual = existing?.required === next.required

        return isEqual ? prev : { ...prev, [fullName]: next }
      })
    }
  }, [setFieldValidation, _required, _hidden])

  let changes = props?.mapping
    ? props?.mapping
        ?.map(({ from, to }) => ({
          [from]: data && data.hasOwnProperty(to) ? data[to] : ''
        }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
    : value

  return changes?.[props?.displayField]
}

export default {
  view: ViewComponent,
  edit
}
