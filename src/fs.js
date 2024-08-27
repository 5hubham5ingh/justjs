import { open, O_RDONLY, read, close, mkdir, getcwd, realpath, stat as dirStats, O_WRONLY, write, O_CREAT, O_TRUNC } from 'os'
import { Error as osError, getenv } from 'std'
const readFile = (filePath) => {
  const fd = open(filePath, O_RDONLY);
  if (fd < 0) {
    console.log(`Failed to open file "${filePath}": ${fd}`);
  }

  const fileContent = [];
  const buffer = new Uint8Array(4096);
  while (true) {
    const bytesRead = read(fd, buffer.buffer, 0, buffer.length);
    if (bytesRead < 0) {
      close(fd);
      throw new Error(`Failed to read file "${filePath}": ${bytesRead}`);
    }
    if (bytesRead === 0) {
      // End of file
      break;
    }
    fileContent.push(String.fromCharCode.apply(null, buffer.subarray(0, bytesRead)));
  }
  close(fd);

  const fileData = fileContent.join('');
  return fileData;

}

const writeFile = (filePath, content) => {
  try {
    const lastSlashIndex = filePath.lastIndexOf('/');
    const dirPath = lastSlashIndex === -1 ? '.' : filePath.slice(0, lastSlashIndex);

    try {
      mkdir(dirPath, 0o755);
    } catch (err) {
      if (err.errno !== osError.EEXIST) {
        throw err;
      }
    }

    const fd = open(filePath, O_WRONLY | O_CREAT | O_TRUNC, 0o644);
    if (fd < 0) {
      throw new Error(`Failed to open file "${filePath}" for writing: ${fd}`);
    }

    const buffer = new Uint8Array(content.length);
    for (let i = 0; i < content.length; i++) {
      buffer[i] = content.charCodeAt(i);
    }

    const bytesWritten = write(fd, buffer.buffer, 0, buffer.length);
    if (bytesWritten < 0) {
      close(fd);
      throw new Error(`Failed to write to file "${filePath}": ${bytesWritten}`);
    }

    close(fd);
  } catch (error) {
    console.error(`Error writing to file "${filePath}":`, error);
    throw error;
  }
}

const ensureDir = dir => {
  if (typeof dir !== 'string') throw new TypeError('Invalid directory type.');
  let directory;
  switch (dir[0]) {
    case '~': directory = getenv('HOME')?.concat(dir.slice(1)); break;
    case '/': directory = dir; break;
    default: const path = realpath(dir);
      if (path[1] !== 0) throw new Error('Failed to read directory');
      directory = path[0];
  }

  directory.split('/').forEach((dir, i, path) => {
    if (!dir) return;
    const currPath = path.filter((_, j) => j <= i).join('/');
    const dirStat = dirStats(currPath)[0];
    if (!dirStat) mkdir(currPath);
  });

}

export { writeFile, readFile, ensureDir }
