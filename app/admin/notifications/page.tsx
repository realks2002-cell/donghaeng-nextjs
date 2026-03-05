'use client'

import { useEffect, useState } from 'react'
import { Bell, Send, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

interface Subscription {
  id: string
  manager_id: string
  manager_name: string
  endpoint_preview: string
  created_at: string
}

interface PushStatus {
  status: string
  message?: string
  migration_file?: string
  subscriptionCount: number
  subscriptions: Subscription[]
  config?: {
    vapidPublicKey: boolean
    vapidPrivateKey: boolean
    vapidConfigured: boolean
  }
  health?: {
    webPushImportable: boolean
    vapidConfigured: boolean
    subscriptionCount: number
  }
}

interface SendResult {
  ok: boolean
  message: string
  pushResult?: {
    sent: number
    failed: number
  }
}

export default function AdminNotificationsPage() {
  const [status, setStatus] = useState<PushStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/push-status')
      if (!res.ok) throw new Error('조회 실패')
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/admin/push-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || undefined,
          body: body || undefined,
        }),
      })
      const data = await res.json()
      setSendResult(data)
    } catch {
      setSendResult({ ok: false, message: '발송 요청 실패' })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">로딩 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchStatus}
            className="mt-4 min-h-[44px] px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const isTableMissing = status?.status === 'table_missing'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          매니저 알림 관리
        </h1>
        <button
          onClick={fetchStatus}
          className="min-h-[44px] px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>

      {/* 테이블 미존재 경고 */}
      {isTableMissing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">{status?.message}</p>
            <p className="text-sm text-yellow-700 mt-1">
              마이그레이션 파일: <code className="bg-yellow-100 px-1 rounded">{status?.migration_file}</code>
            </p>
          </div>
        </div>
      )}

      {/* 시스템 상태 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">VAPID 설정</div>
          <div className="flex items-center gap-2">
            {status?.config?.vapidConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-semibold">
              {status?.config?.vapidConfigured ? '정상' : '미설정'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">web-push 모듈</div>
          <div className="flex items-center gap-2">
            {status?.health?.webPushImportable ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-semibold">
              {status?.health?.webPushImportable ? '사용 가능' : '사용 불가'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">총 구독 수</div>
          <div className="text-2xl font-bold">{status?.subscriptionCount ?? 0}</div>
        </div>
      </div>

      {/* 구독 목록 테이블 */}
      {!isTableMissing && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold">구독 목록</h2>
          </div>
          {status?.subscriptions && status.subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">매니저</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Endpoint</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">등록일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {status.subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{sub.manager_name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs break-all max-w-xs">
                        {sub.endpoint_preview}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              등록된 구독이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 테스트 푸시 발송 */}
      {!isTableMissing && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold mb-4">테스트 푸시 발송</h2>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="[테스트] 관리자 테스트 알림"
                className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="푸시 알림 테스트입니다."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={sending || (status?.subscriptionCount ?? 0) === 0}
              className="min-h-[44px] px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? '발송 중...' : '테스트 발송'}
            </button>
          </form>

          {sendResult && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                sendResult.ok
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {sendResult.ok ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0" />
              )}
              <div>
                <span className="font-medium">{sendResult.message}</span>
                {sendResult.pushResult && (
                  <span className="text-sm ml-2">
                    (성공: {sendResult.pushResult.sent}, 실패: {sendResult.pushResult.failed})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
