import { ImagePanel } from "@/components/ImagePanel"
import { MainPanel } from "@/components/MainPanel"
import { Navbar } from "@/components/nav/Navbar"

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <ImagePanel />
        <MainPanel />
      </div>
    </div>
  )
}
