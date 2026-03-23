import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const defaultPrices: Record<string, number> = {
  '병원 동행': 20000,
  '가사돌봄': 18000,
  '생활동행': 18000,
  '노인 돌봄': 22000,
  '아이 돌봄': 20000,
  '기타': 20000,
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('service_prices')
      .select('service_type, price_per_hour')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching service prices:', error)
      // 테이블이 없으면 기본값 반환
      return NextResponse.json({ prices: defaultPrices })
    }

    // 데이터를 객체로 변환
    const prices: Record<string, number> = { ...defaultPrices }
    if (data) {
      data.forEach((item: { service_type: string; price_per_hour: number }) => {
        prices[item.service_type] = item.price_per_hour
      })
    }

    return NextResponse.json({ prices })
  } catch (error) {
    console.error('Service prices API error:', error)
    return NextResponse.json({ prices: defaultPrices })
  }
}
