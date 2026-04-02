import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

/**
 * Hook genérico para chamar commands Tauri com estado de loading e erro.
 * Evita repetição de try/catch + loading em cada componente.
 */
export function useTauriCommand() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (command, args = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke(command, args);
      return result;
    } catch (err) {
      const errorMsg = typeof err === "string" ? err : err.message || "Erro desconhecido";
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}
