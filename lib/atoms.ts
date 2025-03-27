import { Project } from "@prisma/client"
import { atom } from "jotai"

export const selectedProjectAtom = atom<Project | null>(null)
