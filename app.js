const $ = s => document.querySelector(s);
const GRUPOS = {
  necessidades: ["Moradia", "Alimentação", "Transporte", "Saúde", "Contas"],
  desejos: ["Lazer", "Compras", "Assinaturas", "Restaurantes"],
  poupanca: ["Investimentos", "Reserva"]
};
const RECEITAS = ["Salário", "Extra"];
const grupoDe = categoria => Object.keys(GRUPOS).find(grupo => GRUPOS[grupo].includes(categoria));

// Os valores são armazenados como centavos inteiros para evitar erros de arredondamento.
let dados = JSON.parse(localStorage.getItem("lancamentos") || "[]");
const salvar = () => localStorage.setItem("lancamentos", JSON.stringify(dados));
const brl = centavos => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (valor, total) => total > 0
  ? `${(Math.round(valor * 1000 / total) / 10).toFixed(1).replace(".", ",")}%`
  : "0,0%";
const aCentavos = texto => {
  const valor = Number(String(texto).trim().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(valor) ? Math.round(valor * 100) : NaN;
};
const soma = lancamentos => lancamentos.reduce((total, lancamento) => total + lancamento.centavos, 0);
const esc = texto => String(texto ?? "").replace(/[&<>"]/g, caractere => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
}[caractere]));
const dataLocal = data => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

// ---------- Título com entrada suave das letras ----------
const frases = ["CONTROLE TOTAL", "SEU DINHEIRO EM ORDEM", "CADA CENTAVO CONTA", "FUTURO FINANCEIRO"];

function mostrarFrase(elemento, frase) {
  elemento.setAttribute("aria-label", frase);
  let indice = 0;
  const textoPalavras = frase.split(" ");
  const palavras = textoPalavras.map(palavra => {
    const grupo = document.createElement("span");
    grupo.className = "palavra";
    grupo.setAttribute("aria-hidden", "true");

    for (const letra of palavra) {
      const span = document.createElement("span");
      span.className = "letra";
      span.textContent = letra;
      span.style.animationDelay = `${indice * 24}ms`;
      grupo.append(span);
      indice++;
    }

    return grupo;
  });
  const conteudo = palavras.flatMap((palavra, palavraIndice) =>
    palavraIndice ? [document.createTextNode(" "), palavra] : [palavra]
  );
  elemento.replaceChildren(...conteudo);
}

async function loopTitulo() {
  const elemento = $("#titulo");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let indice = 0;
  while (true) {
    await new Promise(resolver => setTimeout(resolver, 3600));
    indice = (indice + 1) % frases.length;
    mostrarFrase(elemento, frases[indice]);
  }
}

// ---------- Formulário ----------
function preencherCategorias() {
  const categorias = $("#tipo").value === "receita" ? RECEITAS : Object.values(GRUPOS).flat();
  $("#categoria").innerHTML = categorias.map(categoria => `<option>${categoria}</option>`).join("");
}

$("#tipo").onchange = preencherCategorias;

$("#add").onclick = () => {
  const centavos = aCentavos($("#valor").value);
  const data = $("#data").value;

  if (!(centavos > 0)) {
    $("#erro").textContent = "Digite um valor maior que zero, por exemplo 45,90.";
    return;
  }
  if (!data) {
    $("#erro").textContent = "Escolha a data do lançamento.";
    return;
  }

  $("#erro").textContent = "";
  dados.push({
    id: Date.now(),
    data,
    tipo: $("#tipo").value,
    categoria: $("#categoria").value,
    desc: $("#desc").value.trim(),
    centavos
  });
  salvar();
  $("#valor").value = "";
  $("#desc").value = "";
  render();
};

$("#csv").onclick = () => {
  const linhas = ["data;tipo;categoria;descricao;valor"].concat(
    dados.map(lancamento => [
      lancamento.data,
      lancamento.tipo,
      lancamento.categoria,
      `"${lancamento.desc.replace(/"/g, '""')}"`,
      (lancamento.centavos / 100).toFixed(2).replace(".", ",")
    ].join(";"))
  );
  const url = URL.createObjectURL(new Blob(["\ufeff" + linhas.join("\n")], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "lancamentos.csv";
  link.click();
  URL.revokeObjectURL(url);
};

// ---------- Painel ----------
function render() {
  const mes = $("#mes").value;
  const lancamentos = dados
    .filter(lancamento => lancamento.data.startsWith(mes))
    .sort((a, b) => b.data.localeCompare(a.data));
  const receitas = lancamentos.filter(lancamento => lancamento.tipo === "receita");
  const despesas = lancamentos.filter(lancamento => lancamento.tipo === "despesa");
  const totalReceitas = soma(receitas);
  const totalDespesas = soma(despesas);
  const saldo = totalReceitas - totalDespesas;
  const aportes = soma(despesas.filter(lancamento => grupoDe(lancamento.categoria) === "poupanca"));

  $("#kReceitas").textContent = brl(totalReceitas);
  $("#kDespesas").textContent = brl(totalDespesas);
  $("#kSaldo").textContent = brl(saldo);
  $("#kSaldo").className = saldo >= 0 ? "pos" : "neg";
  $("#kTaxa").textContent = pct(saldo + aportes, totalReceitas);

  $("#tabela tbody").innerHTML = lancamentos.map(lancamento => `
    <tr>
      <td>${lancamento.data.split("-").reverse().join("/")}</td>
      <td>${lancamento.tipo}</td>
      <td>${lancamento.categoria}</td>
      <td>${esc(lancamento.desc)}</td>
      <td class="n ${lancamento.tipo === "receita" ? "pos" : "neg"}">${lancamento.tipo === "receita" ? "+" : "−"} ${brl(lancamento.centavos)}</td>
      <td><button class="x" data-id="${lancamento.id}" aria-label="Apagar lançamento de ${lancamento.categoria}">✕</button></td>
    </tr>
  `).join("") || `<tr><td colspan="6">Nenhum lançamento neste mês. Salve o primeiro acima.</td></tr>`;

  document.querySelectorAll(".x").forEach(botao => {
    botao.onclick = () => {
      dados = dados.filter(lancamento => String(lancamento.id) !== botao.dataset.id);
      salvar();
      render();
    };
  });

  const porCategoria = {};
  despesas.forEach(lancamento => {
    porCategoria[lancamento.categoria] = (porCategoria[lancamento.categoria] || 0) + lancamento.centavos;
  });
  const categoriasOrdenadas = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  $("#cats").innerHTML = categoriasOrdenadas.map(([categoria, valor]) => `
    <div class="cat">
      <span>${categoria}</span>
      <div class="barra"><i style="width:${totalDespesas ? valor * 100 / totalDespesas : 0}%"></i></div>
      <span class="n">${brl(valor)} · ${pct(valor, totalDespesas)}</span>
    </div>
  `).join("") || `<p class="nota">Sem despesas neste mês.</p>`;

  const realizado = grupo => soma(despesas.filter(lancamento => grupoDe(lancamento.categoria) === grupo));
  const metas = [
    ["Necessidades (50%)", "necessidades", 50],
    ["Desejos (30%)", "desejos", 30],
    ["Poupança (20%)", "poupanca", 20]
  ];
  $("#regra tbody").innerHTML = metas.map(([nome, grupo, percentual]) => `
    <tr>
      <td>${nome}</td>
      <td class="n">${brl(Math.round(totalReceitas * percentual / 100))}</td>
      <td class="n">${brl(realizado(grupo))}</td>
      <td class="n">${pct(realizado(grupo), totalReceitas)}</td>
    </tr>
  `).join("");

  const custoMensal = totalDespesas - aportes;
  const alvo = parseInt($("#alvo").value, 10) || 6;
  const reservaAtual = Math.max(0, aCentavos($("#reserva").value) || 0);
  $("#resReserva").innerHTML = custoMensal > 0
    ? `Meta: <b>${brl(custoMensal * alvo)}</b> (${alvo} meses de ${brl(custoMensal)}). Falta: <b>${brl(Math.max(0, custoMensal * alvo - reservaAtual))}</b>. Você cobre <b>${(Math.round(reservaAtual * 10 / custoMensal) / 10).toString().replace(".", ",")}</b> meses.`
    : "Registre despesas no mês para calcular a meta.";

  juros();
}

function juros() {
  const aporte = aCentavos($("#aporte").value);
  const taxa = Number(String($("#taxa").value).replace(",", ".")) / 100;
  const meses = parseInt($("#meses").value, 10);

  if (!(aporte > 0) || !(meses > 0) || !Number.isFinite(taxa)) {
    $("#resJuros").textContent = "Preencha aporte, taxa e meses.";
    return;
  }

  let saldo = 0;
  for (let mes = 0; mes < meses; mes++) saldo = Math.round(saldo * (1 + taxa)) + aporte;
  $("#resJuros").innerHTML = `Em ${meses} meses você terá <b>${brl(saldo)}</b>. Investido: ${brl(aporte * meses)}. Juros ganhos: <b class="pos">${brl(saldo - aporte * meses)}</b>.`;
}

["#alvo", "#reserva", "#aporte", "#taxa", "#meses"].forEach(seletor => {
  $(seletor).oninput = render;
});
$("#mes").onchange = render;

const hoje = new Date();
$("#data").value = dataLocal(hoje);
$("#mes").value = dataLocal(hoje).slice(0, 7);
preencherCategorias();
render();
loopTitulo();
