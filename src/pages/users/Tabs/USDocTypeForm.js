import { Grid, Table } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const USDocTypeForm = ({ labels, maxAccess, storeRecordId, functionId, window }) => {
  const editMode = !!storeRecordId

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      userId: '',
      functionId: '',
      dtId: '',
      sfName: '',
      dtName: ''
    },
    onSubmit: obj => {}
  })

  const columns = [
    {
      field: 'reference',
      headerName: '',
      flex: 2
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 2
    }
  ]
  useEffect(() => {
    ;(async function () {
      if (storeRecordId) {
        const res = await getRequest({
          extension: SystemRepository.UserFunction.get,
          parameters: `_userId=${storeRecordId}&_functionId=${functionId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [storeRecordId])

  return (
    <FormShell resourceId={ResourceIds.Users} form={formik} maxAccess={maxAccess} editMode={!!storeRecordId}>
      <VertLayout>
        <Fixed>
          <Grid item xs={6}>
            <ResourceComboBox
              endpointId={SystemRepository.DocumentType.qry}
              parameters={`_dgId=${functionId}&_startAt=${0}&_pageSize=${50}`}
              filter={!editMode ? item => item.activeStatus === 1 : undefined}
              name='dtId'
              label={labels.docType}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={async (event, newValue) => {
                formik.setFieldValue('dtId', newValue?.recordId)
              }}
              error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              maxAccess={maxAccess}
            />
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={{ list: [] }}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={maxAccess}
            pagination={false}
            checkTitle={labels.active}
            showCheckboxColumn={true}
            viewCheckButtons={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default USDocTypeForm
