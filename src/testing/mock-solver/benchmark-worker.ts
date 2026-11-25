import { createBlockProducer } from './benchmark-protocol.ts';
import type {
  BlockRequest,
  WorkerControl,
  WorkerReply,
} from './benchmark-protocol.ts';

const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<WorkerControl>) => void) | null;
  postMessage(message: { type: 'pong'; id: number }): void;
};

scope.onmessage = ({ data }) => {
  if (data.type === 'ping') {
    scope.postMessage({ type: 'pong', id: data.id });
    return;
  }
  const port = data.port;
  try {
    const produce = createBlockProducer(data.options);
    port.onmessage = (event: MessageEvent<BlockRequest>) => {
      try {
        const block = produce(event.data.index);
        port.postMessage(block, [block.samples.buffer]);
      } catch (error) {
        const failure: WorkerReply = {
          type: 'failure',
          message: String(error),
        };
        port.postMessage(failure);
        port.close();
      }
    };
  } catch (error) {
    const failure: WorkerReply = {
      type: 'failure',
      message: String(error),
    };
    port.postMessage(failure);
    port.close();
  }
};
