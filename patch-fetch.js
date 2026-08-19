const fs = require('fs');
const path = 'C:/Users/Administrator/AppData/Roaming/npm/node_modules/vercel/dist/chunks/chunk-52QYYTM5.js';
let content = fs.readFileSync(path, 'utf8');

// Replace the fetch function to use native fetch without dispatcher
const oldFetch = `function fetch(input, init) {
  const options = { ...init };
  if (fetchDispatcher) {
    options.dispatcher = fetchDispatcher;
  }
  if (init?.body instanceof Readable) {
    options.duplex = "half";
  }
  return globalThis.fetch(
    input,
    options
  );
}`;

const newFetch = `function fetch(input, init) {
  const options = {...init};
  delete options.dispatcher;
  return globalThis.fetch(input, options);
}`;

if (content.includes(oldFetch)) {
  content = content.replace(oldFetch, newFetch);
  fs.writeFileSync(path, content);
  console.log('Patched fetch in chunk-52QYYTM5.js');
} else {
  console.log('Old fetch pattern not found');
  // Try to find and replace the relevant section
  const idx = content.indexOf('function fetch(input, init)');
  if (idx >= 0) {
    const endIdx = content.indexOf('function directFetch', idx);
    if (endIdx > idx) {
      const before = content.substring(0, idx);
      const after = content.substring(endIdx);
      const newContent = before + newFetch + '\n' + after;
      fs.writeFileSync(path, newContent);
      console.log('Patched fetch using index replacement');
    }
  }
}
