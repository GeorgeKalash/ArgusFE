import { useRouter } from 'next/router'

const Memos = () => {
  const router = useRouter()

  const { functionId } = router.query

  return (
    <div>
      <p>Function ID: {functionId}</p>
    </div>
  )
}

export default Memos
