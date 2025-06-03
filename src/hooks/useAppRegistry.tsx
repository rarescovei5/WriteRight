// useEditorRegistry.ts
import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import * as oniguruma from 'vscode-oniguruma';
import * as vsctm from 'vscode-textmate';

export function useEditorRegistry() {
  const [registry, setRegistry] = useState<vsctm.Registry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return; // prevent double init in Strict Mode
    initialized.current = true;

    async function init() {
      try {
        console.log('[Editor] Loading oniguruma WASM...');
        const wasmBytesArray = await invoke<number[]>('read_resc_file_binary', {
          filePath: 'onig.wasm', // put your wasm in Tauri resources folder
        });
        console.log('[Editor] oniguruma WASM loaded');

        const wasmBytes = new Uint8Array(wasmBytesArray);
        await oniguruma.loadWASM(wasmBytes);

        const onigLib = {
          createOnigScanner: (patterns: string[]) => new oniguruma.OnigScanner(patterns),
          createOnigString: (s: string) => new oniguruma.OnigString(s),
        };

        const reg = new vsctm.Registry({
          // @ts-ignore
          onigLib,
          loadGrammar: async (scopeName) => {
            if (scopeName === 'text.html.markdown') {
              try {
                const rawGrammar = await invoke<string>('read_resc_file', {
                  filePath: 'markdown.tmLanguage.json',
                });

                return vsctm.parseRawGrammar(rawGrammar, 'resources/markdown.tmLangauge.json');
              } catch (e) {
                console.error('[Editor] Failed to load grammar:', e);
                return null;
              }
            }
            console.warn(`[Editor] Unknown scope name: ${scopeName}`);
            return null;
          },
        });

        setRegistry(reg);
        setLoading(false);
      } catch (e) {
        console.error('[Editor] Error initializing registry:', e);
        setError((e as Error).message || 'Unknown error');
        setLoading(false);
      }
    }

    init();
  }, []);

  return { registry, loading, error };
}
