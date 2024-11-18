import { useContext } from 'react'
import { CurrentWindowContext, RequestsLoadingContext } from 'src/pages/_app'

const ChildComponent = ({ Component, props, closeWindowById }) => {
  const { updateCurrentWindowId, currentWindowId } = useContext(CurrentWindowContext)
  const { isLoadingRequests } = useContext(RequestsLoadingContext)

  updateCurrentWindowId(Component.name)

  return (
    <>
      {(Object.keys(isLoadingRequests).includes(Component.name) || currentWindowId === Component.name) && (
        <Component {...props} window={{ close: closeWindowById }} />
      )}
    </>
  )
}

export default ChildComponent
