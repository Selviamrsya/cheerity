import { Client as WorkflowClient} from "@upstash/workflow";
import config from "@/lib/config";

export const workflowClient = new WorkflowClient({
    baseUrl: config.env.upstash.qtashUrl || "https://qstash.upstash.io",
    token: config.env.upstash.qtashToken || "dummy-token",
});
