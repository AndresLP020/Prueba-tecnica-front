import { Suspense } from "react";
import { GraciasView } from "./GraciasView";

export default function GraciasPage() {
  return (
    <Suspense fallback={<main className="p-10 text-ash">Alineando órbita…</main>}>
      <GraciasView />
    </Suspense>
  );
}
