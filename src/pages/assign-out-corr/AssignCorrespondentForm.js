import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

export default function AssignCorrespondentForm({ maxAccess, labels, outwardsList, window }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    initialValues: {
      corId: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required('Country ID is required')
    }),
    onSubmit: async obj => {
      try {
        const data = {
          corId: obj.corId,
          outwards: outwardsList
        }

        await postRequest({
          extension: RemittanceOutwardsRepository.CorrespondentOutwards.set,
          record: JSON.stringify(data)
        })

        toast.success(platformLabels.Updated)
        window.close()
      } catch (error) {}
    }
  })

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isCleared={false}
      isSavedClear={false}
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
