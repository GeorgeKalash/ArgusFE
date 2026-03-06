import { useOpenResource } from "@argus/shared-hooks/src/hooks/useOpenResource"

export default function ValueLinkCell({ value, colDef, data }) {
  const openResource = useOpenResource()
  const valueLink = colDef.valueLink

  if (!value || !valueLink?.resourceId) return value

  return (
    <span
      style={{
        color: '#1976d2',
        textDecoration: 'underline',
        cursor: 'pointer'
      }}
      onClick={e => {
        e.stopPropagation()
        openResource(valueLink.resourceId, {
          props: typeof valueLink.props === 'function'
            ? valueLink.props(data)
            : valueLink.props
        })
      }}
    >
      {value}
    </span>
  )
}
