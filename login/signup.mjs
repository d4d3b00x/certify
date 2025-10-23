// signup.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.USERS_TABLE || "users";
const ORIGIN = process.env.CORS_ORIGIN || "*";

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ORIGIN,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Método no permitido" });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "JSON inválido" });
  }

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");

  // Validaciones mínimas
  if (!name || !email || !password) {
    return json(400, { error: "Faltan campos: name, email, password" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: "Email no válido" });
  }
  if (password.length < 8) {
    return json(400, { error: "La contraseña debe tener al menos 8 caracteres" });
  }

  // Hash de contraseña (no guardar en claro)
  const passwordHash = await bcrypt.hash(password, 10);

  const now = new Date().toISOString();
  const userId = crypto.randomUUID();

  try {
    // Evitar sobrescribir si el email ya existe
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: { email, userId, name, passwordHash, createdAt: now },
      ConditionExpression: "attribute_not_exists(email)"
    }));

    // Devuelve datos públicos (sin password)
    return json(201, { ok: true, user: { userId, name, email, createdAt: now } });
  } catch (e) {
    if (e?.name === "ConditionalCheckFailedException") {
      return json(409, { error: "El email ya está registrado" });
    }
    console.error(e);
    return json(500, { error: "Error interno" });
  }
};
