'use client'
import { Eye, EyeOff } from 'lucide-react'

export function PrivacyToggle({ isPrivate, onToggle }: { isPrivate: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
      title={isPrivate ? '개인정보 표시' : '개인정보 숨김'}
    >
      {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      {isPrivate ? '정보 보기' : '정보 숨김'}
    </button>
  )
}
