// Worker thread for heavy flood fill pixel operations.
// Prevents blocking the React main thread and retains UI responsiveness.

const workerContext: {
  postMessage(message: unknown, transfer?: Transferable[]): void;
} = self as unknown as {
  postMessage(message: unknown, transfer?: Transferable[]): void;
};

self.onmessage = (e: MessageEvent) => {
  const { imgDataArray, w, h, targetX, targetY, fillR, fillG, fillB, fillA, jobId } = e.data;

  const data = new Uint8ClampedArray(imgDataArray);

  const targetIdx = (targetY * w + targetX) * 4;
  const startR = data[targetIdx];
  const startG = data[targetIdx + 1];
  const startB = data[targetIdx + 2];
  const startA = data[targetIdx + 3];

  if (startR === fillR && startG === fillG && startB === fillB && startA === fillA) {
    workerContext.postMessage({ success: false, jobId });
    return;
  }

  const stack: number[] = [targetX, targetY];
  const visited = new Uint8Array(w * h);
  visited[targetY * w + targetX] = 1;

  const matchColor = (idx: number) => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    return (
      Math.abs(r - startR) < 15 &&
      Math.abs(g - startG) < 15 &&
      Math.abs(b - startB) < 15 &&
      Math.abs(a - startA) < 15
    );
  };

  while (stack.length > 0) {
    const cy = stack.pop()!;
    const cx = stack.pop()!;

    const key = cy * w + cx;
    const idx = key * 4;
    data[idx] = fillR;
    data[idx + 1] = fillG;
    data[idx + 2] = fillB;
    data[idx + 3] = fillA;

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nKey = ny * w + nx;
        if (!visited[nKey] && matchColor(nKey * 4)) {
          visited[nKey] = 1;
          stack.push(nx);
          stack.push(ny);
        }
      }
    }
  }

  workerContext.postMessage({ success: true, imgDataArray: data.buffer, jobId }, [data.buffer]);
};
export {};
