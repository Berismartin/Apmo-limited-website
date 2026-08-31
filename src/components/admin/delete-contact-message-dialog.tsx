"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitAdminMutation } from "@/components/admin/submit-admin-mutation"
import type { MutationResult } from "@/lib/admin/mutation-result"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

interface DeleteContactMessageDialogProps {
  messageId: string
  fromName: string
  deleteAction: (formData: FormData) => Promise<MutationResult | void>
}

export function DeleteContactMessageDialog({
  messageId,
  fromName,
  deleteAction,
}: DeleteContactMessageDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isDeleting) setIsOpen(open) }}>
      <DialogTrigger render={<Button size="sm" variant="destructive" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this message?</DialogTitle>
          <DialogDescription>
            This cannot be undone. The message from <strong>{fromName}</strong> will be
            permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isDeleting} />}>
            Cancel
          </DialogClose>
          <form
            action={async (formData) => {
              setIsDeleting(true)
              const ok = await submitAdminMutation(() => deleteAction(formData), {
                success: "Message deleted",
                failure: "Failed to delete message",
              })
              if (!ok) setIsDeleting(false)
            }}
          >
            <input type="hidden" name="id" value={messageId} />
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete message
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
