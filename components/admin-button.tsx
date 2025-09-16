"use client"

import { useThyToken } from "@/hooks/use-thy-token"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import Link from "next/link"

export function AdminButton() {
  const { tokenData } = useThyToken()
  
  if (!tokenData?.isOwner) return null
  
  return (
    <Link href="/admin">
      <Button variant="outline" size="sm" className="gap-2 border-yellow-500/20 hover:border-yellow-500/40">
        <Shield className="h-4 w-4 text-yellow-500" />
        Admin
      </Button>
    </Link>
  )
}