import React from 'react'
// import useStorage from '@src/shared/hooks/useStorage'
// import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import { faviconURL, ICategoryKey, IError, IGithubBookmark } from '../Tab'

interface IRightContent {
  [str: string]: unknown
  filterData: Array<ICategoryKey> | Array<IGithubBookmark>
  error: IError | null
}

const RightContent = (props: IRightContent) => {
  return (
    <div
      className='
        app-content
        flex-1
        px-[16px]
        py-[12px]
        grid
        grid-cols-3
        grid-rows-[128px]
        auto-rows-[128px]
        gap-x-[16px]
        gap-y-[16px]
        overflow-y-auto
      '
    >
      {props.error ? (
        <div className='w-full px-[32px] py-[40px] text-[16px] col-span-3'>
          <div className='mb-[12px]'>
            <span>Error:</span>
            <span className='ml-[12px] text-red-500'>{props.error.msg}</span>
          </div>
          <div>
            <span>From:</span>
            <span className='ml-[12px] text-red-500'>{props.error.from}</span>
          </div>
        </div>
      ) : (
        props.filterData?.map((d) => {
          return (
            <div
              className='
              item
              flex
              flex-col
              items-stretch
              border
              border-cyan-300
              px-[8px]
              py-[12px]
              rounded-[4px]
              bg-cyan-200
              text-black
              font-medium
              cursor-pointer
              shadow-normal
              hover:font-bold
              hover:bg-cyan-500
              hover:shadow-active
              group
            '
              key={d.id}
              onClick={() => window.open(d.url)}
            >
              <div className='flex items-center'>
                <span
                  className='w-16px h-16px mr-8px'
                  style={{ backgroundImage: `url(${faviconURL(d.url)})` }}
                ></span>
                <a
                  href={d.url}
                  title={d.title}
                  target='_blank'
                  rel='noreferrer'
                  className='
                  flex-1
                  text-[16px]
                  group-hover:text-white
                  overflow-hidden
                text-ellipsis
                whitespace-nowrap
                '
                >
                  {d.title}
                </a>
              </div>

              <div
                className='
                flex
                items-center
                text-gray-700
                font-normal
                mt-[8px]
                mb-[4px]
                text-[14px]
                group-hover:text-white
              '
                title={d.url}
              >
                <IMdiLinkVariant className='inline-block mr-[4px]' />
                <span
                  className='
                  flex-1
                  overflow-hidden
                  text-ellipsis
                  whitespace-nowrap
                '
                >
                  {d.url}
                </span>
              </div>
              {d.lastModifiedTime ? (
                <div
                  className='
                flex
                items-center
                text-gray-700
                font-normal
                text-[14px]
                group-hover:text-white
              '
                >
                  <IMdiClockTimeSevenOutline className='inline-block mr-[4px]' />
                  <span
                    className='
                  flex-1
                  overflow-hidden
                  text-ellipsis
                  whitespace-nowrap
                '
                  >
                    {d.lastModifiedTime}
                  </span>
                </div>
              ) : null}

              {d.parentTitles?.length > 0 ? (
                <div
                  className='
                  flex
                  items-center
                  text-gray-700
                  font-normal
                  text-[14px]
                  group-hover:text-white
                  mt-[4px]
                '
                >
                  <IMdiFolderOutline className='inline-block mr-[4px]' />
                  <span
                    className='
                    flex-1
                    overflow-hidden
                    text-ellipsis
                    whitespace-nowrap
                  '
                  >
                    {d.parentTitles[d.parentTitles.length - 1]}
                  </span>
                </div>
              ) : null}
            </div>
          )
        })
      )}
    </div>
  )
}

export default withSuspense(RightContent)
