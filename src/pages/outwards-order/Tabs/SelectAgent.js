import { Grid } from '@mui/material'
import React from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

export default function SelectAgent({ labels, maxAccess, productId, setData, window }) {
  const { formik } = useForm({
    initialValues: {
      agentId: null,
      agentName: ''
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    onSubmit: async obj => {
      setData(obj.agentName, productId)
      window.close()
    }
  })

  return (
    <FormShell form={formik} isCleared={false} infoVisible={false}>
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid xs={12}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.CorrespondentAgents.qry}
                name='agentId'
                label={labels.Agent}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('agentId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('agentName', newValue ? newValue.name : '')
                }}
                maxAccess={maxAccess}
                error={formik.touched.agentId && Boolean(formik.errors.agentId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
