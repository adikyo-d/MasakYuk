const API_BASE_URL = "http://10.198.121.130:3000";

export type AiRecipeResult = {
  title: string;
  category: string;
  ingredients: { name: string; amount: string }[];
  steps: {
    instruction: string;
    hasTimer: boolean;
    durationSeconds: number;
  }[];
};

export async function generateRecipeFromYoutube(
  videoId: string,
  videoUrl: string,
): Promise<AiRecipeResult> {
  const response = await fetch(`${API_BASE_URL}/api/generate-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId, videoUrl }),
  });

  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}
