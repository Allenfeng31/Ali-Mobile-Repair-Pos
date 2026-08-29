import { constants } from 'node:fs';
import { open, type FileHandle } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { isAbsolute } from 'node:path';

import {
  adaptLegacyPhoneRepairSnapshotRow,
  selectLegacyPhoneRepairSnapshotCandidates,
} from '../src/lib/legacyPhoneRepairSnapshotAdapter';
import { parseStrictJson } from '../src/lib/strictJson';

export const MAX_INPUT_BYTES = 64 * 1024 * 1024;

type OutputFormat = 'summary' | 'json';

function usage(): never {
  throw new Error('Usage: --input <absolute path> --format summary|json');
}

function parseArguments(arguments_: readonly string[]) {
  if (arguments_.length !== 4) usage();
  let input: string | undefined;
  let format: OutputFormat | undefined;
  for (let index = 0; index < arguments_.length; index += 2) {
    const flag = arguments_[index];
    const value = arguments_[index + 1];
    if (!value || (flag !== '--input' && flag !== '--format')) usage();
    if (flag === '--input') {
      if (input || !isAbsolute(value) || /^(?:https?|file):/i.test(value)) usage();
      input = value;
    } else {
      if (format || (value !== 'summary' && value !== 'json')) usage();
      format = value;
    }
  }
  if (!input || !format) usage();
  return { input, format };
}

type ReadonlyLocalFile = Pick<FileHandle, 'close' | 'readFile' | 'stat'>;
type OpenReadonlyLocalFile = (path: string, flags: number) => Promise<ReadonlyLocalFile>;

export async function readStrictLocalJsonFile(path: string, openFile: OpenReadonlyLocalFile = open) {
  const noFollow = constants.O_NOFOLLOW;
  if (!Number.isInteger(noFollow)) {
    throw new Error('Secure no-follow file access is unavailable.');
  }

  let handle: ReadonlyLocalFile | undefined;
  try {
    handle = await openFile(path, constants.O_RDONLY | noFollow);
    const details = await handle.stat();
    if (!details.isFile() || details.size > MAX_INPUT_BYTES) {
      throw new Error('Input must be a regular local JSON file within the size limit.');
    }
    const bytes = await handle.readFile();
    if (bytes.byteLength > MAX_INPUT_BYTES) {
      throw new Error('Input exceeds the size limit.');
    }
    return parseStrictJson(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } finally {
    await handle?.close();
  }
}

function formatSummary(report: ReturnType<typeof selectLegacyPhoneRepairSnapshotCandidates>, validatedAt: string) {
  const counts = (values: Readonly<Record<string, number>>) => Object.entries(values).length
    ? Object.entries(values).map(([key, value]) => `${key}=${value}`).join(', ')
    : 'none';
  return [
    'DRY RUN ONLY',
    'NO BASELINE WRITTEN',
    `Source snapshot checksum: ${report.sourceSnapshot.checksum}`,
    `Validated at: ${validatedAt}`,
    `Source snapshot schema version: ${report.sourceSnapshot.schemaVersion}`,
    `Examined: brands=${report.counts.brands}, models=${report.counts.models}, repairs=${report.counts.repairsExamined}`,
    `Candidates: ${report.counts.candidates}`,
    `Excluded: ${report.counts.excluded}`,
    `Candidate identity checksum: ${report.candidateIdentityChecksum}`,
    `Candidate topology checksum: ${report.candidateTopologyChecksum}`,
    `By brand: ${counts(report.byBrand)}`,
    `By repair slug: ${counts(report.byRepairSlug)}`,
    `By origin: ${counts(report.byOrigin)}`,
    `Exclusions by reason: ${counts(report.exclusionsByReason)}`,
  ].join('\n');
}

function safeJson(report: ReturnType<typeof selectLegacyPhoneRepairSnapshotCandidates>, validatedAt: string) {
  return {
    dryRun: true,
    baselineWritten: false,
    sourceSnapshot: { ...report.sourceSnapshot, validatedAt },
    candidateIdentityChecksum: report.candidateIdentityChecksum,
    candidateTopologyChecksum: report.candidateTopologyChecksum,
    counts: report.counts,
    byBrand: report.byBrand,
    byRepairSlug: report.byRepairSlug,
    byOrigin: report.byOrigin,
    exclusionsByReason: report.exclusionsByReason,
    candidates: report.candidates,
    exclusions: report.exclusions,
  };
}

export async function runLocalDryRun(arguments_: readonly string[]) {
  const { input, format } = parseArguments(arguments_);
  const row = await readStrictLocalJsonFile(input);
  const { sourceSnapshot } = adaptLegacyPhoneRepairSnapshotRow(row);
  const report = selectLegacyPhoneRepairSnapshotCandidates(row);
  return format === 'summary'
    ? formatSummary(report, sourceSnapshot.validatedAt)
    : JSON.stringify(safeJson(report, sourceSnapshot.validatedAt), null, 2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runLocalDryRun(process.argv.slice(2)).then(
    (output) => process.stdout.write(`${output}\n`),
    () => {
      process.stderr.write('Legacy phone repair snapshot dry run failed.\n');
      process.exitCode = 1;
    },
  );
}
