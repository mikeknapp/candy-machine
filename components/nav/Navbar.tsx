import { ThemeToggle } from "@/components/theme/ThemeToggle"
import Image from "next/image"
import { ProjectSelector } from "./ProjectSelector"

export const Navbar = () => {
  return (
    <nav className="flex flex-row items-center justify-between px-4 py-2 bg-pink-200 dark:bg-pink-900">
      <div>
        <Image src="/icon.png" alt="Candy Machine" width={50} height={50} draggable={false} />
      </div>
      <div className="flex flex-row items-center space-x-2">
        <ProjectSelector />
        <ThemeToggle />
      </div>
    </nav>
  )
}
