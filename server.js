import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadModel, translate, unloadModel, BERGAMOT_EN_ES } from "@qvac/sdk";

const PORT = Number(process.env.PORT || 3000);
const root = fileURLToPath(new URL(".", import.meta.url));
const indexPath = join(root, "public", "index.html");
let modelId = null;
let loading = null;

async function getModel() {
  if (modelId) return modelId;
  if (loading) return loading;
  loading = loadModel({
    modelSrc: BERGAMOT_EN_ES,
    modelType: "nmtcpp-translation",
    modelConfig: { engine: "Bergamot", from: "en", to: "es" },
    onProgress: p => {
      if (p?.percentage != null) console.log(`Model download: ${p.percentage.toFixed(0)}%`);
    }
  });
  try { modelId = await loading; return modelId; }
  finally { loading = null; }
}

function json(res, status, value) {
  res.writeHead(status, {"Content-Type":"application/json; charset=utf-8"});
  res.end(JSON.stringify(value));
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      const html = await readFile(indexPath, "utf8");
      res.writeHead(200, {"Content-Type":"text/html; charset=utf-8"});
      res.end(html);
      return;
    }
    if (req.method === "POST" && req.url === "/api/translate") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const text = JSON.parse(body)?.text;
      if (typeof text !== "string" || !text.trim()) {
        json(res, 400, {error:"Enter some English text."}); return;
      }
      const id = await getModel();
      const run = translate({modelId:id, text:text.trim(), modelType:"nmtcpp-translation", stream:false});
      const translated = await run.text;
      json(res, 200, {translated, onDevice:true, engine:"QVAC + Bergamot"});
      return;
    }
    res.writeHead(404); res.end("Not found");
  } catch (error) {
    console.error("QVAC error:", error);
    json(res, 500, {error:error?.message || "QVAC translation failed."});
  }
});

server.listen(PORT, () => {
  console.log(`QVAC Offline Translator running on port ${PORT}`);
  console.log("Inference is local through QVAC.");
});

async function shutdown() {
  server.close();
  if (modelId) { try { await unloadModel({modelId}); } catch {} }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
