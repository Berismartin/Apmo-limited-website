export type MutationResult = { error: string }

export function mutationError(error: unknown): MutationResult {
  console.error("[admin mutation]", error)
  if (error instanceof Error && error.message.trim()) {
    return { error: error.message }
  }
  return { error: "Something went wrong. Please try again." }
}

export async function runAdminMutation(
  work: () => Promise<void>
): Promise<MutationResult | void> {
  try {
    await work()
  } catch (error) {
    return mutationError(error)
  }
}

