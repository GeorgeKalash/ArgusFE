import { Button } from '@mui/material'
import { useState } from 'react'
import { FormDataGrid } from 'src/components/Shared/FormDataGrid'

async function getRate() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(14.2)
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
              const rate = await getRate()
              console.log(rate)
              update({
                rate
              })
            }
          },
          {
            component: 'textfield',
            name: 'rate'
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
            name: 'lcAmount'
          }
        ]}
      />
    </>
  )
}
