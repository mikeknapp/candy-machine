"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CreateProjectDialog } from "./CreateProjectDialog"

export function ProjectSelector() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex flex-row items-center space-x-2">
      <select className="rounded py-2 px-2 bg-white dark:bg-gray-800">
        <option value="">Select Project</option>
        {/* Project options will be populated here */}
      </select>
      <Button variant="ghost" size="icon" onClick={() => setDialogOpen(true)} aria-label="Create new project">
        <Plus className="h-5 w-5" />
      </Button>
      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
