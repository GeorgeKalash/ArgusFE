import React, { useContext, useState, useEffect } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { useFormik } from 'formik'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceLookup } from './ResourceLookup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from './Layouts/Fixed'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import ResourceComboBox from './ResourceComboBox'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import FormShell from './FormShell'
import CustomButton from '../Inputs/CustomButton'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from './DataGrid'
import * as yup from 'yup'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function AccountSummary({ clientInfo, moduleId }) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [columns, setColumns] = useState([])

  const formik = useFormik({
    initialValues: {
      clientId: clientInfo?.clientId,
      clientRef: clientInfo?.clientRef,
      clientName: clientInfo?.clientName,
      agpId: null,
      moduleId,
      accSum: [{ id: 1 }]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      agpId: yup.number().required()
    })
  })

  async function getDynamicColumns() {
    let currencyItems

    const currecnyList = await getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: `_filter=`
    })
    if (moduleId == 1) currencyItems = currecnyList?.list?.map(currency => currency.sale)
    else if (moduleId == 2) currencyItems = currecnyList?.list?.map(currency => currency.purchase)

    const agingLegList = await getRequest({
      extension: FinancialRepository.AgingLeg.qry,
      parameters: `_agpId=9`
    })

    let listObject = agingLegList?.list?.map(item => {
      const obj = new Array(currencyItems.length + 2).fill(0)
      obj[0] = null
      obj[1] = item.days

      return obj
    })
    console.log('listObject', listObject)
  }

  useEffect(() => {
    getDynamicColumns()
  }, [])

  const {
    query: { data },
    labels,
    access,
    refetch
  } = useResourceQuery({
    datasetId: ResourceIds.AccountSummary
  })

  return (
    <FormShell
      resourceId={ResourceIds.AccountSummary}
      form={formik}
      maxAccess={access}
      editMode={true}
      isSaved={false}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                name='clientId'
                label={labels.account}
                valueField='reference'
                displayField='name'
                valueShow='clientRef'
                secondValueShow='clientName'
                form={formik}
                readOnly
                required
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={FinancialRepository.AgingProfile.qry}
                parameters={`_startAt=0&_pageSize=1000&filter=`}
                name='agpId'
                label={labels.agingProfile}
                values={formik.values}
                valueField='recordId'
                displayField={'name'}
                maxAccess={access}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('agpId', newValue?.recordId || null)
                }}
                error={formik?.touched?.agpId && Boolean(formik.errors?.agpId)}
              />
            </Grid>
            <Grid item xs={8}>
              <ResourceComboBox
                datasetId={DataSets.FI_AGING_MODULE}
                label={labels.module}
                name='moduleId'
                values={formik.values}
                valueField='key'
                displayField='value'
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomButton onClick={refetch} image={'preview.png'} tooltipText={platformLabels.Preview} />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            name='AccountSummary'
            maxAccess={access}
            onChange={value => formik.setFieldValue('accSum', value)}
            value={formik.values?.accSum}
            error={formik.errors?.accSum}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
