"use client"

import { getProjects } from "@/app/actions/projects"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { selectedProjectAtom } from "@/lib/atoms"
import { Project } from "@prisma/client"
import { useAtom } from "jotai"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CreateProjectDialog } from "./CreateProjectDialog"

export function ProjectSelector() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom)
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getProjects()
        if ("error" in result) {
          throw new Error(result.error)
        }
        setProjects(result.data)

        // Handle initial hash-based project selection
        const hash = window.location.hash.slice(1)
        if (hash) {
          const projectFromHash = result.data.find((p) => p.slug === hash)
          if (projectFromHash) {
            setSelectedProject(projectFromHash)
          } else {
            // Remove invalid project hash
            window.location.hash = ""
          }
        } else if (result.data.length > 0) {
          // If no hash and projects exist, select the most recently updated project
          const mostRecentProject = [...result.data].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0]
          setSelectedProject(mostRecentProject)
          router.push(`/#${mostRecentProject.slug}`)
        }
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to fetch projects",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [setSelectedProject, router])

  const handleProjectChange = (value: string) => {
    if (!value) {
      setSelectedProject(null)
      return
    }
    const project = projects.find((p) => p.slug === value)
    if (project) {
      setSelectedProject(project)
      router.push(`/#${value}`)
    }
  }

  return (
    <div className="flex flex-row items-center space-x-2">
      <Select disabled={loading} onValueChange={handleProjectChange} value={selectedProject?.slug || ""}>
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setDialogOpen(true)} aria-label="Create new project">
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create a new project</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
