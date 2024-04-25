import React from 'react'
import FormShell from './FormShell'

const RecordRemarksForm = () => {
  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      accessLevel: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: AccessControlRepository.AuthorizationResourceGlobal.set,
        record: JSON.stringify(obj)
      })

      toast.success('Record Edited Successfully')
      invalidate()
    }
  })

  return (
    <FormShell form={formik} res>
      RecordRemarksForm
    </FormShell>
  )
}

export default RecordRemarksForm
