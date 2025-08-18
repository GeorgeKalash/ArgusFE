import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import Table from 'src/components/Shared/Table'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function CatalogueForm({ labels, maxAccess, record }) {
  const { getRequest } = useContext(RequestsContext)
  const { recordId, itemId, name, sku } = record

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      itemId,
      name,
      sku,
      data: []
    },
    maxAccess,
    validateOnChange: true
  })

  useEffect(() => {
    ;(async function () {
      if (itemId) {
        const res = await getRequest({
          extension: InventoryRepository.Availability.qry,
          parameters: `_siteId=${0}&_itemId=${itemId}&_startAt=0&_pageSize=1000`
        })

        if (res && res?.list) {
          res.list = res?.list?.map(item => ({
            ...item,
            committed: item?.committed ?? 0,
            ordered: item?.ordered ?? 0,
            onhand: parseFloat(item?.onhand).toFixed(3) ?? 0
          }))
        }

        formik.setValues({
          data: res,
          recordId,
          itemId,
          name,
          sku
        })
      }
    })()
  }, [])

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.siteName,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: labels.siteReference,
      flex: 1
    },
    {
      field: 'categoryRef',
      headerName: labels.category,
      flex: 1
    },
    {
      field: 'categoryName',
      headerName: labels.categoryName,
      flex: 1
    },
    {
      field: 'onhand',
      headerName: labels.onHand,
      flex: 1,
      type: 'number'
    },
    {
      field: 'committed',
      headerName: labels.committed,
      flex: 1,
      type: 'number'
    },
    {
      field: 'ordered',
      headerName: labels.ordered,
      flex: 1,
      type: 'number'
    }
  ]

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Catalogue}
      form={formik}
      maxAccess={maxAccess}
      editMode={true}
      infoVisible={false}
      actions={actions}
      isInfo={false}
      isCleared={false}
      isSaved={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CustomTextField
                name='sku'
                label={labels.sku}
                value={formik?.values?.sku}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={8}></Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='name'
                label={labels.itemName}
                value={formik?.values?.name}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name={'catalogueTable'}
            columns={columns}
            gridData={formik.values.data}
            rowId={['recordId']}
            pagination={false}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
