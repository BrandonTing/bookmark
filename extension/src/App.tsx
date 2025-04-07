import { For, Show, createEffect, createMemo, createResource, createSignal } from "solid-js";
import "./App.css";
import { createBookmark, supabase } from "./schema";

export type Bookmark = {
  url: string
  title: string
}

const App = () => {
  const [bookmark, setBookmark] = createSignal<Bookmark>({
    url: "",
    title: "",
  })
  const [labels, setLabels] = createSignal<string[]>([])
  const [labelInput, setLabelInput] = createSignal("")
  const [isLoading, setIsLoading] = createSignal(false)
  const [existingLabels, { refetch, mutate }] = createResource(labelInput, async (input) => {
    if (input.length < 3) return [];
    if (!input) return [];
    // Fetch existing labels from the database
    // use supabase
    const { data } = await supabase
      .from('labels')
      .select('label')
      .ilike('label', `%${input}%`);
    return data?.map((label) => label.label as string) || [];
  })
  const suggestLabels = createMemo(() => {
    return existingLabels()?.filter((label) => !labels().includes(label)) || [];
  })
  createEffect(() => {
    const handler = setTimeout(() => {
      refetch();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  });

  // create effect
  createEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        setBookmark({
          url: currentTab.url ?? '',
          title: currentTab.title ?? '',
        })
      }
    })
  });
  function handleTitleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setBookmark((prev) => ({
      ...prev,
      title: target.value,
    }))
  }
  function handleAddLabel(e: KeyboardEvent) {
    const labelInputValue = labelInput().trim()
    if (e.key === "Enter" && labelInputValue) {
      e.preventDefault()
      if (!labels().includes(labelInputValue)) {
        setLabels((prev) => [...prev, labelInputValue])
      }
      setLabelInput("")
    }
  }
  function handleRemoveLabel(label: string) {
    setLabels((prev) => prev.filter((l) => l !== label))
  }
  async function handleSubmit(e: Event) {
    e.preventDefault()
    setIsLoading(true)
    const bookmarkData = {
      ...bookmark(),
      labels: labels(),
    }
    // Save the bookmark data to the database or perform any other action
    // use supabase
    await createBookmark(bookmarkData)
    setIsLoading(false)
  }
  return (
    <div class="border border-gray-300 shadow-lg rounded-lg overflow-hidden">
      <div class="w-80 p-4 bg-white text-gray-800">
        <header class="mb-4">
          <h1 class="text-lg font-bold text-gray-900">Save Bookmark</h1>
        </header>

        <form onSubmit={handleSubmit} class="space-y-3">
          <div class="space-y-1">
            <label for="title" class="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={bookmark().title}
              onChange={handleTitleChange}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div class="space-y-1 relative">
            <label for="labels" class="block text-sm font-medium text-gray-700">
              Labels
            </label>
            <input
              type="text"
              id="labels"
              value={labelInput()}
              onInput={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
              placeholder="Type and press Enter to add"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Show when={suggestLabels().length > 0}>
              <div class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-auto h-14">
                <ul class="py-1">
                  <For each={suggestLabels()} fallback={<div>Loading...</div>}>
                    {(label) => (
                      <li
                        class="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setLabels((prev) => [...prev, label])
                          setLabelInput("")
                          mutate([])
                        }}
                      >
                        {label}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </Show>
            <Show when={labels().length > 0}>
              <div class="flex flex-wrap gap-1 mt-2">
                <For each={labels()} fallback={<div>Loading...</div>}>
                  {(label) => <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      class="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>}
                </For>
              </div>
            </Show>
          </div>
          <button
            type="submit"
            disabled={isLoading()}
            class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading() ? "Saving..." : "Save Bookmark"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
