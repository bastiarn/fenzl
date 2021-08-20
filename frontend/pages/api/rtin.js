import log from "../../lib/logging";

export default (req, res) => {
  if (req.method !== "POST" || req.query.api_key !== process.env.RTIN_API_KEY) {
    res.status(401).end();
  }
  const value = req.body.value;
  if (!value) {
    res.status(400).end();
  }
  log(value);
  //Event
  res.socket.io.emit("rt_in", value);
  res.end();
};
