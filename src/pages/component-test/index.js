import { useState } from 'react'
import { FormDataGrid } from 'src/components/Shared/FormDataGrid'
import { SystemRepository } from 'src/repositories/SystemRepository'

async function getRate({ currencyId }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (currencyId === 2) resolve(14.2)
      else if (currencyId == 162) resolve(2)
      else reject()
    }, 1000)
  })
}

export default function Page() {
  const [rows, setRows] = useState([
    {
      id: 1
    }
  ])

  console.log(rows)

  return (
    <>
      <FormDataGrid
        onChange={setRows}
        value={rows}
        columns={[
          {
            component: 'resourcecombobox',
            name: 'currency',
            props: {
              endpointId: SystemRepository.Currency.page,
              parameters: `_startAt=0&_pageSize=10000&filter=`,
              valueFiel: 'recordId',
              displayField: 'reference'
            },
            async onChange({ row: { update, values } }) {
              const rate = await getRate({ currencyId: values.currency.recordId })

              update({
                rate
              })
            }
          },
          {
            component: 'textfield',
            name: 'rate',
            props: {
              readOnly: true
            }
          },
          {
            component: 'textfield',
            name: 'fcAmount',
            async onChange({ row: { update, values } }) {
              update({
                lcAmount: parseFloat(values.rate) * parseFloat(values.fcAmount)
              })
            }
          },
          {
            component: 'textfield',
            name: 'lcAmount',
            props: {
              readOnly: true
            }
          }
        ]}
      />
    </>
  )
}
