import CryptoJS from "crypto-js";

// Clé de chiffrement "maître" pour le stockage local (dérivée du navigateur/session pour cette démo)
// Dans une app réelle, cela pourrait être plus complexe ou lié à un sel spécifique au navigateur.
const MASTER_SECRET = "mcp-data-gov-secure-session-key-2026";

interface EncryptedData {
  payload: string;
  expiresAt: number;
}

/**
 * Chiffre et stocke une valeur dans le localStorage avec une expiration de 24h.
 */
export function setSecureItem(key: string, value: string) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
  
  const encryptedPayload = CryptoJS.AES.encrypt(value, MASTER_SECRET).toString();
  
  const data: EncryptedData = {
    payload: encryptedPayload,
    expiresAt,
  };
  
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Récupère et déchiffre une valeur du localStorage. 
 * Supprime la clé si elle est expirée.
 */
export function getSecureItem(key: string): string | null {
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    const data: EncryptedData = JSON.parse(stored);
    
    // Vérification de l'expiration
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(key);
      console.warn(`Clé ${key} expirée et supprimée.`);
      return null;
    }

    const bytes = CryptoJS.AES.decrypt(data.payload, MASTER_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    return decrypted || null;
  } catch (error) {
    console.error(`Erreur de déchiffrement pour la clé ${key}:`, error);
    return null;
  }
}

/**
 * Exporte les données du localStorage au format JSON.
 */
export function exportToJSON(data: any, fileName: string = "data-export.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, fileName);
}

/**
 * Exporte un tableau d'objets au format CSV.
 */
export function exportToCSV(data: any[], fileName: string = "data-export.csv") {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(obj => 
    Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
  );
  
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, fileName);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
