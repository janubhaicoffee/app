import { Knock } from "@knocklabs/node";

const knockApiKey = process.env.KNOCK_API_KEY;

export const knock = new Knock(knockApiKey);

export const isKnockConfigured = Boolean(knockApiKey);

/**
 * Helper to trigger a Knock workflow
 */
export async function triggerNotification(
  workflowId: string,
  recipients: string[],
  data: Record<string, any> = {}
) {
  if (!isKnockConfigured) {
    console.warn("Knock is not configured. Skipping notification.");
    return null;
  }

  try {
    const response = await knock.workflows.trigger(workflowId, {
      recipients,
      data,
    });
    return response;
  } catch (error) {
    console.error("Error triggering Knock notification:", error);
    throw error;
  }
}
