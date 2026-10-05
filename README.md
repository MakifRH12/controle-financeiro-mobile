# Controle Financeiro

Aplicativo Android para acompanhar receitas, despesas e metas financeiras pessoais. Os lançamentos são mantidos localmente no dispositivo, sem conta ou sincronização em nuvem.

## Recursos

- Resumo mensal de receitas, despesas, saldo e taxa guardada.
- Cadastro e exclusão de lançamentos por categoria.
- Exportação dos lançamentos para CSV.
- Visão de despesas por categoria e acompanhamento da regra 50/30/20.
- Cálculo de meta para reserva de emergência.
- Simulador de aportes com juros compostos.

## Privacidade

Os lançamentos são armazenados no `localStorage` do navegador ou WebView e não são enviados a um servidor pelo aplicativo. Não há login, sincronização entre dispositivos nem recuperação em nuvem; desinstalar o app ou limpar os dados do navegador pode apagar os lançamentos. A interface carrega a fonte Manrope pelo Google Fonts quando há conexão com a internet.

## Requisitos

- Node.js e npm.
- Android Studio com Android SDK Platform 35 e Build Tools 35.0.0.
- JDK 21 (o Android Studio inclui uma versão compatível).

## Compilar o APK de teste

Na raiz do projeto, execute:

```bash
npm install
npm run android:apk
```

O comando prepara os arquivos web, sincroniza o projeto Capacitor e compila o APK de depuração em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

O APK de depuração usa uma chave de assinatura de desenvolvimento. É adequado para testes, mas não para publicação na Play Store. Para distribuir o app pela Play Store, configure uma chave de release própria e siga o processo oficial de publicação.

## Estrutura do projeto

| Caminho | Descrição |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Interface e lógica do aplicativo |
| `build-web.mjs` | Prepara os arquivos web em `www/` |
| `capacitor.config.json` | Configuração do Capacitor |
| `android/` | Projeto nativo Android |
| `build-apk.mjs` | Executa a compilação Android de depuração |

Os diretórios gerados (`node_modules/`, `www/` e saídas de compilação) não precisam ser versionados; os scripts os recriam a partir dos arquivos-fonte.
