"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitAdminMutation } from "@/components/admin/submit-admin-mutation"
import {
  updateContactMessageStatusAction,
  type ContactMessageStatus,
} from "@/lib/admin/contact-admin"

interface ContactMessageStatusActionsProps {
  messageId: string
  status: ContactMessageStatus
}

export function ContactMessageStatusActions({
  messageId,
  status,
}: ContactMessageStatusActionsProps) {
  const [isPending, setIsPending] = useState(false)

  async function setStatus(next: ContactMessageStatus) {
    setIsPending(true)
    const formData = new FormData()
    formData.set("id", messageId)
    formData.set("status", next)
    await submitAdminMutation(
      () => updateContactMessageStatusAction(formData),
      {
        success: next === "archived" ? "Message archived" : "Marked as read",
        failure: "Failed to update message",
      }
    )
    setIsPending(false)
  }

  return (
    <div className="flex justify-end gap-2">
      {status === "new" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => setStatus("read")}
        >
          {isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          Mark read
        </Button>
      ) : null}
      {status !== "archived" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => setStatus("archived")}
        >
          {isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          Archive
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => setStatus("read")}
        >
          {isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          Restore
        </Button>
      )}
    </div>
  )
}
