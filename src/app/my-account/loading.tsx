import { PageSpinner } from "@/components/ui/PageSpinner";

// The old root-level loading.tsx was removed (it wrapped the whole app in Suspense, so every unknown URL streamed a
// 200 before the route layouts could 404). Routes without their own skeleton opt in to the spinner here.
export default PageSpinner;
