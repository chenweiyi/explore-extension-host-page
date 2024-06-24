import React from 'react'
import withSuspense from '@src/shared/hoc/withSuspense'

interface IRightHead {
  [str: string]: unknown
  setSearchVal: (val: string) => void
}

const RightHead = (props: IRightHead) => {
  function search(e: React.FormEvent<HTMLInputElement>) {
    const value = e.currentTarget.value
    props.setSearchVal(value)
  }

  return (
    <div
      className='
        header
        h-[72px]
        py-[4px]
        px-[16px]
        flex
        justify-between
        items-center
        border-b-1px
        border-b-[#d1d5db]
        border-b-solid
      '
    >
      <div className='search relative'>
        <input
          type='text'
          placeholder='请搜索'
          className='
            h-[30px]
            w-[300px]
            bg-white
            appearance-none
            border
            border-slate-400
            border-solid
            text-slate-500
            outline-0
            pl-[24px]
            rounded-[4px]
          '
          onInput={(e) => search(e)}
        />
        <IMdiMagnify className='absolute left-[6px] top-[8px] text-cyan-500' />
      </div>
      {/* <div className='user flex items-center'>
        <IMdiAccount className='text-cyan-500 text-[16px] mr-[4px]' />
        <span className='text-slate-500 text-[16px]'>User</span>
      </div> */}
    </div>
  )
}

export default withSuspense(RightHead)
