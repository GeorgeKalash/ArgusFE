import ReportViewer from '@argus/shared-ui/src/components/Shared/ReportViewer'
import { Router } from '@argus/shared-domain/src/lib/useRouter'

const Reports = () => {
  const { resourceId } = Router()

  return <ReportViewer resourceId={resourceId} />
}

export default Reports

// export async function getServerSideProps(context) {
//   const { params } = context
//   const { resourceId } = params

//   var pageTitle
//   switch (resourceId) {
//     case '41401':
//       pageTitle = 'items list'
//       break

//     default:
//       pageTitle = 'report page'
//       break
//   }

//   return {
//     props: {
//       pageTitle: pageTitle
//     } // will be passed to the page component as props
//   }
// }
