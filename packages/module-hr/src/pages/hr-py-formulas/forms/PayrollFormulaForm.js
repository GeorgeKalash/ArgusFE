import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import FormulaEditor from '@argus/shared-ui/src/components/Shared/FormulaEditor'
import { validateFormula } from '@argus/shared-utils/src/utils/ValidateFormula'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'

export default function PayrollFormulaForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)
  const [variables, setVariables] = useState([])
  const [constants, setConstants] = useState([])

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.Formula.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      name: '',
      formula: ''
    },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required(),
      formula: yup
        .string()
        .required()
        .test('valid-formula', function (value) {
          const error = validateFormula(value, variables, constants);  

          if (error) {
            return this.createError({ message: error });
          }

          return true;
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: PayrollRepository.Formula.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: PayrollRepository.Formula.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res?.record)
      }
      const res2 = await getRequest({
        extension: PayrollRepository.Formula.getPack,
        parameters: ``
      })

      setVariables(res2?.record?.variables);
      setConstants(res2?.record?.constants);
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PayrollFormulas} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <FieldSet title={labels.formula}>
                <FormulaEditor
                  name='formula'
                  value={formik.values.formula}
                  onChange={formik.setFieldValue}
                  onBlur={formik.setFieldTouched}
                  variables={variables}
                  constants={constants}
                  error={formik.errors.formula}
                  touched={formik.touched.formula}
                />
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

