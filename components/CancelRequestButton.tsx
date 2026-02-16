'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCancel = async () => {
    if (!confirm('요청을 취소하시겠습니까?\n결제 금액은 자동으로 환불됩니다.')) {
      return
    }

    setIsProcessing(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'PATCH',
      })
      const result = await res.json()
      if (result.success) {
        router.refresh()
      } else {
        alert(result.message || '취소 처리에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isProcessing}
      className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
    >
      {isProcessing ? '취소 처리 중...' : '요청 취소하기'}
    </button>
  )
}
