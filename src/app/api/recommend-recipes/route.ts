import { handleRecommendRecipes } from "@/server/apiHandlers";

export async function POST(request: Request) {
  return handleRecommendRecipes(request);
}
