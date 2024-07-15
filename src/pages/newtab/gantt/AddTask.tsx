import withSuspense from '@src/shared/hoc/withSuspense'
import { IOriTask } from '../Calendar'

type IAddTaskProps = {
  allTasks: IOriTask[]
  addTask: (tasks: IOriTask) => void
}

const AddTask = (props: IAddTaskProps) => {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const rules = {
    name: [
      {
        required: true,
        message: '请输入任务名称',
        trigger: 'blur'
      },
      {
        validator: (_, value, callback) => {
          if (props.allTasks.find((t) => t.name === value)) {
            callback('任务名称重复')
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    timescope: [
      {
        required: true,
        message: '请选择任务周期'
      }
    ]
  }

  const onTimeScopeChange = (dates: any) => {
    if (dates) {
      const startTime = dates[0]
      const endTime = dates[1].endOf('day') // endTime被设置为该日期的最后一秒

      console.log(
        startTime.format('YYYY-MM-DD HH:mm:ss'),
        endTime.format('YYYY-MM-DD HH:mm:ss')
      )
      setStartTime(startTime.format('YYYY-MM-DD HH:mm:ss'))
      setEndTime(endTime.format('YYYY-MM-DD HH:mm:ss'))
    }
  }

  const onFinish = (value: any) => {
    console.log(value)
    props.addTask({
      name: value.name,
      color: value.color,
      startTime: dayjs(startTime).toDate(),
      endTime: dayjs(endTime).toDate(),
      link: value.link,
      desc: value.desc
    })
  }

  return (
    <div className='w-500px h-400px'>
      <AForm
        name='addTask'
        labelCol={{ span: 5 }}
        labelAlign='left'
        onFinish={onFinish}
      >
        <AForm.Item label='任务名：' name='name' rules={rules.name}>
          <AInput placeholder='请输入任务名称' />
        </AForm.Item>
        <AForm.Item label='任务周期：' name='timescope' rules={rules.timescope}>
          <ADatePicker.RangePicker
            format='YYYY-MM-DD'
            onChange={onTimeScopeChange}
          />
        </AForm.Item>
        <AForm.Item label='任务颜色：' name='color'>
          <AColorPicker />
        </AForm.Item>
        <AForm.Item label='任务链接：' name='link'>
          <AInput placeholder='请输入任务链接, 例如：https://www.baidu.com' />
        </AForm.Item>
        <AForm.Item label='任务描述：' name='desc'>
          <AInput.TextArea placeholder='请输入任务描述' />
        </AForm.Item>
        <AForm.Item wrapperCol={{ span: 14, offset: 5 }}>
          <AButton type='primary' htmlType='submit'>
            创建任务
          </AButton>
        </AForm.Item>
      </AForm>
    </div>
  )
}

export default withSuspense(AddTask)
