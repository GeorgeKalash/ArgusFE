import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { PointofSaleRepository } from '@argus/repositories/src/repositories/PointofSaleRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { Grid } from '@mui/material'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

const POSInquiryForm = ({ labels, access, record }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
      query: { data },
    } = useResourceQuery({
      queryFn: fetchGridData,
      endpointId: PointofSaleRepository.POSInquiry.qry304,
      datasetId: ResourceIds.POSInquiry
    })
  
    const columns = [
      {
        field: 'itemRef',
        headerName: labels.itemRef,
        flex: 1
      },
      {
        field: 'qty',
        headerName: labels.qty,
        flex: 0.5,
        type: 'number'
      },
      {
        field: 'unitPrice',
        headerName: labels.unitPrice,
        flex: 1,
        type: 'number'
      },
      {
        field: 'markdown',
        headerName: labels.markdown,
        flex: 1,
        type: 'number'
      },
      {
        field: 'vatAmount',
        headerName: labels.vatAmount,
        flex: 1,
        type: 'number'
      },
      {
        field: 'vatPercentage',
        headerName: labels.vatPercentage,
        flex: 1,
        type: 'number'
      },
      {
        field: 'netPrice',
        headerName: labels.netPrice,
        flex: 1,
        type: 'number'
      },
      {
        field: 'extendedPrice',
        headerName: labels.extendedPrice,
        flex: 1,
        type: 'number'
      }
    ]
  
    async function fetchGridData() {
      const res = await getRequest({
        extension: PointofSaleRepository.POSInquiry.qry304,
        parameters: `&_documentTypeId=${record.documentTypeId}&_documentRef=${record.documentRef}`
      })
  
      return res
    }
  
    return (
      <VertLayout>
        <Fixed>        
          <Grid container spacing={2} p={2}>
            <Grid item xs={3}>
              <CustomTextField
                name='businessDayId'
                label={labels.businessDayId}
                value={record.businessDayId}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='documentRef'
                label={labels.documentRef}
                value={record.documentRef}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='posMachineRef'
                label={labels.posMachineRef}
                value={record.posMachineRef}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='customerRef'
                label={labels.customerRef}
                value={record.customerRef}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomDatePicker
                name='createdDate'
                label={labels.createdDate}
                value={record.createdDate}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={record.amount}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='tradeDiscount'
                label={labels.tradeDiscount}
                value={record.tradeDiscount}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='tradeDiscountAmount'
                label={labels.tradeDiscountAmount}
                value={record.tradeDiscountAmount}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomCheckBox
                name='isClosed'
                value={record.isClosed}
                readOnly
                label={labels.isClosed}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomCheckBox
                name='isVoid'
                value={record.isVoid}
                readOnly
                label={labels.isVoid}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomCheckBox
                name='isCancelled'
                value={record.isCancelled}
                readOnly
                label={labels.isCancelled}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name="inquiryDetails"
            columns={columns}
            gridData={data}
            rowId={['documentTypeId', 'documentRef']}
            pagination={false}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    )
  }

export default POSInquiryForm
