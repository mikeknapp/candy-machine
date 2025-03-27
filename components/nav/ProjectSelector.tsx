"use client"

import { getProjects } from "@/app/actions/projects"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Project } from "@prisma/client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CreateProjectDialog } from "./CreateProjectDialog"

export function ProjectSelector() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getProjects()
        if ("error" in result) {
          throw new Error(result.error)
        }
        setProjects(result.data)
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to fetch projects",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleProjectChange = (value: string) => {
    if (!value) return
    router.push(`/#${value}`)
  }

  return (
    <div className="flex flex-row items-center space-x-2">
      <Select disabled={loading} onValueChange={handleProjectChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select Project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.slug}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={() => setDialogOpen(true)} aria-label="Create new project">
        <Plus className="h-5 w-5" />
      </Button>
      <CreateProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(project) => {
          setProjects((prev) => [...prev, project].sort((a, b) => a.name.localeCompare(b.name)))
        }}
      />
    </div>
  )
}
