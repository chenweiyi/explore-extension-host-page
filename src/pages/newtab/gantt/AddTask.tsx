import withSuspense from '@src/shared/hoc/withSuspense'
import { IOriTask } from '../Calendar'
import { Form } from 'antd'
import { dateFormat } from './util'
import { Modal } from 'antd'

type IAddTaskProps = {
  type?: 'add' | 'edit'
  data?: IOriTask | null
  addTask?: (tasks: IOriTask) => boolean
  editTask?: (tasks: IOriTask) => void
  deleteTask?: (tasks: IOriTask) => void
}

const AddTask = (props: IAddTaskProps) => {
  const { type = 'add', addTask, data, editTask, deleteTask } = props
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [parallelTimes, setParallelTimes] = useState<string[]>([])
  const [form] = Form.useForm()
  const [initialValues] = useState({
    color: data?.color || null,
    name: data?.name,
    timescope: data ? [dayjs(data.startTime), dayjs(data.endTime)] : null,
    parallelTimes: data ? data.parallelTimes.map((d) => dayjs(d)) : null,
    link: data?.link,
    desc: data?.desc
  })

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
    if (dates) {
      setStartTime(dayjs(dates[0]).format(dateFormat))
      setEndTime(dayjs(dates[1]).format(dateFormat))
    }
  }

  const onChangeParallelTimes = (dates: any) => {
    setParallelTimes(dates?.map((d) => dayjs(d).format(dateFormat)) ?? [])
  }

  const getColor = (color: string | null) => {
    if (!color) return ''
    const color1 = color.replace('#', '')
    if (color1.length === 8) {
      if (color1.slice(6) === '00') {
        return ''
      }
      return color
    }
    return color
  }

  const onFinish = (value: any) => {
    console.log(value)
    const options = {
      name: value.name,
      color: getColor(value.color?.toHexString()),
      startTime: dayjs(value.timescope[0]).format(dateFormat),
      endTime: dayjs(value.timescope[1]).format(dateFormat),
      link: value.link || '',
      desc: value.desc || '',
      parallelTimes: parallelTimes
    }
    console.log('options:', options)
    if (type === 'add') {
      const res = addTask?.(options)
      if (res) {
        form.resetFields()
      }
    } else if (type === 'edit') {
      editTask?.(options)
    }
  }

  const onDeleteTask = () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      centered: true,
      content: (
        <div className='my-10px'>
          确定要删除任务
          <span className='mx-4px font-semibold'>{data.name}</span> 吗？
        </div>
      ),
      onOk() {
        deleteTask?.(data)
      }
    })
  }

  return (
    <div className='w-full h-full'>
      <AForm
        form={form}
        name='addTask'
        initialValues={initialValues}
        labelCol={{ span: 6 }}
        labelAlign='right'
        wrapperCol={{ span: 14, offset: 1 }}
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
        <AForm.Item
          wrapperCol={{ span: 24, offset: 0 }}
          className='flex flex-row justify-end items-center'
        >
          <AButton type='primary' htmlType='submit'>
            {type === 'add' ? '保存' : '更新'}
          </AButton>
          {type === 'edit' && (
            <>
              <AButton
                type='primary'
                danger
                onClick={onDeleteTask}
                className='ml-20px'
              >
                删除
              </AButton>
            </>
          )}
        </AForm.Item>
      </AForm>
    </div>
  )
}

export default withSuspense(AddTask)
