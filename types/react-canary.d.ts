/**
 * O App Router roda sobre a build canary do React que o Next vendoriza, onde
 * `ViewTransition` existe. Os tipos correspondentes ficam em `react/canary`,
 * que não entra no `index.d.ts` estável — sem esta referência o TypeScript não
 * conhece o componente.
 */
/// <reference types="react/canary" />
