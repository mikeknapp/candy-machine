"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Project } from "@prisma/client"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import debounce from "lodash/debounce"
import { Check, HelpCircle, Lightbulb, Package, Palette, Shirt, User, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { checkProjectNameAvailability, createProject } from "@/app/actions/projects"
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
  type: z.nativeEnum(ProjectType, {
    required_error: "Please select a project type",
  }),
})

type FormData = z.infer<typeof formSchema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (project: Project) => void
}

export function CreateProjectDialog({ open, onOpenChange, onSuccess }: CreateProjectDialogProps) {
  const router = useRouter()
  const [nameAvailability, setNameAvailability] = useState<{ isAvailable?: boolean; isChecking: boolean }>({
    isChecking: false,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const checkNameAvailability = debounce(async (name: string) => {
    if (!name) {
      setNameAvailability({ isChecking: false })
      return
    }

    setNameAvailability({ isChecking: true })
    try {
      const { available } = await checkProjectNameAvailability(name)
      setNameAvailability({ isAvailable: available, isChecking: false })
    } catch (error) {
      setNameAvailability({ isChecking: false })
    }
  }, 300)

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        checkNameAvailability(value.name || "")
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createProject({
        ...data,
      })

      if ("error" in result) {
        if (result.status === 409) {
          form.setError("name", {
            type: "manual",
            message: "A project with this name already exists",
          })
          return
        }
        throw new Error(typeof result.error === "string" ? result.error : "Failed to create project")
      }

      const project = result.data
      toast.success("Project created", {
        description: `Project "${project.name}" created successfully`,
      })

      onOpenChange(false)
      form.reset()
      router.push(`/#${project.slug}`)
      onSuccess?.(project)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to create project",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Create a new project to organize your images and training data.</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="My awesome project"
                        {...field}
                        autoComplete="off"
                        spellCheck="false"
                        data-form-type="other"
                        data-lpignore="true"
                        name="project-name"
                      />
                      {field.value && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {nameAvailability.isChecking ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : nameAvailability.isAvailable ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
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
                      className="grid grid-cols-3 gap-4"
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
                              className="flex aspect-square w-full max-w-[150px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 text-sm transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary"
                            >
                              <Icon className="mb-2 h-6 w-6" />
                              <span className="text-xs font-medium">{key}</span>
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
