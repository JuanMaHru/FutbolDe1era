// React viene del CDN (UMD) como global.
export const React = (window as unknown as { React: typeof import("react") }).React;
