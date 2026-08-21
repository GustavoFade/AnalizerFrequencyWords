import { SerialTaskQueue } from '../src/application/serial-task-queue';

describe('SerialTaskQueue', () => {
  it('runs tasks in insertion order', async () => {
    const queue = new SerialTaskQueue();
    const events: string[] = [];
    let releaseFirst!: () => void;
    const first = new Promise<void>((resolve) => { releaseFirst = resolve; });

    const firstResult = queue.add(async () => {
      events.push('first-start');
      await first;
      events.push('first-end');
      return 1;
    });
    const secondResult = queue.add(async () => {
      events.push('second');
      return 2;
    });

    await Promise.resolve();
    expect(events).toEqual(['first-start']);
    releaseFirst();
    await expect(firstResult).resolves.toBe(1);
    await expect(secondResult).resolves.toBe(2);
    expect(events).toEqual(['first-start', 'first-end', 'second']);
  });
});
