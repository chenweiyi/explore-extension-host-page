import withSuspense from '@src/shared/hoc/withSuspense'
import type { IShowType } from '../Calendar'

type IToolboxProps = {
  showType: IShowType
  setShowType: (type: IShowType) => void
}

const Toolbox = (props: IToolboxProps) => {
  return (
    <div className='absolute top-0 right-[-42px] w-30px h-full flex flex-col items-center'>
      <ATooltip title='添加任务' placement='right' className='mb-20px'>
        <PlusOutlined
          className={clsx(
            'text-20px transition cursor-pointer hover:text-green-500 hover:scale-110',
            {
              'text-green-500': props.showType === 'add',
              'font-semibold': props.showType === 'add'
            }
          )}
          onClick={() => props.setShowType('add')}
        />
      </ATooltip>
      <ATooltip title='分析统计' placement='right'>
        <StockOutlined
          className={clsx(
            'text-20px transition cursor-pointer hover:text-yellow-500 hover:scale-110',
            {
              'text-yellow-500': props.showType === 'analysis',
              'font-semibold': props.showType === 'analysis'
            }
          )}
          onClick={() => props.setShowType('analysis')}
        />
      </ATooltip>
    </div>
  )
}

export default withSuspense(Toolbox)
