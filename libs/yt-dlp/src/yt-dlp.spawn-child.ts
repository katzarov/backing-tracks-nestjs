import { spawn } from 'node:child_process';

const subprocessTimeoutInMs = 60 * 60 * 1000; // 1 hour
const binaryPath = 'yt-dlp';

export const spawnYtDlpChild = async (
  args: string[],
  onStdOutDataCb?: (data: string) => void,
) => {
  return new Promise<string>((resolve, reject) => {
    let stdoutData = '';
    let stderrData = '';

    const subprocess = spawn(binaryPath, args, {
      timeout: subprocessTimeoutInMs,
    });

    subprocess.on('error', (err) => {
      // should emit a close/exit event with a non 0 code and we will reject.
      console.error('Failed to start subprocess.', err);
    });

    subprocess.stdout.on('data', (data) => {
      stdoutData += data.toString();

      if (onStdOutDataCb) {
        onStdOutDataCb(data.toString());
      }
    });

    subprocess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    // listening to the close event (and not exit) because we want to make sure we get all the output from stdout in the case when we are getting the info for a youtube video
    // exit code is null when process was aborted by a (timeout) signal.
    subprocess.on('close', (code) => {
      if (code === 0) {
        resolve(stdoutData);
      } else {
        reject(
          new Error(
            `\nYt-dlp command exited with a non-0 code: ${code}\n${stderrData}`,
          ),
        );
      }
    });
  });
};
