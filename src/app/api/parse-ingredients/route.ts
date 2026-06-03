import { handleParseIngredients } from "@/server/apiHandlers";

export async function POST(request: Request) {
  return handleParseIngredients(request);
}
