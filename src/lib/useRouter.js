import { useRouter } from 'next/router'
import { useState } from 'react'

export const Router = () => {
  const router = useRouter()

  const [value, setValue] = useState(router.query)

  return value
}
