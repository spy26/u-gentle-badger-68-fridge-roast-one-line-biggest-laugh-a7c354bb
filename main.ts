import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: one line roasting a smart fridge, at most 200 characters,
// ASCII only, a single line.
const ENTRY =
  "My smart fridge's camera identified my leftovers as a science experiment and emailed me the lab results.";

// Gate: the entry must be non-empty, at most 200 characters, a single
// line, and ASCII only. Anything else is rejected with a non-zero exit.
function validateEntry(text: string): string | null {
  const chars = Array.from(text);
  if (chars.length === 0) {
    return "entry is empty";
  }
  if (chars.length > 200) {
    return `entry is ${chars.length} characters, over the 200 limit`;
  }
  if (text.includes("\n") || text.includes("\r")) {
    return "entry must be a single line";
  }
  if (text !== text.trim()) {
    return "entry must not start or end with whitespace";
  }
  for (const ch of chars) {
    if (ch.codePointAt(0)! > 127) {
      return "entry must be ASCII only";
    }
  }
  if (text.trim().length === 0) {
    return "entry must not be only whitespace";
  }
  return null;
}

const problem = validateEntry(ENTRY);
if (problem !== null) {
  console.error(`invalid entry: ${problem}`);
  process.exit(1);
}

// The graded artifact: the harness reads the entry from /output/entry.txt.
mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", ENTRY, "utf8");
const graded = readFileSync("/output/entry.txt", "utf8");
if (graded !== ENTRY) {
  console.error("invalid entry: /output/entry.txt did not round-trip");
  process.exit(1);
}

// The same line, kept beside the program in the repository. The grading
// sandbox may mount the repository read-only, so a failure to write here
// is tolerated: the artifact above is what the grader reads.
try {
  writeFileSync(join(process.cwd(), "entry.txt"), ENTRY, "utf8");
  const kept = readFileSync(join(process.cwd(), "entry.txt"), "utf8");
  if (kept !== ENTRY) {
    console.error("invalid entry: entry.txt did not round-trip");
    process.exit(1);
  }
} catch {
  // Repository not writable in this run; the graded artifact is already
  // written and verified, so continue.
}

// Print exactly the entry, one line, nothing else.
console.log(ENTRY);
