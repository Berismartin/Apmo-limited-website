"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  deleteAction: (formData: FormData) => void
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            action={(formData) => {
              setIsDeleting(true)
              deleteAction(formData)
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
