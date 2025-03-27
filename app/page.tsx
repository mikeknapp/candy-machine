import { ImagePanel } from "@/components/ImagePanel"
import { MainPanel } from "@/components/MainPanel"
import { Navbar } from "@/components/nav/Navbar"
import { DragAndDrop } from "@/components/upload/DragAndDrop"

export default function Home() {
  return (
    <DragAndDrop>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <ImagePanel />
          <MainPanel />
        </div>
      </div>
    </DragAndDrop>
  )
}
