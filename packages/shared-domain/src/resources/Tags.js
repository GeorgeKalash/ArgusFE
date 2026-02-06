import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'
import FlightIcon from '@mui/icons-material/Flight'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import ScheduleIcon from '@mui/icons-material/Schedule'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import TimelapseIcon from '@mui/icons-material/Timelapse'

export const iconMap = {
  person: PersonIcon,
  business: BusinessIcon,
  flight: FlightIcon,
  money: MoneyIcon,
  schedule: ScheduleIcon,
  sentiment_very_dissatisfied: SentimentVeryDissatisfiedIcon,
  timelapse: TimelapseIcon
}

export const tagGroups = [
  {
    type: 'employee',
    icon: iconMap['person'],
    tags: [
      'emp_fullName',
      'emp_firstName',
      'emp_lastName',
      'emp_birthDate',
      'emp_nationality',
      'emp_idRef',
      'emp_mobile',
      'emp_workMail',
      'emp_hireDate',
      'emp_department',
      'emp_branch',
      'emp_position',
      'emp_employmentStatus',
      'emp_salary',
      'emp_salary_text'
    ]
  },
  {
    type: 'admin_affair',
    icon: iconMap['business'],
    tags: [
      'pay_fromDate',
      'pay_toDate',
      'pay_basicSalary',
      'pay_entitlements',
      'pay_deductions',
      'pay_netSalary',
      'pay_companySS',
      'pay_employeeSS',
      'pay_url'
    ]
  },
  {
    type: 'leave',
    icon: iconMap['flight'],
    tags: [
      'leave_startDate',
      'leave_endDate',
      'leave_url',
      'leave_employeeName',
      'leave_justification',
      'leave_destination',
      'leave_leaveType',
      'leave_approveUrl',
      'reject_url',
      'replacement_employee'
    ]
  },
  {
    type: 'loan',
    icon: iconMap['money'],
    tags: ['loan_date', 'loan_amount', 'loan_url']
  },
  {
    type: 'schedule',
    icon: iconMap['schedule'],
    tags: ['ta_sched_startDate', 'ta_sched_endDate', 'ta_sched_url']
  },
  {
    type: 'penalty',
    icon: iconMap['sentiment_very_dissatisfied'],
    tags: ['penalty_date', 'penalty_amount', 'penalty_url']
  },
  {
    type: 'time_variations',
    icon: iconMap['timelapse'],
    tags: ['tv_timeCode', 'tv_date', 'tv_duration', 'tv_url']
  }
]