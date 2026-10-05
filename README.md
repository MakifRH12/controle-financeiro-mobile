# Controle Financeiro

Aplicativo Android para organizar as finanças do dia a dia com clareza e privacidade. Acompanhe receitas, despesas e metas em um painel simples, sem criar conta.

> **Privacidade em primeiro lugar:** os lançamentos ficam armazenados localmente no dispositivo e não são enviados a um servidor pelo aplicativo.

## O que você pode fazer

- Acompanhar receitas, despesas, saldo e taxa guardada no mês.
- Registrar e remover movimentações por categoria.
- Visualizar despesas por categoria e acompanhar a regra 50 / 30 / 20.
- Planejar uma reserva de emergência.
- Simular aportes mensais com juros compostos.
- Exportar os lançamentos para um arquivo CSV.

## Tecnologias

- HTML, CSS e JavaScript.
- Capacitor 7 para empacotar o aplicativo Android.
- Gradle para compilar o APK de teste.

## Requisitos

- Node.js e npm.
- Android Studio com Android SDK Platform 35 e Build Tools 35.0.0.
- JDK 21, disponível junto com o Android Studio.

## Executar e compilar

Instale as dependências e gere o APK de depuração:

```bash
npm install
npm run android:apk
```

O APK será criado em `android/app/build/outputs/apk/debug/app-debug.apk`.

Para preparar somente os arquivos da interface web:

```bash
npm run build:web
```

O APK gerado é destinado a testes e usa assinatura de desenvolvimento. Para uma publicação na Play Store, configure uma chave de assinatura de release própria.

## Privacidade e armazenamento

Os dados são salvos no `localStorage` do navegador ou WebView. Não há login, sincronização entre dispositivos ou cópia de segurança em nuvem; limpar os dados do navegador ou desinstalar o aplicativo pode apagar os lançamentos. A fonte Manrope é carregada pelo Google Fonts quando há conexão com a internet.

## Organização do projeto

| Arquivo ou pasta | Para que serve |
| --- | --- |
| `index.html` | Estrutura da interface |
| `style.css` | Estilos e layout responsivo |
| `app.js` | Lógica financeira e interações |
| `build-web.mjs` | Prepara os arquivos web em `www/` |
| `capacitor.config.json` | Configuração do Capacitor |
| `android/` | Projeto nativo Android |
| `build-apk.mjs` | Inicia a compilação do APK |

Pastas geradas como `node_modules/`, `www/` e os resultados de compilação Android são recriadas pelos scripts e ficam fora do controle de versão.
