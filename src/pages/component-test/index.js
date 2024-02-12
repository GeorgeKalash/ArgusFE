import { Button } from '@mui/material'
import { useState } from 'react'
import { FormDataGrid } from 'src/components/Shared/FormDataGrid'

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
      <Button
        onClick={() => {
          setRows([
            ...rows,
            {
              id: 2
            }
          ])
        }}
      >
        Change
      </Button>
      <FormDataGrid
        onChange={setRows}
        value={rows}
        columns={[
          {
            component: 'resourcecombobox',
            name: 'currencyId',
            async onChange({ row: { update, values } }) {
              const rate = await getRate({ currencyId: values.currencyId })
              console.log(rate)
              update({
                rate
              })
            }
          },
          {
            component: 'textfield',
            name: 'rate',
            editable: false
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
            editable: false
          }
        ]}
      />
    </>
  )
}
