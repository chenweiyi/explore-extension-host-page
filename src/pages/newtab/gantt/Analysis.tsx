import withSuspense from '@src/shared/hoc/withSuspense'
import { ITask } from './Gantt'

type IAnalysisProps = {
  tasks: ITask[]
  clickTask: (t: ITask) => void
}

const TaskList = (props: IAnalysisProps) => {
  return props.tasks.length > 0 ? (
    <ul>
      {props.tasks.map((t, i) => (
        <li
          key={i}
          className='py-8px px-4px cursor-pointer hover:bg-emerald-200'
          onClick={() => props.clickTask(t)}
        >
          <div className='text-14px'>{t.name}</div>
          <div className='text-12px text-gray-500'>
            <span>{dayjs(t.startTime).format('YYYY-MM-DD')}</span>
            <span> -- </span>
            <span>{dayjs(t.endTime).format('YYYY-MM-DD')}</span>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <div className='pl-40px pt-14px'>暂无数据</div>
  )
}

const Analysis = (props: IAnalysisProps) => {
  const [tabItems, setTabItems] = useState([])

  const _tabItems = [
    {
      key: 'doing',
      label: '正在进行',
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('doing'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'blocking',
      label: '阻塞中',
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('blocking'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'coming-soon',
      label: '即将开始',
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('coming-soon'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'expiring-soon',
      label: '即将过期',
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('expiring-soon'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'expired',
      label: '已过期',
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('expired'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'unstart',
      label: '未开始',
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('unstart'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'delay',
      label: '延期中',
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('delay'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'done',
      label: '已完成',
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('done'))}
          clickTask={props.clickTask}
        />
      )
    }
  ]

  useEffect(() => {
    setTabItems(_tabItems)
  }, [])

  return (
    <div className='w-500px h-400px'>
      <ATabs
        items={tabItems}
        defaultActiveKey='doing'
        tabPosition='left'
      ></ATabs>
    </div>
  )
}

export default withSuspense(Analysis)
