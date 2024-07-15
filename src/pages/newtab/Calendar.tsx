import withSuspense from '@src/shared/hoc/withSuspense'
import Gantt, { ITask } from './gantt/Gantt'
import Toolbox from './gantt/Toolbox'
import AddTask from './gantt/AddTask'
import Analysis from './gantt/Analysis'

export type IShowType = 'add' | 'analysis' | ''
export type IOriTask = Omit<ITask, 'children' | 'level' | 'status'> & {
  color?: string
  link?: string
  desc?: string
}

const colors = [
  '#5B8FF9',
  '#E8684A',
  '#9270CA',
  '#269A99',
  '#BEDED1',
  '#EFE0B5',
  '#B5D7E5',
  '#F4DBC6',
  '#F2CADA'
]
const activeColor = '#95d475'
const defaultBlockColor = '#e9e9eb'

// const tasks: ITask[] = [
//   {
//     name: 'task1',
//     color: colors[0],
//     startTime: dayjs('2024-07-01').toDate(),
//     endTime: dayjs('2024-07-04').toDate(),
//     level: 0,
//     status: ['done'],
//     children: [
//       {
//         startTime: dayjs('2024-07-01').toDate(),
//         endTime: dayjs('2024-07-03').toDate(),
//         type: 'start',
//         level: 0,
//         name: 'task1-0',
//         pid: 'task1',
//         color: colors[0]
//       },
//       {
//         startTime: dayjs('2024-07-03').toDate(),
//         endTime: dayjs('2024-07-08').toDate(),
//         type: 'block',
//         level: 0,
//         name: 'task1-1',
//         pid: 'task1',
//         color: defaultBlockColor
//       },
//       {
//         startTime: dayjs('2024-07-08').toDate(),
//         endTime: dayjs('2024-07-09').toDate(),
//         type: 'end',
//         level: 0,
//         name: 'task1-2',
//         pid: 'task1',
//         color: colors[0]
//       }
//     ]
//   },
//   {
//     name: 'task2',
//     color: colors[1],
//     startTime: dayjs('2024-07-03').toDate(),
//     endTime: dayjs('2024-07-05').toDate(),
//     level: 1,
//     status: ['delay'],
//     children: [
//       {
//         startTime: dayjs('2024-07-03').toDate(),
//         endTime: dayjs('2024-07-04').toDate(),
//         type: 'start',
//         level: 1,
//         name: 'task2-0',
//         pid: 'task2',
//         color: colors[1]
//       },
//       {
//         startTime: dayjs('2024-07-04').toDate(),
//         endTime: dayjs('2024-07-07').toDate(),
//         type: 'block',
//         level: 1,
//         name: 'task2-1',
//         pid: 'task2',
//         color: defaultBlockColor
//       },
//       {
//         startTime: dayjs('2024-07-07').toDate(),
//         endTime: dayjs('2024-07-08').toDate(),
//         type: 'end',
//         level: 1,
//         name: 'task2-2',
//         pid: 'task2',
//         color: colors[1]
//       }
//     ]
//   },
//   {
//     name: 'task3',
//     color: colors[2],
//     startTime: dayjs('2024-07-04').toDate(),
//     endTime: dayjs('2024-07-07').toDate(),
//     level: 2,
//     status: ['done']
//   },
//   {
//     name: 'task4',
//     color: colors[3],
//     startTime: dayjs('2024-07-09').toDate(),
//     endTime: dayjs('2024-07-10').toDate(),
//     level: 0,
//     status: ['doing']
//   },
//   {
//     name: 'task5',
//     color: colors[4],
//     startTime: dayjs('2024-07-10').toDate(),
//     endTime: dayjs('2024-07-12').toDate(),
//     level: 0,
//     status: ['coming-soon']
//   }
// ]

// const tasks = []

const Calendar = () => {
  const [showType, setShowType] = useState<IShowType>('')
  const ganttRef = useRef(null)
  const [oriTasks, setOriTasks] = useState<IOriTask[]>([])
  const [tasks, setTasks] = useState<ITask[]>([])

  function clickTaskHandle(t) {
    ganttRef.current?.jumpToTask(t)
  }

  function addTask(t: IOriTask) {
    setOriTasks([...oriTasks, t])
  }

  function regenTasks(oriTasks: IOriTask[]) {
    const tasks: ITask[] = []
    return tasks
  }

  useEffect(() => {
    const tasks = regenTasks([...oriTasks])
    setTasks(tasks)
  }, [oriTasks])

  return (
    <div className='flex flex-wrap w-full h-full pl-120px pr-40px items-center justify-center'>
      <div className='calendar-container w-800px h-400px mr-150px relative'>
        <Gantt tasks={tasks} ref={ganttRef} />
        <Toolbox showType={showType} setShowType={setShowType} />
      </div>
      {showType === 'add' && <AddTask addTask={addTask} allTasks={oriTasks} />}
      {showType === 'analysis' && (
        <Analysis tasks={tasks} clickTask={clickTaskHandle} />
      )}
    </div>
  )
}

export default withSuspense(Calendar)
