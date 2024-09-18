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
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'

const PropertiesForm = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const { platformLabels } = useContext(ControlContext)

  const [dimensions, setDimensions] = useState([])

  useEffect(() => {
    if (recordId) {
      const fetchDimension = async () => {
        try {
          const response = await getRequest({
            extension: SystemRepository.Defaults.qry,
            parameters: `_filter=`
          })
          const ivcount = response.list.find(item => item.key === 'ivtDimCount')
          console.log(ivcount?.value, 'ivcount')

          const filteredDimensions = response.list.filter(
            item => item.key.includes('ivtDimension') && item.value.length > 0
          )
          setDimensions(filteredDimensions)

          console.log(filteredDimensions, 'ivtDimensions')
        } catch (error) {
          console.error('Error fetching dimensions:', error)
        }
      }

      fetchDimension()
    }
  }, [])

  const { formik } = useForm({
    initialValues: {},

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
            {dimensions.map((dimension, index) => {
              const dimensionNumber = dimension.key.match(/\d+$/)?.[0] || ''

              return (
                <Grid container rowGap={2} sx={{ px: 2 }} key={index}>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.Dimension.qry}
                      parameters={`_dimension=${dimensionNumber}`}
                      name={`dimensions.${dimension.key}`}
                      label={dimension.value || `Dimension ${index + 1}`}
                      required
                      valueField='recordId'
                      displayField='name'
                      values={formik.values[`${dimension.key}`] || ''}
                      onChange={(event, newValue) => {
                        formik.setFieldValue(`${dimension.key}`, newValue?.name)
                      }}
                      error={
                        formik.touched[`dimensions.${dimension.key}`] &&
                        Boolean(formik.errors[`dimensions.${dimension.key}`])
                      }
                    />
                  </Grid>
                </Grid>
              )
            })}
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PropertiesForm
