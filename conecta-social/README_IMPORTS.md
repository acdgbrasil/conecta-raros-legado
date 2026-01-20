# Por que importações usam `.js`?

Você notou que no código TypeScript (`.ts`) estamos importando arquivos com a extensão `.js`, por exemplo:

```typescript
import { User } from "./entity/user.js"; // O arquivo real é user.ts
```

## O Motivo

Isso acontece porque o projeto está configurado como **ES Modules (ESM)** nativo (veja `"type": "module"` no `package.json`).

No padrão **ESM**, o JavaScript exige que todas as importações tenham a extensão explícita do arquivo.

### Como o Bun/TypeScript entende isso?

1.  **Tempo de Execução (Bun):** O Bun é inteligente. Quando ele vê `import ... from './arquivo.js'`, ele procura primeiro se existe o `./arquivo.ts`. Se existir, ele usa o TypeScript. Se não, ele usa o JavaScript compilado.
2.  **Padrão da Web:** Essa é a especificação oficial do JavaScript moderno. Diferente do CommonJS (Node.js antigo) que "adivinhava" a extensão (`.js`, `.json`, `.node`), o ESM exige precisão para ser mais rápido e compatível com navegadores.

### Resumo

*   **É normal?** Sim, é o padrão moderno.
*   **Devo mudar?** Não. Se você remover o `.js`, o código pode quebrar em tempo de execução ou exigir configurações complexas de bundlers (como Webpack/Vite) que o Bun dispensa.

Mantenha as importações com `.js` mesmo referenciando arquivos `.ts` locais.
