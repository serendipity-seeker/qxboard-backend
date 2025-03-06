const qubicSeedGen = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const letterSize = letters.length;
  let seed = "";
  for (let i = 0; i < 55; i++) {
    seed += letters[Math.floor(Math.random() * letterSize)];
  }
  return seed;
};

export default qubicSeedGen;
