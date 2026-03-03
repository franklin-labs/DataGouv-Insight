import { describe, it, expect, vi, beforeEach } from "vitest";
import { setSecureItem, getSecureItem } from "./security";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

describe("Security Utils", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should encrypt and decrypt a value correctly", () => {
    const key = "test-key";
    const value = "secret-value";
    
    setSecureItem(key, value);
    
    // Check that it's stored but not in plain text
    const stored = localStorage.getItem(key);
    expect(stored).not.toBeNull();
    expect(stored).not.toContain(value);
    
    // Decrypt and check
    const decrypted = getSecureItem(key);
    expect(decrypted).toBe(value);
  });

  it("should return null and remove item if expired", () => {
    const key = "expired-key";
    const value = "some-value";
    
    // Set item
    setSecureItem(key, value);
    
    // Manually modify expiration in localStorage
    const stored = JSON.parse(localStorage.getItem(key)!);
    stored.expiresAt = Date.now() - 1000; // 1 second ago
    localStorage.setItem(key, JSON.stringify(stored));
    
    // Try to get it
    const result = getSecureItem(key);
    expect(result).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith(key);
  });

  it("should return null for non-existent key", () => {
    expect(getSecureItem("ghost")).toBeNull();
  });
});
