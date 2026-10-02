export type StagingConfigCompositionOptions = {
  generatedPath?: string;
  stagingPath?: string;
  outputPath?: string;
  approvedBindings?: {
    hyperdriveId?: string;
    kvId?: string;
  };
};

export declare function composeStagingConfig(options?: StagingConfigCompositionOptions): {
  outputPath: string;
  workerName: string;
  hyperdriveBinding: "HYPERDRIVE";
  kvBinding: "VINEXT_KV_CACHE";
};
