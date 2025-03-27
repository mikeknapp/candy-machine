"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { HelpCircle, Lightbulb, Package, Palette, Shirt, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export enum ProjectType {
  CHARACTER = "CHARACTER",
  CLOTHING = "CLOTHING",
  OBJECT = "OBJECT",
  IMAGE_STYLE = "IMAGE_STYLE",
  CONCEPT = "CONCEPT",
  OTHER = "OTHER",
}

const projectTypeIcons = {
  [ProjectType.CHARACTER]: User,
  [ProjectType.CLOTHING]: Shirt,
  [ProjectType.OBJECT]: Package,
  [ProjectType.IMAGE_STYLE]: Palette,
  [ProjectType.CONCEPT]: Lightbulb,
  [ProjectType.OTHER]: HelpCircle,
} as const

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .transform((val) => val.trim().replace(/\s+/g, " ")),
  type: z.nativeEnum(ProjectType),
})

type FormData = z.infer<typeof formSchema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const router = useRouter()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: ProjectType.CHARACTER,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          slug,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          form.setError("name", {
            type: "manual",
            message: "A project with this name already exists",
          })
          return
        }
        throw new Error(error.error || "Failed to create project")
      }

      const project = await response.json()
      toast.success("Project created", {
        description: `Project "${project.name}" created successfully`,
      })

      onOpenChange(false)
      form.reset()
      router.push(`/#${project.slug}`)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to create project",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Create a new project to organize your images and training data.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My awesome project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      {Object.entries(ProjectType).map(([key, value]) => {
                        const Icon = projectTypeIcons[value as ProjectType]
                        return (
                          <FormItem key={value}>
                            <FormControl>
                              <RadioGroupItem value={value} className="peer sr-only" id={`type-${value}`} />
                            </FormControl>
                            <FormLabel
                              htmlFor={`type-${value}`}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <Icon className="mb-2 h-6 w-6" />
                              {key}
                            </FormLabel>
                          </FormItem>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
