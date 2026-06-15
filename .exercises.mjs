import { MongoClient } from "mongodb";
const uri = "mongodb://root:izpoZS7q0Ha9UVL8@localhost:27017/fitgram?authSource=admin";

const page = Math.max(1, parseInt(process.argv[2] ?? "1", 10));
const size = Math.max(1, parseInt(process.argv[3] ?? "20", 10));
const skip = (page - 1) * size;

const c = new MongoClient(uri);
await c.connect();
const col = c.db("fitgram").collection("Exercises");

const filter = { isDeleted: { $ne: true } };
const total = await col.countDocuments(filter);
const pages = Math.ceil(total / size);

const rows = await col
  .find(filter, {
    projection: { "translations.en.name": 1, type: 1, muscleGroups: 1, tags: 1 },
  })
  .sort({ _id: -1 })
  .skip(skip)
  .limit(size)
  .toArray();

console.log(`Página ${page}/${pages}  ·  ${total} exercícios (não-apagados)  ·  ${size}/página\n`);
rows.forEach((r, i) => {
  const n = skip + i + 1;
  const name = r.translations?.en?.name ?? "(sem nome)";
  const mg = (r.muscleGroups ?? []).join(", ") || "—";
  console.log(`${String(n).padStart(4)}. ${name.padEnd(34)} [${r.type ?? "?"}]  ${mg}`);
});
await c.close();
