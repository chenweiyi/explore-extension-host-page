import withSuspense from '@src/shared/hoc/withSuspense'
import { IOriTask } from '../Calendar'
import { Form } from 'antd'

type IAddTaskProps = {
  addTask: (tasks: IOriTask) => boolean
}

const dateFormat = 'YYYY-MM-DD'

const AddTask = (props: IAddTaskProps) => {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [parallelTimes, setParallelTimes] = useState<string[]>([])
  const [form] = Form.useForm()
  const initialValues = {
    color: null
  }

  const rules = {
    name: [
      {
        required: true,
        message: '请输入任务名称',
        trigger: 'blur'
      },
      {
        validator: (rule, value, callback) => {
          if (value.includes(',')) {
            callback('任务名称不能包含逗号')
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    timescope: [
      {
        required: true,
        message: '请选择任务周期'
      },
      {
        validator: (rule, value, callback) => {
          if (dayjs(value[0]).isSame(dayjs(value[1]))) {
            callback('开始时间需小于结束时间')
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  }

  const onChangeRange = (dates: any) => {
    setStartTime(dayjs(dates[0]).format(dateFormat))
    setEndTime(dayjs(dates[1]).format(dateFormat))
  }

  const onChangeParallelTimes = (dates: any) => {
    setParallelTimes(dates.map((d) => dayjs(d).format(dateFormat)))
  }

  const onFinish = (value: any) => {
    console.log(value)
    const options = {
      name: value.name,
      color: value.color?.toHexString() ?? '',
      startTime: dayjs(value.timescope[0]).format(dateFormat),
      endTime: dayjs(value.timescope[1]).format(dateFormat),
      link: value.link,
      desc: value.desc,
      parallelTimes: parallelTimes
    }
    console.log('options:', options)
    const res = props.addTask(options)
    if (res) {
      form.resetFields()
    }
  }

  return (
    <div className='w-full h-full'>
      <AForm
        form={form}
        name='addTask'
        initialValues={initialValues}
        labelCol={{ span: 6 }}
        labelAlign='right'
        onFinish={onFinish}
      >
        <AForm.Item
          label='任务名：'
          name='name'
          rules={rules.name}
          validateFirst={true}
        >
          <AInput placeholder='请输入任务名称' />
        </AForm.Item>
        <AForm.Item
          label='任务周期：'
          name='timescope'
          rules={rules.timescope}
          validateFirst={true}
        >
          <ADatePicker.RangePicker
            className='w-full'
            format='YYYY-MM-DD'
            onChange={onChangeRange}
          />
        </AForm.Item>
        <AForm.Item label='并行时间：' name='parallelTimes'>
          <ADatePicker
            multiple
            format='YYYY-MM-DD'
            onChange={onChangeParallelTimes}
          />
        </AForm.Item>
        <AForm.Item label='任务颜色：' name='color'>
          <AColorPicker allowClear />
        </AForm.Item>
        <AForm.Item label='任务链接：' name='link'>
          <AInput placeholder='请输入任务链接, 例如：https://www.baidu.com' />
        </AForm.Item>
        <AForm.Item label='任务描述：' name='desc'>
          <AInput.TextArea placeholder='请输入任务描述' />
        </AForm.Item>
        <AForm.Item wrapperCol={{ span: 18, offset: 6 }}>
          <AButton type='primary' htmlType='submit'>
            创建任务
          </AButton>
        </AForm.Item>
      </AForm>
    </div>
  )
}

export default withSuspense(AddTask)
