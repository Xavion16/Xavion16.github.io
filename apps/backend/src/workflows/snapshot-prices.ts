import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { snapshotVariantPricesStep, type SnapshotInput } from "./steps/snapshot-variant-prices"

export const snapshotPricesWorkflow = createWorkflow(
  "snapshot-prices",
  (input: SnapshotInput) => {
    const result = snapshotVariantPricesStep(input)
    return new WorkflowResponse(result)
  },
)
