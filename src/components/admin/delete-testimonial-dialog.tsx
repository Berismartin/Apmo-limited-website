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

interface DeleteTestimonialDialogProps {
  testimonialId: string
  testimonialName: string
  deleteAction: (formData: FormData) => Promise<MutationResult | void>
  triggerNode?: React.ReactElement
}

export function DeleteTestimonialDialog({
  testimonialId,
  testimonialName,
  deleteAction,
  triggerNode,
}: DeleteTestimonialDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isDeleting) setIsOpen(open) }}>
      <DialogTrigger render={triggerNode || <Button variant="destructive" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this testimonial?</DialogTitle>
          <DialogDescription>
            This cannot be undone. The quote from <strong>{testimonialName}</strong> will be
            removed from admin and the public site.
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
                success: "Testimonial deleted",
                failure: "Failed to delete testimonial",
              })
              if (!ok) setIsDeleting(false)
            }}
          >
            <input type="hidden" name="id" value={testimonialId} />
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete testimonial
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
