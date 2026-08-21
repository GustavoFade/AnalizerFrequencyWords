const { IncrementalFrequencyAnalyzer } = require('../dist/domain/frequency-analyzer.js');

const chunk = 'shared words '.repeat(128);
const chunkCount = 10000;
const analyzer = new IncrementalFrequencyAnalyzer();
let peak = process.memoryUsage().heapUsed;

for (let index = 0; index < chunkCount; index += 1) {
  analyzer.addChunk(chunk);
  peak = Math.max(peak, process.memoryUsage().heapUsed);
}

const result = analyzer.finish();
console.log(JSON.stringify({
  chunks: chunkCount,
  bytesProcessed: chunk.length * chunkCount,
  uniqueWords: result.length,
  peakHeapBytes: peak
}));
