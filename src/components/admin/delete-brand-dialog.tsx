"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
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

interface DeleteBrandDialogProps {
  brandId: string
  brandName: string
  deleteAction: (formData: FormData) => void
  triggerNode?: React.ReactElement
}

export function DeleteBrandDialog({
  brandId,
  brandName,
  deleteAction,
  triggerNode,
}: DeleteBrandDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={triggerNode || <Button variant="destructive" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this brand?</DialogTitle>
          <DialogDescription>
            This cannot be undone. <strong>{brandName}</strong> will be
            permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isDeleting} />}>
            Cancel
          </DialogClose>
          <form
            action={async (formData) => {
              setIsDeleting(true)
              try {
                await deleteAction(formData)
              } catch (err) {
                if (err instanceof Error && err.message === "NEXT_REDIRECT") {
                  toast.success("Brand deleted")
                  throw err
                }
                toast.error(err instanceof Error ? err.message : "Failed to delete brand")
                setIsDeleting(false)
              }
            }}
          >
            <input type="hidden" name="id" value={brandId} />
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete brand
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
