import { useContext } from 'react'
import { useError } from 'src/error'
import documentType from 'src/lib/docRefBehaivors'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'

export function useDocumentTypeAdd({ functionId, stackObj }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

  const sectionAction = async () => {
    const general = await documentType(getRequest, functionId)
    if (!general?.errorMessage) {
      stack(stackObj)
    } else {
      stackError({ message: general?.errorMessage })
    }
  }

  return { sectionAction }
}

export default useDocumentTypeAdd
