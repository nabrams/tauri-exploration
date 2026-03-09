import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import{ SodukuGrid } from "~/components/soduku-grid/soduku-grid";

export default component$(() => {
  const greeting = useSignal<string>("");

  // const callTauri = $(async () => {
  //   const { invoke } = await import("@tauri-apps/api/core");
  //   const result = await invoke("greet").then((result) => {
  //     console.log("Tauri response:", result);
  //     greeting.value = String(result ?? "Command executed!");
  //   });
  //   console.log("Tauri response:", result);
  //   greeting.value = String(result ?? "Command executed!");
  // });

  return (
    <>
      <h1>Natalie's Soduku Generator</h1>
      <div>
        Let's play!
        <br />

      </div>
      <SodukuGrid />

      {greeting.value && <p>From Tauri: {greeting.value}</p>}
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
