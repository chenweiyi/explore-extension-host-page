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

type IProps = {
  showOneWord: boolean
}

export default function OneWord(props: IProps) {
  const [wordInfo, setWordInfo] = useState<IWordInfo | null>(null)

  const getOneWord = async () => {
    if (props.showOneWord) {
      const response = await fetch('https://v1.hitokoto.cn')
      const wordInfo = await response.json()
      setWordInfo(wordInfo)
    }
  }

  useEffect(() => {
    getOneWord()
  }, [])

  return (
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
  )
}
