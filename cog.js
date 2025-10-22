



// ====== CONFIG ======
   const authority= "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_Nm2FEuL1J";
    const USER_POOL_ID = "eu-central-1_Nm2FEuL1J";
    const APP_CLIENT_ID = "2rg0eg5ve63uo4ocn25scbrstg";
    const IDENTITY_POOL_ID = "eu-central-1:71122039-a3d7-4450-b3fb-f5c5ee33a8ec";
    const HOSTED_UI_DOMAIN = "https://eu-central-1nm2feul1j.auth.eu-central-1.amazoncognito.com";
    const REDIRECT_URI = "https://main.drlgxq3ev7tby.amplifyapp.com"; // asegúrate que esté en "Allowed callback URLs"
   const SCOPES = ["email"];

// --- PKCE helpers ---
async function sha256(buf){ return crypto.subtle.digest("SHA-256", buf); }
function b64u(uint8){
  return btoa(String.fromCharCode(...new Uint8Array(uint8)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export async function createPKCE() {
  const verifier = b64u(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = b64u(await sha256(new TextEncoder().encode(verifier)));
  sessionStorage.setItem("pkce_verifier", verifier); // queda disponible para index.html
  return { verifier, challenge };
}

// --- Lanzar Hosted UI ---
export async function startLogin(redirectUri) {
  const { challenge } = await createPKCE();
  const url = new URL(`${HOSTED_UI_DOMAIN}/oauth2/authorize`);
  url.searchParams.set("client_id", APP_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  location.assign(url.toString());
}

// --- Intercambiar code -> tokens ---
export async function exchangeCodeForTokens(code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: APP_CLIENT_ID,
    redirect_uri: redirectUri,
    code_verifier: sessionStorage.getItem("pkce_verifier") || "",
    code
  });
  const res = await fetch(`${HOSTED_UI_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=> "");
    throw new Error(`Token exchange failed (${res.status}) ${txt}`);
  }
  return res.json(); // { id_token, access_token, refresh_token?, expires_in, token_type }
}

// --- JWT helper ---
export function decodeJwt(jwt){
  const [,p] = jwt.split(".");
  return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));
}

// --- Guardar/cargar sesión ---
export function saveSession(tokens) {
  sessionStorage.setItem("id_token", tokens.id_token);
  sessionStorage.setItem("access_token", tokens.access_token);
  if (tokens.refresh_token) sessionStorage.setItem("refresh_token", tokens.refresh_token);
}
export function getSession() {
  const id = sessionStorage.getItem("id_token");
  const at = sessionStorage.getItem("access_token");
  return id ? { id_token: id, access_token: at, claims: decodeJwt(id) } : null;
}
export function clearSession() {
  sessionStorage.removeItem("id_token");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("pkce_verifier");
}

// --- Logout Hosted UI ---
export function logout(redirectUri){
  clearSession();
  const url = new URL(`${HOSTED_UI_DOMAIN}/logout`);
  url.searchParams.set("client_id", APP_CLIENT_ID);
  url.searchParams.set("logout_uri", redirectUri);
  location.assign(url.toString());
}

// --- Credenciales IAM (para DynamoDB) ---
import { CognitoIdentityClient } from "https://cdn.skypack.dev/@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "https://cdn.skypack.dev/@aws-sdk/credential-provider-cognito-identity";

export async function getIamCredentials(idTokenJwt){
  const providerKey = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
  const credentials = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
    logins: { [providerKey]: idTokenJwt }
  });
  return credentials(); // devuelve { accessKeyId, secretAccessKey, sessionToken, expiration, ... }
}


