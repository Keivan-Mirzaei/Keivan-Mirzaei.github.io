import { chooseComputerMove } from './othello-math.mjs';
self.onmessage = ({ data }) => {
  self.postMessage({ move: chooseComputerMove(data.state, data.difficulty) });
};
