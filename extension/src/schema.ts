import { createClient } from "@supabase/supabase-js";
import type { Bookmark } from "./App";

const supabaseUrl = "https://sqpxesgxtapmkbbjkpah.supabase.co";

const supabaseKey = import.meta.env.SUPABASE_KEY ?? "";
export const supabase = createClient(supabaseUrl, supabaseKey);
export function createBookmark(
  bookmark: Bookmark & {
    labels: string[];
  },
) {
  const { url, title, labels } = bookmark;
  return Promise.all([
    supabase.from("labels").upsert(labels.map((label) => ({
      label,
    })), { onConflict: 'label' }),
    supabase
      .from("bookmarks")
      .upsert([
        {
          url,
          title,
          labels: labels.join(","),
        },
      ], { onConflict: 'url' })
  ])
}
