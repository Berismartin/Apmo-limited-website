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

interface DeleteOrderDialogProps {
  orderId: string
  orderName: string
  deleteAction: (formData: FormData) => void
  triggerNode?: React.ReactElement
}

export function DeleteOrderDialog({
  orderId,
  orderName,
  deleteAction,
  triggerNode,
}: DeleteOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={triggerNode || <Button variant="destructive" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete <strong>{orderName}</strong> and remove all its data.
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
            <input type="hidden" name="id" value={orderId} />
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete Order
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
