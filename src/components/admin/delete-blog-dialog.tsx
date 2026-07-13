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

interface DeleteBlogDialogProps {
  postId: string
  postTitle: string
  deleteAction: (formData: FormData) => void
  triggerNode?: React.ReactElement
}

export function DeleteBlogDialog({
  postId,
  postTitle,
  deleteAction,
  triggerNode,
}: DeleteBlogDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={triggerNode || <Button variant="destructive" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this post?</DialogTitle>
          <DialogDescription>
            This cannot be undone. <strong>{postTitle}</strong> will be removed from the
            admin and the public blog.
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
            <input type="hidden" name="id" value={postId} />
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete post
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
