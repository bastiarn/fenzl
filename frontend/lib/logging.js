import path from "path";
import fs from "fs";
const LOG_FILE = "logs/log.csv";
const LOG_PATH = path.join(process.cwd(), LOG_FILE);

const unixNow = () => Math.round(Date.now() / 1000);
const unixToDate = (timestamp) => {
  if (!timestamp) timestamp = unixNow();
  return new Date(timestamp * 1000).toLocaleTimeString("de");
};

export default function log(dB) {
  const time = unixNow();
  const line = `${[time, dB].join(", ")}\n`;
  console.log(`AVG received: ${dB} at ${unixToDate(time)}`);
  fs.appendFile(LOG_PATH, line, (err) => {
    if (err) console.log(err);
  });
}
