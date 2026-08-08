import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://b2324eda04a9ca803e2c673366f8078c@o4511794851348480.ingest.us.sentry.io/4511872287703040",
  integrations: [
    nodeProfilingIntegration(),
  ],

  // Send structured logs to Sentry
  enableLogs: true,

  // Tracing - Capture 100% of transactions
  tracesSampleRate: 1.0,

  // Profiling - Set sampling rate for profiling sessions
  profileSessionSampleRate: 1.0,

  // Trace lifecycle automatically enables profiling during active traces
  profileLifecycle: 'trace',

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below:
    // userInfo: false,
    // httpBodies: [],
  },
});

// Profiling happens automatically after setting it up with Sentry.init().
// All spans (unless discarded by sampling) will have profiling data attached.
Sentry.startSpan({
  name: "ShopFlow API Bootstrap",
}, () => {
  // API bootstrap is profiled automatically
});
