export const publicCopyProhibitedPhrases = [
  "platform concept",
  "content placeholders require verification",
  "the website now",
  "the landing page presents",
  "this page presents",
  "requiring verification",
  "requires verification",
  "draft copy",
  "sample content",
  "mock content"
] as const;

export type PublicCopyIssue = {
  filePath: string;
  phrase: string;
};

export function findProhibitedPublicCopyIssues(files: Record<string, string>): PublicCopyIssue[] {
  const issues: PublicCopyIssue[] = [];

  for (const [filePath, source] of Object.entries(files)) {
    const lowerSource = source.toLowerCase();
    for (const phrase of publicCopyProhibitedPhrases) {
      if (lowerSource.includes(phrase.toLowerCase())) {
        issues.push({ filePath, phrase });
      }
    }
  }

  return issues;
}
