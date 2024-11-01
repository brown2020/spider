// components/ClientWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const GameContainer = dynamic(() => import("./game/GameContainer"), {
  ssr: false,
});

export default function ClientWrapper() {
  return <GameContainer />;
}
