# 13 - Troubleshooting e FAQ

## Objetivo

Ajudar a diagnosticar erros comuns de conexao, schema e queries.

## Conceitos principais

- Logs e mensagens de erro indicam a causa raiz.
- Reproducao minima facilita debug.
- Compatibilidade de versoes e fonte frequente de problemas.

## Quando usar

- Quando uma query falha ou fica lenta.
- Ao receber erros de casting, validacao ou conexao.

## Armadilhas comuns

- Ignorar logs do driver.
- Assumir que o problema e no codigo sem isolar.
- Testar em ambiente diferente do prod.

## Checklist humano

- Logs ativados e analisados.
- Versoes conferidas.
- Reproducao minima criada.

## Exemplos e reforco

### Exemplo bom

```js
try {
  await User.create({ email: 'a@b.com' });
} catch (err) {
  if (err.code === 11000) {
    // handle duplicate key
  }
}
```

### Exemplo

```js
mongoose.set('debug', true);
```

## Referencias

- Versao para IA: ../../ai/chapters/13-troubleshooting-and-faq.md
- Capitulo original: ../../chapters/13-troubleshooting-and-faq.md
