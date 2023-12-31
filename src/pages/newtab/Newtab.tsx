import React from 'react'
import { Octokit } from 'octokit'
import '@pages/newtab/Newtab.css'
// import useStorage from '@src/shared/hooks/useStorage'
// import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import LeftMenu from './components/LeftMenu'
import RightHead from './components/RightHead'
import RightContent from './components/RightContent'
import { base64_to_utf8 } from '@root/utils/tool'

export interface ICategoryKey extends chrome.bookmarks.BookmarkTreeNode {
  parentIds?: string[]
  parentTitles?: string[]
  lastModifiedTime?: string
}

export interface IGithubRawBookmark {
  url: string
  title: string
  tags: string[]
}
export interface IGithubBookmark {
  url: string
  title: string
  tags: string[]
  id: string
}

export interface IGithubTag {
  title: string
  id: string
}

export type IGithubBookmarkMap = Map<IGithubTag, IGithubBookmark[]>

export enum Classes {
  本地,
  github
}

export type ICategoryDataMap = Map<ICategoryKey, ICategoryKey[]>

export interface IWordInfo {
  /** 一言标识 */
  id: string
  /** 一言正文。编码方式 unicode。使用 utf-8 */
  hitokoto: string
  /** 类型 */
  type: string
  /** 出处 */
  from: string
  /** 作者 */
  from_who: string
  /** 添加者 */
  creator: string
  /** 添加者用户标识 */
  creator_uid: string
  /** 审核员标识 */
  reviewer: string
  /** 一言唯一标识；可以链接到 https://hitokoto.cn?uuid=[uuid] 查看这个一言的完整信息  */
  uuid: string
  /** 提交方式 */
  commit_from: string
  /** 添加时间 */
  created_at: string | number
  /** 句子长度 */
  length: number
}

const Newtab = () => {
  const [activeClass, setActiveClass] = useState(Classes[0])
  const latestActiveClass = useLatest(activeClass)
  // key: 文件夹 value: 文件夹下的文件
  const [categoryData, setCategoryData] = useState<
    ICategoryDataMap | IGithubBookmarkMap
  >(new Map())
  // 左侧文件夹
  const [folders, setFolders] = useState<
    Array<ICategoryKey> | Array<IGithubTag>
  >([])
  // 当前文件下根据搜索条件渲染的数据
  const [filterData, setFilterData] = useState<
    Array<ICategoryKey> | Array<IGithubBookmark>
  >([])
  // 当前激活的文件夹
  const [activeFolder, setActiveFolder] = useState<string>('-1')
  // 搜索文本
  const [searchVal, setSearchVal] = useState<string>('')

  // 待排除的文件夹
  const [excludeFolderStr, setExcludeFolderStr] = useState('')
  const latestExcludeFolderStr = useLatest(excludeFolderStr)

  const [showOneWord, setShowOneWord] = useState(true)
  const [wordInfo, setWordInfo] = useState<IWordInfo | null>(null)

  const mapRes: ICategoryDataMap = new Map()

  function processBookmarkNodes(
    nodes: ICategoryKey[],
    parentNode?: ICategoryKey
  ) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (isNil(node.url) && node.children?.length > 0) {
        !node.parentIds && (node.parentIds = [])
        !isNil(node.parentId) && node.parentIds.push(node.parentId)
        !node.parentTitles && (node.parentTitles = [])
        parentNode?.title && node.parentTitles.push(parentNode.title)
        if (node.children.find((node) => node.url)) {
          mapRes.set(
            node,
            node.children
              .filter((node) => !node.children && node.url)
              .map((node2) => {
                const _node: ICategoryKey = { ...node2 }
                !_node.parentIds && (_node.parentIds = [])
                !isNil(_node.parentId) && _node.parentIds.push(_node.parentId)
                !_node.parentTitles && (_node.parentTitles = [])
                node?.title && _node.parentTitles.push(node.title)
                _node.lastModifiedTime = dayjs(_node.dateAdded).format(
                  'YYYY-MM-DD'
                )
                return _node
              })
              .sort((a, b) => b.dateAdded - a.dateAdded)
          )
        }
        // 递归处理子节点
        processBookmarkNodes(node.children, node)
      }
    }
  }

  function filterTreeData(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
    const ex = latestExcludeFolderStr.current
      .trim()
      .split(/,|，/)
      .map((i) => unescape(i).trim())
    if (ex.length === 0) return nodes
    return nodes.reduce((result, item) => {
      if (item.title && ex.find((e) => e === item.title)) {
        // 如果当前元素包含特殊字符，则不添加到结果中
        return result
      }
      if (item.children && item.children.length > 0) {
        // 如果当前元素有子元素，则递归过滤子元素
        const filteredChildren = filterTreeData(item.children)
        if (filteredChildren.length > 0) {
          // 如果过滤后的子元素有剩余，则添加到结果中
          result.push({ ...item, children: filteredChildren })
        }
      } else {
        // 如果当前元素无子元素且不包含特殊字符，则添加到结果中
        result.push(item)
      }
      return result
    }, [])
  }

  function traverseCategoryData() {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      // console.log('bookmarkTreeNodes:', bookmarkTreeNodes)
      const filterNodes = filterTreeData(bookmarkTreeNodes)
      // console.log('filter done,', filterNodes)
      processBookmarkNodes(filterNodes)
      const allKey = {
        id: '-1',
        title: '全部'
      }
      const arr: ICategoryKey[] = []
      for (const val of mapRes.values()) {
        arr.push(...val)
      }
      mapRes.set(
        allKey,
        arr.sort((a, b) => b.dateAdded - a.dateAdded)
      )
      console.log('mapRes:', mapRes)
      setCategoryData(mapRes)
    })
  }

  function changeFilterDataByActiveFolder() {
    const data = categoryData.get(
      folders.find((f) => f.id === activeFolder)
    ) as ICategoryKey[]
    console.log('data:', data)
    if (!data) return []
    setFilterData(
      data.filter((d) => {
        if (searchVal === '') return d
        return (
          d.title.toLowerCase().includes(searchVal.toLowerCase()) ||
          searchVal.toLowerCase().includes(d.title.toLowerCase())
        )
      })
    )
  }

  function generateGithubData(rawData: IGithubRawBookmark[]) {
    const data: IGithubBookmark[] = rawData
      .map((d, i) => {
        const item: IGithubBookmark = { ...d, id: i + '' }
        return item
      })
      .filter((d) => {
        const ex = latestExcludeFolderStr.current
          .trim()
          .split(/,|，/)
          .map((i) => unescape(i).trim())
        if (ex.length === 0) return true
        if (d.tags.find((t) => ex.find((e) => e === t))) {
          return false
        }
        return true
      })

    const folders: IGithubTag[] = data.reduce((result, item) => {
      item.tags.forEach((tag) => {
        if (!result.find((r) => r === tag)) {
          result.push({
            title: tag,
            id: tag
          })
        }
      })
      return result
    }, [])

    folders.unshift({
      title: '全部',
      id: '-1'
    })

    const bookmarkMap: IGithubBookmarkMap = new Map()

    folders.forEach((folder) => {
      let res: IGithubBookmark[] = []
      if (folder.id === '-1') {
        bookmarkMap.set(folder, data)
      } else {
        res = data.filter((d) => d.tags.find((tag) => tag === folder.id))
        bookmarkMap.set(folder, res)
      }
    })

    setFolders(folders)
    setCategoryData(bookmarkMap)
  }

  async function fetchDataFromGithub() {
    const { owner, repo, path, authCode } = await chrome.storage.sync.get([
      'owner',
      'repo',
      'path',
      'authCode'
    ])
    if (!owner || !repo || !path || !authCode) {
      window.alert('github配置不全，请检查github配置字段！')
      return
    }
    const octokit = new Octokit({
      auth: authCode
    })
    const res = await octokit.rest.repos.getContent({
      mediaType: {
        format: 'json'
      },
      owner,
      repo,
      path
    })
    console.log('res', res)
    if (res.status === 200) {
      const { sha = '', content = '' } = res.data as any
      if (content) {
        const json = JSON.parse(base64_to_utf8(content))
        console.log('json:', json)
        generateGithubData(json as IGithubRawBookmark[])
      }
    } else {
      if (res.status === 404) {
        window.alert(
          'github getContent接口查询资源不存在，请检查文件名称等配置'
        )
      } else if (res.status === 403) {
        window.alert('github getContent接口查询无权限，请检查authCode等配置')
      } else {
        window.alert('github getContent接口查询失败')
      }
    }
  }

  const getOneWord = async () => {
    if (showOneWord) {
      const response = await fetch('https://v1.hitokoto.cn')
      const wordInfo = await response.json()
      setWordInfo(wordInfo)
    }
  }

  useEffect(() => {
    const folders: ICategoryKey[] = []
    for (const key of categoryData.keys()) {
      folders.push(key)
    }
    const allKeyIndex = folders.findIndex((f) => f.id === '-1')
    const allKey = folders.splice(allKeyIndex, 1)
    setFolders([...allKey, ...folders])
  }, [categoryData.size])

  useEffect(() => {
    changeFilterDataByActiveFolder()
  }, [activeFolder, categoryData.size, folders.length, searchVal])

  useUpdateEffect(() => {
    // activeFolder改变时，根据配置判断是否存储当前activeFolder
    chrome.storage.sync.get(['saveSelectFolder'], function (result) {
      chrome.storage.sync.set({
        activeFolder: result.saveSelectFolder === false ? '-1' : activeFolder
      })
    })
  }, [activeFolder])

  useUpdateEffect(() => {
    // activeClass改变时，根据配置判断是否存储当前activeClass
    chrome.storage.sync.get(['saveSelectClass'], function (result) {
      chrome.storage.sync.set({
        activeClass: result.saveSelectClass === false ? Classes[0] : activeClass
      })
      setActiveFolder('-1')
      if (activeClass === Classes[0]) {
        traverseCategoryData()
      } else {
        fetchDataFromGithub()
      }
    })
  }, [activeClass])

  useEffect(() => {
    chrome.storage.sync.get(
      ['activeClass', 'activeFolder', 'excludeFolders', 'showOneWord'],
      function (result) {
        setActiveClass(result.activeClass || Classes[0])
        setActiveFolder(result.activeFolder || '-1')
        setExcludeFolderStr(result.excludeFolders || '')
        setShowOneWord(result.showOneWord !== false)
        if (!result.activeClass || result.activeClass === Classes[0]) {
          traverseCategoryData()
        } else {
          fetchDataFromGithub()
        }
      }
    )

    // 监听setting变化
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request.action === 'settingUpdate') {
        // 执行更新数据操作
        if (
          request.data &&
          request.data.namespace === 'sync' &&
          request.data.changes
        ) {
          if (request.data.changes.excludeFolders) {
            setExcludeFolderStr(
              request.data.changes.excludeFolders.newValue || ''
            )
          }
          if (request.data.changes.showOneWord) {
            setShowOneWord(request.data.changes.showOneWord.newValue)
          }
        }
      }
    })

    getOneWord()
  }, [])

  // console.log('folders:', folders)

  return (
    <div className='w-full h-full flex justify-center items-center'>
      {showOneWord ? (
        <div className='absolute z-10 h-[7.5%] w-full flex justify-center items-center top-0 left-0'>
          {wordInfo ? (
            <a
              href={`https://hitokoto.cn?uuid=${wordInfo.uuid}`}
              target='_blank'
              rel='noreferrer'
              className='bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 px-[8px] py-[4px]'
            >
              {wordInfo ? (
                <>
                  <span className='text-[14px]'>{wordInfo.hitokoto}</span>
                  <span> -- </span>
                  <span className='text-[12px]'>{wordInfo.from}</span>
                  {wordInfo.from_who ? (
                    <span className='text-[12px]'>
                      {' ⌈ ' + wordInfo.from_who + ' ⌋ '}
                    </span>
                  ) : null}
                </>
              ) : (
                ''
              )}
            </a>
          ) : null}
        </div>
      ) : null}

      <div
        className='
        app
        bg-white
        w-[80%]
        h-[85%]
        flex
        flex-row
        items-stretch
        rounded-[8px]
        overflow-hidden
        shadow-lg
      '
      >
        <LeftMenu
          activeClass={activeClass}
          setActiveClass={setActiveClass}
          folders={folders}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
        />
        <div
          className='
        right
        flex-1
        flex
        flex-col
        items-stretch
        border-y-[1px]
        border-r-[1px]
        border-gray-300
        border-solid
        rounded-r-[8px]
      '
        >
          <RightHead setSearchVal={setSearchVal} />
          <RightContent filterData={filterData} />
        </div>
      </div>
    </div>
  )
}

export default withSuspense(Newtab)
