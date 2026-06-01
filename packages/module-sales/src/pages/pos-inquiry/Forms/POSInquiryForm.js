import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { PointofSaleRepository } from '@argus/repositories/src/repositories/PointofSaleRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import Table from '@argus/shared-ui/src/components/Shared/Table'

const POSInquiryForm = ({ labels, access, documentTypeId, documentRef }) => {
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
        flex: 1,
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
        parameters: `&_documentTypeId=${documentTypeId}&_documentRef=${documentRef}`
      })
  
      return res
    }
  
    return (
      <VertLayout>
        <Grow>
          <Table
            columns={columns}
            gridData={data}
            rowId={['itemId']}
            pagination={false}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    )
  }

export default POSInquiryForm
