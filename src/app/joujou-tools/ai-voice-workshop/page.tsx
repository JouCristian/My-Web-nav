import { HideSpacetime } from "@/components/hide-spacetime"
import { VoiceWorkshopClient } from "@/components/ai-voice-workshop/VoiceWorkshopClient"

export default function AIVoiceWorkshopPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-transparent px-4 py-8 pt-24 text-white sm:px-6 lg:px-10">
      <HideSpacetime />

      <div className="relative z-10 mx-auto w-full max-w-[1560px]">
        <VoiceWorkshopClient />
      </div>
    </main>
  )
}
