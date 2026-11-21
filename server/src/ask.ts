import { answerQuestion } from "./answer.js";

const q = process.argv.slice(2).join(" ");
console.log(JSON.stringify(await answerQuestion(q), null, 2));