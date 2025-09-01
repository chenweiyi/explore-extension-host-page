import withSuspense from '@src/shared/hoc/withSuspense'
import { ITask } from './Gantt'

type IAnalysisProps = {
  tasks: ITask[]
  clickTask: (t: ITask) => void
}

const TaskList = (props: IAnalysisProps) => {
  return props.tasks.length > 0 ? (
    <ul className='pl-20px list-circle'>
      {props.tasks.map((t, i) => (
        <li
          key={i}
          className='py-12px px-4px cursor-pointer hover:bg-[rgb(90,238,198,0.35)] rounded-4px'
          onClick={() => props.clickTask(t)}
        >
          <div
            className='text-16px font-semibold custom-ellipsis'
            title={t.name}
          >
            {t.link ? (
              <a href={t.link} target='_blank' rel='noreferrer'>
                {t.name}
              </a>
            ) : (
              t.name
            )}
          </div>
          {t.desc ? (
            <div className='text-12px text-gray-400 w-full text-wrap my-4px'>
              {t.desc}
            </div>
          ) : null}
          <div className='text-12px'>
            <span>{dayjs(t.startTime).format('YYYY-MM-DD')}</span>
            <span> -- </span>
            <span>{dayjs(t.endTime).format('YYYY-MM-DD')}</span>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <div className='pl-40px pt-14px'>{t('no_data')}</div>
  )
}

const Analysis = (props: IAnalysisProps) => {
  const [tabItems, setTabItems] = useState([])

  const _tabItems = [
    {
      key: 'doing',
      label: t('doing'),
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('doing'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'blocking',
      label: t('blocking'),
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('blocking'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'coming-soon',
      label: t('coming_soon'),
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('coming-soon'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'expiring-soon',
      label: t('expiring_soon'),
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('expiring-soon'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'expired',
      label: t('expired'),
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('expired'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'unstart',
      label: t('unstart'),
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('unstart'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'delay',
      label: t('delay'),
      children: (
        <TaskList
          tasks={props.tasks.filter((t) => t.status.includes('delay'))}
          clickTask={props.clickTask}
        />
      )
    },
    {
      key: 'done',
      label: t('done'),
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
    <div className='w-full h-full'>
      <ATabs
        items={tabItems}
        defaultActiveKey='doing'
        tabPosition='left'
      ></ATabs>
    </div>
  )
}

export default withSuspense(Analysis)
