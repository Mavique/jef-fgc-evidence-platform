export type StagingArtifactOptions = {
  outputRoot?: string;
  generatedServer?: string;
  generatedClient?: string;
  stagingMetadata?: string;
};

export declare function packageStagingArtifact(options?: StagingArtifactOptions): {
  output: string;
  configPath: string;
  manifest: {
    sourceCommit: string;
    workerName: string;
    artifactSha256: string;
    server: { label: string; count: number; sha256: string };
    client: { label: string; count: number; sha256: string };
  };
};
