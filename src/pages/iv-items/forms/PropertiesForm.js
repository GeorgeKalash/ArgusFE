import { useState, useContext, useEffect } from 'react'
import { useWindow } from 'src/windows'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import * as yup from 'yup'

import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useForm } from 'src/hooks/form.js'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const PropertiesForm = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { _msId } = store
  const { measurementId } = store
  const { priceGroupId } = store
  const { returnPolicy } = store

  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const [check, setCheck] = useState(false)
  const [firstCurr, setFirstCurr] = useState(false)
  useEffect(() => {
    if (recordId) {
      const fetchCurrency = async () => {
        try {
          const response = await getRequest({
            extension: InventoryRepository.Currency.qry,
            parameters: `&_itemId=${recordId}`
          })
          if (response.list && response.list.length > 0) {
            setFirstCurr(response.list[0].currencyId)
          }
        } catch (error) {}
      }

      fetchCurrency()
    }
  }, [])

  const { formik } = useForm({
    initialValues: {
      currencyId: firstCurr || '',
      defSaleMUId: measurementId || '',
      pgId: priceGroupId || '',
      returnPolicyId: returnPolicy || ''
    },

    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const submissionData = {
        ...formikInitial,
        defSaleMUId: formik.values.defSaleMUId,
        pgId: formik.values.pgId,
        returnPolicyId: formik.values.returnPolicyId
      }
      console.log(formik.values.returnPolicyId, 'policy')

      const response = await postRequest({
        extension: InventoryRepository.Items.set,
        record: JSON.stringify(submissionData)
      })
    }
  })

  async function fetchGridData() {
    if (formik.values.currencyId) {
      const response = await getRequest({
        extension: SaleRepository.Sales.qry,
        parameters: `&_itemId=${recordId}&_currencyId=${formik.values.currencyId}`
      })

      return response
    }
  }

  useEffect(() => {
    if (formik.values.currencyId) {
      ;(async () => {
        const data = await fetchGridData(formik.values.currencyId)

        refetch()
      })()
    }
  }, [formik.values.currencyId])

  return (
    <FormShell form={formik} resourceId={ResourceIds.Items} maxAccess={maxAccess} infoVisible={false}>
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <CustomTextField
                  name='posMsg'
                  label={labels.messageToOperator}
                  value={formik.values.posMsg}
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('posMsg', '')}
                  error={formik.errors && Boolean(formik.errors.posMsg)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.RT_PROD_ACCESS_LEVEL}
                  name='accessLevel'
                  label={labels.accessLevel}
                  required
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('accessLevel', newValue?.key)
                  }}
                  error={formik.touched.accessLevel && Boolean(formik.errors.accessLevel)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PropertiesForm
