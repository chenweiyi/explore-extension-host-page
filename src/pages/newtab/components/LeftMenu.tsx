import React from 'react'
import withSuspense from '@src/shared/hoc/withSuspense'
import logo from '@assets/img/star48.png'
import { Classes, ICategoryKey, IGithubTag } from '../Tab'

interface ILeftMenu {
  [str: string]: unknown
  activeClass: string
  setActiveClass: (activeClass: string) => void
  folders: Array<ICategoryKey> | Array<IGithubTag>
  activeFolder: string
  setActiveFolder: (activeFolder: string) => void
}

const LeftMenu = (props: ILeftMenu) => {
  // const theme = useStorage(exampleThemeStorage)

  return (
    <div
      className='
        left
        w-[300px]
        flex
        flex-col
        items-stretch
        bg-gray-300
        rounded-l-[8px]
        px-[16px]
        py-[16px]
        overflow-hidden
      '
    >
      <div
        className='
          logo
          text-[30px]
          px-[12px]
          mb-[16px]
          h-[60px]
        '
      >
        <img src={logo} className='App-logo h-[48px]' alt='logo' />
      </div>
      <div
        className='
          title
          flex
          items-center
          text-[12px]
          mb-[16px]
          text-gray-500
          px-[12px]
        '
      >
        <span
          className={clsx([
            'mr-[12px]',
            'cursor-pointer',
            'hover:text-blue-500',
            props.activeClass === '本地' ? 'text-blue-500 font-semibold' : ''
          ])}
          onClick={() => props.setActiveClass(Classes[0])}
        >
          本地
        </span>
        <span
          className={clsx([
            'cursor-pointer',
            'hover:text-blue-500',
            props.activeClass === 'github' ? 'text-blue-500 font-semibold' : ''
          ])}
          onClick={() => props.setActiveClass(Classes[1])}
        >
          Github
        </span>
      </div>
      <div className='flex-1 flex flex-col items-stretch overflow-y-auto'>
        {props.folders.map((folder) => {
          return (
            <span
              key={folder.id}
              className={clsx([
                'folder-item',
                'rounded-[4px]',
                'px-[12px]',
                'py-[4px]',
                'mr-[8px]',
                'mb-[8px]',
                'text-[16px]',
                'select-none',
                'cursor-pointer',
                'flex',
                'items-center',
                'hover:text-blue-600',
                props.activeFolder === folder.id
                  ? 'text-blue-600 font-semibold'
                  : 'text-black'
              ])}
              onClick={() => props.setActiveFolder(folder.id)}
            >
              <IMdiFolderOutline className='inline-block mr-[20px]' />
              {folder.title}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default withSuspense(LeftMenu)
