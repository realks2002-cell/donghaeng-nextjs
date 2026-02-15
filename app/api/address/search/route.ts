import { NextRequest, NextResponse } from 'next/server'

interface AddressResult {
  address: string
  x: number
  y: number
}

interface VWorldResponse {
  response: {
    status: string
    result?: {
      point?: {
        x: string
        y: string
      }
    }
    refined?: {
      text: string
    }
  }
}

async function fetchAddress(url: string): Promise<VWorldResponse | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐시
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword') || searchParams.get('address') || searchParams.get('q') || ''

  if (!keyword.trim()) {
    return NextResponse.json(
      { success: false, message: '주소를 입력해주세요.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.VWORLD_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: 'VWorld API Key가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  // 검색 패턴 생성
  const patterns = [keyword]
  if (!/\d+/.test(keyword)) {
    patterns.push(`${keyword} 1`)
    patterns.push(`${keyword} 100`)
  }

  const results: AddressResult[] = []
  const seen = new Set<string>()

  // 호스트 도메인 가져오기
  const host = request.headers.get('host') || 'localhost'
  const hostDomain = host.includes('localhost') || host.includes('127.0.0.1') ? 'localhost' : host

  for (const pattern of patterns) {
    const encodedAddress = encodeURIComponent(pattern)

    // road 타입 (도로명 주소)
    const roadUrl = `http://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=EPSG:4326&address=${encodedAddress}&type=road&format=json&key=${apiKey}&domain=${hostDomain}`
    const roadData = await fetchAddress(roadUrl)

    if (roadData?.response?.status === 'OK') {
      const point = roadData.response.result?.point
      const refined = roadData.response.refined?.text

      if (point?.x && point?.y && refined && !seen.has(refined)) {
        results.push({
          address: refined,
          x: parseFloat(point.x),
          y: parseFloat(point.y),
        })
        seen.add(refined)
      }
    }

    // parcel 타입 (지번 주소)
    const parcelUrl = `http://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=EPSG:4326&address=${encodedAddress}&type=parcel&format=json&key=${apiKey}&domain=${hostDomain}`
    const parcelData = await fetchAddress(parcelUrl)

    if (parcelData?.response?.status === 'OK') {
      const point = parcelData.response.result?.point
      const refined = parcelData.response.refined?.text

      if (point?.x && point?.y && refined && !seen.has(refined)) {
        results.push({
          address: refined,
          x: parseFloat(point.x),
          y: parseFloat(point.y),
        })
        seen.add(refined)
      }
    }
  }

  if (results.length === 0) {
    return NextResponse.json({
      success: false,
      message: '일치하는 주소를 찾지 못했습니다. 시/구/동 또는 도로명을 포함해주세요.',
    })
  }

  return NextResponse.json({ success: true, items: results })
}
