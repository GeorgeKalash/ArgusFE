import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { useForm } from 'src/hooks/form'

export default function AssignCorrespondentForm({ maxAccess, labels, outwardsList, refetch, window }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      corId: ''
    },
    enableReinitialize: true,
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
    <FormShell
      form={formik}
      isInfo={false}
      isCleared={false}
      isSavedClear={false}
      maxAccess={maxAccess}
      resourceId={ResourceIds.CorrespondentOutwards}
    >
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
    </FormShell>
  )
}
