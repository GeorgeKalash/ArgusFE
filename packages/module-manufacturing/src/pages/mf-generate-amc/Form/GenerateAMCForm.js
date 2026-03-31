import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function GenerateAMCForm({ access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const handleSubmit = async () => {
    await postRequest({
      extension: ManufacturingRepository.GenerateAMC.generate,
      record: JSON.stringify({})
    })

    toast.success(platformLabels.Generated)
  }
  

  const actions = [
    {
      key: 'generate',
      condition: true,
      onClick: () => handleSubmit(),
      disabled: false
    }
  ]

  return (
    <Form actions={actions} maxAccess={access} isSaved={false} >
    </Form>
  )
}
