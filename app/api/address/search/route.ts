import { NextRequest, NextResponse } from 'next/server'

interface JusoItem {
  roadAddr: string
  roadAddrPart1: string
  roadAddrPart2: string
  jibunAddr: string
  zipNo: string
  bdNm: string
  siNm: string
  sggNm: string
  emdNm: string
}

interface JusoApiResponse {
  results: {
    common: {
      totalCount: string
      currentPage: string
      countPerPage: string
      errorCode: string
      errorMessage: string
    }
    juso: JusoItem[] | null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword') || searchParams.get('q') || ''

  if (!keyword.trim()) {
    return NextResponse.json(
      { success: false, message: '주소를 입력해주세요.' },
      { status: 400 }
    )
  }

  const confmKey = process.env.JUSO_API_KEY
  if (!confmKey) {
    return NextResponse.json(
      { success: false, message: '주소 API 키가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const params = new URLSearchParams({
      confmKey,
      currentPage: '1',
      countPerPage: '10',
      keyword,
      resultType: 'json',
    })

    const response = await fetch(
      `https://business.juso.go.kr/addrlink/addrLinkApi.do?${params.toString()}`
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: '주소 검색 서비스에 연결할 수 없습니다.' },
        { status: 502 }
      )
    }

    const data: JusoApiResponse = await response.json()

    if (data.results.common.errorCode !== '0') {
      return NextResponse.json({
        success: false,
        message: data.results.common.errorMessage || '주소 검색 중 오류가 발생했습니다.',
      })
    }

    const jusoList = data.results.juso
    if (!jusoList || jusoList.length === 0) {
      return NextResponse.json({
        success: false,
        message: '일치하는 주소를 찾지 못했습니다. 시/구/동 또는 도로명을 포함해주세요.',
      })
    }

    const items = jusoList.map((juso) => ({
      address: juso.roadAddr,
      jibunAddress: juso.jibunAddr,
      zipCode: juso.zipNo,
      buildingName: juso.bdNm,
    }))

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Address search error:', error)
    return NextResponse.json(
      { success: false, message: '주소 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
