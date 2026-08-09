import { promptVersion } from "./prompt-hash";

const pv = promptVersion();
console.log(JSON.stringify(pv, null, 2));
