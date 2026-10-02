export declare function normalizeArtifactPath(value: string): string;
export declare function compareCanonicalPaths(left: string, right: string): number;
export declare function inventory(root: string, label: string): {
  label: string;
  count: number;
  sha256: string;
  records: Array<{ path: string; sha256: string }>;
};
