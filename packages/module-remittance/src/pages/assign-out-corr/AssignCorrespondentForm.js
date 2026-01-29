import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function AssignCorrespondentForm({ maxAccess, labels, outwardsList, refetch, window }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      corId: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      corId: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = {
        corId: obj.corId,
        outwards: outwardsList
      }

      await postRequest({
        extension: RemittanceOutwardsRepository.CorrespondentOutwards.set,
        record: JSON.stringify(data)
      })
      refetch()
      toast.success(platformLabels.Updated)
      window.close()
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <ResourceLookup
          endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
          valueField='reference'
          displayField='name'
          name='corId'
          label={labels.correspondent}
          form={formik}
          required
          displayFieldWidth={2}
          valueShow='corRef'
          secondValueShow='corName'
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            formik.setFieldValue('corId', newValue ? newValue.recordId : '')
            formik.setFieldValue('corName', newValue ? newValue.name : '')
            formik.setFieldValue('corRef', newValue ? newValue.reference : '')
          }}
          error={formik.touched.corId && Boolean(formik.errors.corId)}
        />
      </VertLayout>
    </Form>
  )
}
