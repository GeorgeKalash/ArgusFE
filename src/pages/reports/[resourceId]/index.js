// ** NEXT IMPORTS
import { useRouter } from 'next/router'

// ** COMPONENTS IMPORTS
import ReportViewer from 'src/components/Shared/ReportViewer'

const Reports = () => {
  const router = useRouter()

  const { resourceId } = router.query

  return <ReportViewer resourceId={resourceId} />
}

export default Reports

export async function getServerSideProps(context) {
  const { params } = context
  const { resourceId } = params

  var pageTitle
  switch (resourceId) {
    case '41403':
      pageTitle = 'test report'
      break

    default:
      pageTitle = 'report page'
      break
  }

  return {
    props: {
      pageTitle: pageTitle
    } // will be passed to the page component as props
  }
}
