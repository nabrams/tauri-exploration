import { $, component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const greeting = useSignal<string>("");

  const callTauri = $(async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke("greet");
    console.log("Tauri response:", result);
    greeting.value = String(result ?? "Command executed!");
  });

  return (
    <>
      <h1>Welcome to Natalie's Tauri Exploration App</h1>
      <div>
        Let's build something great together!
        <br />
        <span style="font-size: 3em;">🧜‍♀️</span>
      </div>
      <button onClick$={callTauri}>Call Tauri</button>
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
