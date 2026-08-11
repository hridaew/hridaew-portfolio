"use client";

import { VoiceRecorder } from "@/components/recorder/VoiceRecorder";

export default function RecorderSheet() {
  return (
    <div className="relative w-full bg-paper-sunken">
      <VoiceRecorder embed />
    </div>
  );
}
