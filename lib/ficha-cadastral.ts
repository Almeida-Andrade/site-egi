/**
 * Ficha cadastral online: o que o futuro locatário preenche no site da EGI (cópia byte a byte em
 * `_compartilhado/ficha-cadastral.ts`). O site valida por aqui para ajudar; a Edge Function valida para valer.
 * Nada daqui monta SQL nem HTML: o texto limpo é gravado como valor e mostrado sempre como texto.
 */

export type TipoPessoaFicha = "fisica" | "juridica";
export type GarantiaFicha = "fiador" | "caucao" | "seguro" | "conversar";
export type SituacaoFicha = "enviando" | "recebida" | "em_analise" | "contrato_gerado" | "fechou" | "nao_fechou";
export type TipoArquivoFicha = "application/pdf" | "image/jpeg" | "image/png";

export const ESTADOS_CIVIS = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  uniao_estavel: "União estável",
  divorciado: "Divorciado(a)",
  separado: "Separado(a)",
  viuvo: "Viúvo(a)",
} as const;
export type EstadoCivil = keyof typeof ESTADOS_CIVIS;

export const GARANTIAS: Record<GarantiaFicha, string> = {
  fiador: "Fiador",
  caucao: "Caução (depósito de até 3 aluguéis)",
  seguro: "Seguro-fiança",
  conversar: "Quero conversar com a EGI",
};

export const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS",
  "SC", "SE", "SP", "TO",
] as const;

export const LIMITE_TEXTO = 120;
export const LIMITE_ENDERECO = 250;
export const LIMITE_LIVRE = 1000;
export const LIMITE_EMAIL = 160;
export const MAX_BYTES_FICHA = 64 * 1024;
export const MAX_SOCIOS = 5;
export const MAX_ARQUIVOS = 30;
export const MAX_ARQUIVOS_POR_DOCUMENTO = 4;
export const MAX_BYTES_ARQUIVO = 10 * 1024 * 1024;
export const DIAS_VALIDADE_LINK = 15;

export interface EnderecoFicha {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface PessoaFicha {
  nome: string;
  cpf: string;
  rg: string;
  rgOrgao: string;
  nascimento: string;
  naturalidade: string;
  nacionalidade: string;
  estadoCivil: EstadoCivil;
  profissao: string;
  endereco: EnderecoFicha;
  celular: string;
  telefone: string;
  email: string;
}

export interface ConjugeFicha {
  nome: string;
  cpf: string;
  rg: string;
  rgOrgao: string;
  nascimento: string;
  nacionalidade: string;
  profissao: string;
}

export interface TrabalhoFicha {
  empresa: string;
  funcao: string;
  endereco: string;
  telefone: string;
  /** renda mensal em reais; null quando não informada */
  renda: number | null;
}

export interface SocioFicha {
  pessoa: PessoaFicha;
  trabalho: TrabalhoFicha;
  /** o sócio que assina o contrato pela empresa: exatamente um */
  assina: boolean;
}

export interface EmpresaFicha {
  razaoSocial: string;
  cnpj: string;
  endereco: EnderecoFicha;
  telefone: string;
  email: string;
}

export interface FiadorFicha {
  pessoa: PessoaFicha;
  conjuge: ConjugeFicha | null;
  trabalho: TrabalhoFicha;
  /** imóvel ou veículo quitado: endereço ou placa */
  patrimonio: string;
}

export interface DadosFicha {
  uso: { finalidade: string; entradaDesejada: string; prazoMeses: number | null };
  tipo: TipoPessoaFicha;
  /** pessoa física: quem aluga; null na empresa */
  pessoa: PessoaFicha | null;
  conjuge: ConjugeFicha | null;
  trabalho: TrabalhoFicha | null;
  empresa: EmpresaFicha | null;
  socios: SocioFicha[];
  garantia: GarantiaFicha;
  fiador: FiadorFicha | null;
  referencias: { bancos: string; locacoes: string };
  /** o aceite do uso dos dados (LGPD) */
  aceite: boolean;
}

export interface ErroCampo {
  campo: string;
  mensagem: string;
}

export type ResultadoValidacao<T> = { ok: true; valor: T } | { ok: false; erros: ErroCampo[] };

// ---------------------------------------------------------------- limpeza

// Controle (menos a quebra de linha), invisíveis e marcas de direção (RTL override troca a ordem do que se lê).
// Tab, quebra de linha e afins ficam: viram espaço logo depois.
const INVISIVEIS = /[\u0000-\u0008\u000E-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;

function cortar(s: string, max: number): string {
  const letras = Array.from(s);
  return letras.length > max ? letras.slice(0, max).join("").trim() : s;
}

/** Texto de uma linha: Unicode NFC, sem invisíveis, espaços juntados, aparado e no tamanho máximo. */
export function limparTexto(valor: unknown, max = LIMITE_TEXTO): string {
  if (typeof valor !== "string") return "";
  return cortar(valor.normalize("NFC").replace(INVISIVEIS, "").replace(/\s+/g, " ").trim(), max);
}

/** Texto livre: como `limparTexto`, mas mantém até 20 linhas. */
export function limparTextoLivre(valor: unknown, max = LIMITE_LIVRE): string {
  if (typeof valor !== "string") return "";
  const linhas = valor
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(INVISIVEIS, "")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim());
  return cortar(linhas.join("\n").replace(/\n{3,}/g, "\n\n").split("\n").slice(0, 20).join("\n").trim(), max);
}

export const soDigitos = (valor: unknown): string => (typeof valor === "string" ? valor.replace(/\D/g, "") : "");

function digitoMod11(base: string, pesos: number[]): number {
  const soma = base.split("").reduce((acc, d, i) => acc + Number(d) * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cpfValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  return d[9] === String(digitoMod11(d.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])) && d[10] === String(digitoMod11(d.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]));
}

export function cnpjValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return d[12] === String(digitoMod11(d.slice(0, 12), p1)) && d[13] === String(digitoMod11(d.slice(0, 13), [6, ...p1]));
}

/** DDD + número (10 ou 11 dígitos); o 55 da frente sai. */
export function telefoneValido(valor: string): boolean {
  let d = soDigitos(valor);
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  return (d.length === 10 || d.length === 11) && /^[1-9]{2}/.test(d);
}

export function emailValido(valor: string): boolean {
  return valor.length <= LIMITE_EMAIL && /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(valor);
}

/** Data ISO (AAAA-MM-DD) que existe no calendário. */
export function dataValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [a, m, d] = valor.split("-").map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  return data.getUTCFullYear() === a && data.getUTCMonth() === m - 1 && data.getUTCDate() === d && a >= 1900;
}

/** Fez 18 anos até `hoje` (ISO de São Luís). Comparar strings ISO evita o fuso do servidor. */
export function maiorDeIdade(nascimento: string, hoje: string): boolean {
  const [a, resto] = [Number(hoje.slice(0, 4)) - 18, hoje.slice(4)];
  return nascimento <= `${String(a).padStart(4, "0")}${resto}`;
}

// ---------------------------------------------------------------- leitura campo a campo

type Objeto = Record<string, unknown>;
// `in` enxerga o protótipo ("toString" in {} é true): lista fechada se confere só pelas chaves próprias.
const daLista = (lista: object, chave: unknown): boolean => typeof chave === "string" && Object.prototype.hasOwnProperty.call(lista, chave);
const objeto = (v: unknown): Objeto => (v && typeof v === "object" && !Array.isArray(v) ? (v as Objeto) : {});

class Leitor {
  readonly erros: ErroCampo[] = [];
  readonly hoje: string;
  constructor(hoje: string) {
    this.hoje = hoje;
  }

  erro(campo: string, mensagem: string): void {
    this.erros.push({ campo, mensagem });
  }

  texto(o: Objeto, chave: string, campo: string, rotulo: string, obrigatorio: boolean, max = LIMITE_TEXTO): string {
    const v = limparTexto(o[chave], max);
    if (obrigatorio && !v) this.erro(`${campo}.${chave}`, `Preencha ${rotulo}.`);
    return v;
  }

  livre(o: Objeto, chave: string): string {
    return limparTextoLivre(o[chave]);
  }

  documento(o: Objeto, chave: string, campo: string, tipo: "cpf" | "cnpj", obrigatorio: boolean): string {
    const v = soDigitos(o[chave]);
    if (!v) {
      if (obrigatorio) this.erro(`${campo}.${chave}`, `Preencha o ${tipo.toUpperCase()}.`);
      return "";
    }
    if (tipo === "cpf" ? !cpfValido(v) : !cnpjValido(v)) this.erro(`${campo}.${chave}`, `O ${tipo.toUpperCase()} não confere. Confira os números.`);
    return v.slice(0, 14);
  }

  telefone(o: Objeto, chave: string, campo: string, obrigatorio: boolean): string {
    const v = soDigitos(o[chave]).slice(0, 13);
    if (!v) {
      if (obrigatorio) this.erro(`${campo}.${chave}`, "Preencha o telefone com DDD.");
      return "";
    }
    if (!telefoneValido(v)) this.erro(`${campo}.${chave}`, "Telefone com DDD, só números (ex.: 98 99999-9999).");
    return v;
  }

  email(o: Objeto, chave: string, campo: string, obrigatorio: boolean): string {
    const v = limparTexto(o[chave], LIMITE_EMAIL).toLowerCase();
    if (!v) {
      if (obrigatorio) this.erro(`${campo}.${chave}`, "Preencha o e-mail.");
      return "";
    }
    if (!emailValido(v)) this.erro(`${campo}.${chave}`, "O e-mail não parece certo (ex.: nome@gmail.com).");
    return v;
  }

  data(o: Objeto, chave: string, campo: string, rotulo: string, obrigatorio: boolean, adulto = false): string {
    const v = limparTexto(o[chave], 10);
    if (!v) {
      if (obrigatorio) this.erro(`${campo}.${chave}`, `Preencha ${rotulo}.`);
      return "";
    }
    if (!dataValida(v)) this.erro(`${campo}.${chave}`, `${rotulo[0].toUpperCase()}${rotulo.slice(1)} não é uma data válida.`);
    else if (adulto && !maiorDeIdade(v, this.hoje)) this.erro(`${campo}.${chave}`, "Precisa ter 18 anos ou mais.");
    return v;
  }

  dinheiro(o: Objeto, chave: string, campo: string, rotulo: string, obrigatorio: boolean): number | null {
    const v = o[chave];
    if (v === null || v === undefined || v === "") {
      if (obrigatorio) this.erro(`${campo}.${chave}`, `Preencha ${rotulo}.`);
      return null;
    }
    const n = typeof v === "number" ? v : Number.NaN;
    if (!Number.isFinite(n) || n < 0 || n > 100_000_000) {
      this.erro(`${campo}.${chave}`, `${rotulo[0].toUpperCase()}${rotulo.slice(1)} precisa ser um valor em reais.`);
      return null;
    }
    if (obrigatorio && n === 0) this.erro(`${campo}.${chave}`, `Preencha ${rotulo}.`);
    return Math.round(n * 100) / 100;
  }

  endereco(v: unknown, campo: string): EnderecoFicha {
    const o = objeto(v);
    const cep = soDigitos(o.cep).slice(0, 8);
    if (cep.length !== 8) this.erro(`${campo}.cep`, "O CEP tem 8 números.");
    const uf = limparTexto(o.uf, 2).toUpperCase();
    if (!(UFS as readonly string[]).includes(uf)) this.erro(`${campo}.uf`, "Escolha o estado.");
    return {
      cep,
      logradouro: this.texto(o, "logradouro", campo, "a rua", true, LIMITE_ENDERECO),
      numero: this.texto(o, "numero", campo, "o número (ou S/N)", true, 20),
      complemento: this.texto(o, "complemento", campo, "o complemento", false),
      bairro: this.texto(o, "bairro", campo, "o bairro", true),
      cidade: this.texto(o, "cidade", campo, "a cidade", true),
      uf,
    };
  }

  pessoa(v: unknown, campo: string, contatoObrigatorio: boolean): PessoaFicha {
    const o = objeto(v);
    const estado = limparTexto(o.estadoCivil, 20);
    if (!(daLista(ESTADOS_CIVIS, estado))) this.erro(`${campo}.estadoCivil`, "Escolha o estado civil.");
    return {
      nome: this.texto(o, "nome", campo, "o nome completo", true),
      cpf: this.documento(o, "cpf", campo, "cpf", true),
      rg: this.texto(o, "rg", campo, "o RG", true, 30),
      rgOrgao: this.texto(o, "rgOrgao", campo, "o órgão que emitiu o RG", true, 30),
      nascimento: this.data(o, "nascimento", campo, "a data de nascimento", true, true),
      naturalidade: this.texto(o, "naturalidade", campo, "a cidade onde nasceu", false),
      nacionalidade: this.texto(o, "nacionalidade", campo, "a nacionalidade", true, 60),
      estadoCivil: (daLista(ESTADOS_CIVIS, estado) ? estado : "solteiro") as EstadoCivil,
      profissao: this.texto(o, "profissao", campo, "a profissão", true),
      endereco: this.endereco(o.endereco, `${campo}.endereco`),
      celular: this.telefone(o, "celular", campo, contatoObrigatorio),
      telefone: this.telefone(o, "telefone", campo, false),
      email: this.email(o, "email", campo, contatoObrigatorio),
    };
  }

  conjuge(v: unknown, campo: string): ConjugeFicha {
    const o = objeto(v);
    return {
      nome: this.texto(o, "nome", campo, "o nome do cônjuge", true),
      cpf: this.documento(o, "cpf", campo, "cpf", true),
      rg: this.texto(o, "rg", campo, "o RG do cônjuge", true, 30),
      rgOrgao: this.texto(o, "rgOrgao", campo, "o órgão que emitiu o RG", false, 30),
      nascimento: this.data(o, "nascimento", campo, "a data de nascimento", false),
      nacionalidade: this.texto(o, "nacionalidade", campo, "a nacionalidade do cônjuge", true, 60),
      profissao: this.texto(o, "profissao", campo, "a profissão do cônjuge", true),
    };
  }

  trabalho(v: unknown, campo: string, obrigatorio: boolean): TrabalhoFicha {
    const o = objeto(v);
    return {
      empresa: this.texto(o, "empresa", campo, "onde trabalha", obrigatorio),
      funcao: this.texto(o, "funcao", campo, "a função", obrigatorio),
      endereco: this.texto(o, "endereco", campo, "o endereço do trabalho", false, LIMITE_ENDERECO),
      telefone: this.telefone(o, "telefone", campo, false),
      renda: this.dinheiro(o, "renda", campo, "a renda mensal", obrigatorio),
    };
  }
}

const temConjuge = (estado: EstadoCivil): boolean => estado === "casado" || estado === "uniao_estavel";

/**
 * Lê a ficha que veio do navegador: só as chaves conhecidas, cada uma limpa, no tamanho e no formato.
 * Devolve a ficha pronta para gravar ou a lista do que falta, campo a campo.
 */
export function validarFicha(entrada: unknown, hoje: string): ResultadoValidacao<DadosFicha> {
  const tamanho = (() => {
    try {
      return JSON.stringify(entrada ?? null).length;
    } catch {
      return Number.POSITIVE_INFINITY;
    }
  })();
  if (tamanho > MAX_BYTES_FICHA) return { ok: false, erros: [{ campo: "ficha", mensagem: "A ficha passou do tamanho máximo." }] };

  const l = new Leitor(hoje);
  const e = objeto(entrada);

  const usoBruto = objeto(e.uso);
  const prazoBruto = usoBruto.prazoMeses;
  let prazoMeses: number | null = null;
  if (prazoBruto !== null && prazoBruto !== undefined && prazoBruto !== "") {
    if (typeof prazoBruto === "number" && Number.isInteger(prazoBruto) && prazoBruto >= 1 && prazoBruto <= 120) prazoMeses = prazoBruto;
    else l.erro("uso.prazoMeses", "O prazo é em meses, de 1 a 120.");
  }
  const uso = {
    finalidade: l.texto(usoBruto, "finalidade", "uso", "para que vai usar o imóvel", true, LIMITE_ENDERECO),
    entradaDesejada: l.data(usoBruto, "entradaDesejada", "uso", "a data de entrada", false),
    prazoMeses,
  };

  const tipo: TipoPessoaFicha | null = e.tipo === "fisica" || e.tipo === "juridica" ? e.tipo : null;
  if (!tipo) l.erro("tipo", "Diga se quem aluga é você (pessoa física) ou uma empresa.");

  let pessoa: PessoaFicha | null = null;
  let conjuge: ConjugeFicha | null = null;
  let trabalho: TrabalhoFicha | null = null;
  let empresa: EmpresaFicha | null = null;
  const socios: SocioFicha[] = [];

  if (tipo === "fisica") {
    pessoa = l.pessoa(e.pessoa, "pessoa", true);
    if (temConjuge(pessoa.estadoCivil)) conjuge = l.conjuge(e.conjuge, "conjuge");
    trabalho = l.trabalho(e.trabalho, "trabalho", true);
  } else if (tipo === "juridica") {
    const eb = objeto(e.empresa);
    empresa = {
      razaoSocial: l.texto(eb, "razaoSocial", "empresa", "a razão social", true, 160),
      cnpj: l.documento(eb, "cnpj", "empresa", "cnpj", true),
      endereco: l.endereco(eb.endereco, "empresa.endereco"),
      telefone: l.telefone(eb, "telefone", "empresa", true),
      email: l.email(eb, "email", "empresa", true),
    };
    const lista = Array.isArray(e.socios) ? e.socios.slice(0, MAX_SOCIOS) : [];
    if (!lista.length) l.erro("socios", "Informe ao menos um sócio.");
    lista.forEach((s, i) => {
      const o = objeto(s);
      const assina = o.assina === true;
      socios.push({ pessoa: l.pessoa(o.pessoa, `socios.${i}.pessoa`, assina), trabalho: l.trabalho(o.trabalho, `socios.${i}.trabalho`, false), assina });
    });
    if (lista.length && socios.filter((s) => s.assina).length !== 1) l.erro("socios", "Marque o sócio que assina o contrato (um só).");
  }

  const garantia: GarantiaFicha | null = daLista(GARANTIAS, e.garantia) ? (e.garantia as GarantiaFicha) : null;
  if (!garantia) l.erro("garantia", "Escolha a garantia.");
  let fiador: FiadorFicha | null = null;
  if (garantia === "fiador") {
    const f = objeto(e.fiador);
    const p = l.pessoa(f.pessoa, "fiador.pessoa", true);
    fiador = {
      pessoa: p,
      conjuge: temConjuge(p.estadoCivil) ? l.conjuge(f.conjuge, "fiador.conjuge") : null,
      trabalho: l.trabalho(f.trabalho, "fiador.trabalho", true),
      patrimonio: limparTextoLivre(f.patrimonio, LIMITE_ENDERECO),
    };
  }

  const r = objeto(e.referencias);
  const referencias = { bancos: l.livre(r, "bancos"), locacoes: l.livre(r, "locacoes") };

  const aceite = e.aceite === true;
  if (!aceite) l.erro("aceite", "Para enviar, marque que concorda com o uso dos dados para a análise da locação.");

  if (l.erros.length || !tipo || !garantia) return { ok: false, erros: l.erros };
  return { ok: true, valor: { uso, tipo, pessoa, conjuge, trabalho, empresa, socios, garantia, fiador, referencias, aceite } };
}

// ---------------------------------------------------------------- resumo para as colunas da lista

export function nomeDaFicha(d: DadosFicha): string {
  return (d.tipo === "juridica" ? d.empresa?.razaoSocial : d.pessoa?.nome) ?? "";
}

export function documentoDaFicha(d: DadosFicha): string {
  return (d.tipo === "juridica" ? d.empresa?.cnpj : d.pessoa?.cpf) ?? "";
}

export function contatoDaFicha(d: DadosFicha): { celular: string; email: string } {
  if (d.tipo === "juridica") {
    const quemAssina = d.socios.find((s) => s.assina)?.pessoa;
    return { celular: quemAssina?.celular || d.empresa?.telefone || "", email: d.empresa?.email || quemAssina?.email || "" };
  }
  return { celular: d.pessoa?.celular ?? "", email: d.pessoa?.email ?? "" };
}

const primeiroNome = (nome: string): string => nome.split(" ")[0] ?? "";

// ---------------------------------------------------------------- documentos

export type TipoDocumentoFicha = "identidade" | "endereco" | "renda" | "contrato_social" | "cartao_cnpj" | "patrimonio";

export interface DocumentoExigido {
  /** "locatario.identidade", "socio2.endereco", "fiador_conjuge.identidade" */
  chave: string;
  tipo: TipoDocumentoFicha;
  rotulo: string;
  ajuda: string;
  obrigatorio: boolean;
}

export const AJUDA_DOCUMENTO: Record<TipoDocumentoFicha, string> = {
  identidade: "Foto ou PDF do RG e do CPF, frente e verso. A CNH serve no lugar dos dois.",
  endereco: "Conta de luz, água, internet ou telefone dos últimos 3 meses, no nome da pessoa (ou com a declaração de quem é o titular).",
  renda: "Os 3 últimos contracheques, ou extrato bancário dos últimos 3 meses, ou a declaração do Imposto de Renda, ou o pró-labore.",
  contrato_social: "O contrato social da empresa e todas as alterações (ou a última alteração consolidada).",
  cartao_cnpj: "O cartão do CNPJ, que se tira no site da Receita Federal.",
  patrimonio: "A matrícula do imóvel (registro em cartório) ou o documento do veículo (CRLV) quitado, no nome do fiador ou do cônjuge.",
};

const TITULO_DOCUMENTO: Record<TipoDocumentoFicha, string> = {
  identidade: "RG e CPF (ou CNH)",
  endereco: "Comprovante de endereço",
  renda: "Comprovante de renda",
  contrato_social: "Contrato social e alterações",
  cartao_cnpj: "Cartão do CNPJ",
  patrimonio: "Registro do imóvel ou documento do veículo",
};

function exigir(chave: string, tipo: TipoDocumentoFicha, de: string, obrigatorio: boolean): DocumentoExigido {
  return { chave: `${chave}.${tipo}`, tipo, rotulo: de ? `${TITULO_DOCUMENTO[tipo]} de ${de}` : TITULO_DOCUMENTO[tipo], ajuda: AJUDA_DOCUMENTO[tipo], obrigatorio };
}

/** A lista que o cliente vê na etapa Documentos, montada pelas escolhas da ficha. */
export function documentosExigidos(d: DadosFicha): DocumentoExigido[] {
  const lista: DocumentoExigido[] = [];
  if (d.tipo === "fisica" && d.pessoa) {
    const nome = primeiroNome(d.pessoa.nome);
    lista.push(exigir("locatario", "identidade", nome, true), exigir("locatario", "endereco", nome, true), exigir("locatario", "renda", nome, true));
    if (d.conjuge) lista.push(exigir("conjuge", "identidade", primeiroNome(d.conjuge.nome) || "cônjuge", true));
  }
  if (d.tipo === "juridica" && d.empresa) {
    lista.push(exigir("empresa", "contrato_social", "", true), exigir("empresa", "cartao_cnpj", "", false));
    d.socios.forEach((s, i) => {
      const nome = primeiroNome(s.pessoa.nome) || `sócio ${i + 1}`;
      lista.push(exigir(`socio${i + 1}`, "identidade", nome, true), exigir(`socio${i + 1}`, "endereco", nome, true), exigir(`socio${i + 1}`, "renda", nome, false));
    });
  }
  if (d.garantia === "fiador" && d.fiador) {
    const nome = primeiroNome(d.fiador.pessoa.nome) || "fiador";
    lista.push(exigir("fiador", "identidade", nome, true), exigir("fiador", "endereco", nome, true), exigir("fiador", "renda", nome, true), exigir("fiador", "patrimonio", nome, false));
    if (d.fiador.conjuge) lista.push(exigir("fiador_conjuge", "identidade", primeiroNome(d.fiador.conjuge.nome) || "cônjuge do fiador", true));
  }
  return lista;
}

// ---------------------------------------------------------------- arquivos

export const TIPOS_ARQUIVO: Record<TipoArquivoFicha, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export interface ArquivoPedido {
  documento: string;
  tipo: TipoArquivoFicha;
  bytes: number;
  /** o nome que o arquivo tinha no aparelho; só para exibir, nunca vira caminho */
  nome: string;
}

/** A lista de arquivos que o navegador quer enviar: só documento da lista, tipo permitido e tamanho certo. */
export function validarArquivos(entrada: unknown, exigidos: DocumentoExigido[]): ResultadoValidacao<ArquivoPedido[]> {
  const erros: ErroCampo[] = [];
  const bruta = Array.isArray(entrada) ? entrada : [];
  if (bruta.length > MAX_ARQUIVOS) return { ok: false, erros: [{ campo: "arquivos", mensagem: `Mande no máximo ${MAX_ARQUIVOS} arquivos.` }] };
  const chaves = new Set(exigidos.map((x) => x.chave));
  const porDocumento = new Map<string, number>();
  const arquivos: ArquivoPedido[] = [];
  for (const item of bruta) {
    const o = objeto(item);
    const documento = typeof o.documento === "string" ? o.documento : "";
    if (!chaves.has(documento)) {
      erros.push({ campo: "arquivos", mensagem: "Há um arquivo para um documento que não está na lista." });
      continue;
    }
    const tipo = daLista(TIPOS_ARQUIVO, o.tipo) ? (o.tipo as TipoArquivoFicha) : null;
    if (!tipo) {
      erros.push({ campo: `arquivos.${documento}`, mensagem: "Só valem PDF, JPG ou PNG." });
      continue;
    }
    const bytes = typeof o.bytes === "number" && Number.isInteger(o.bytes) ? o.bytes : 0;
    if (bytes < 1 || bytes > MAX_BYTES_ARQUIVO) {
      erros.push({ campo: `arquivos.${documento}`, mensagem: "Cada arquivo pode ter até 10 MB." });
      continue;
    }
    const n = (porDocumento.get(documento) ?? 0) + 1;
    porDocumento.set(documento, n);
    if (n > MAX_ARQUIVOS_POR_DOCUMENTO) {
      erros.push({ campo: `arquivos.${documento}`, mensagem: `No máximo ${MAX_ARQUIVOS_POR_DOCUMENTO} arquivos por documento.` });
      continue;
    }
    arquivos.push({ documento, tipo, bytes, nome: limparTexto(o.nome, 120) });
  }
  for (const x of exigidos) if (x.obrigatorio && !porDocumento.has(x.chave)) erros.push({ campo: `arquivos.${x.chave}`, mensagem: `Falta: ${x.rotulo}.` });
  return erros.length ? { ok: false, erros } : { ok: true, valor: arquivos };
}

/** O tipo pelo começo do arquivo, não pelo nome nem pelo que o navegador disse. */
export function tipoPeloConteudo(cabeca: Uint8Array): TipoArquivoFicha | null {
  const c = (bytes: number[]) => bytes.every((b, i) => cabeca[i] === b);
  if (c([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  if (c([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (c([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  return null;
}

/** O caminho no bucket é do servidor: id da ficha, documento e sorteio. O nome do aparelho não entra. */
export function caminhoNoBucket(fichaId: number, documento: string, sorteio: string, tipo: TipoArquivoFicha): string {
  return `${fichaId}/${documento}-${sorteio}.${TIPOS_ARQUIVO[tipo]}`;
}

// ---------------------------------------------------------------- o link personalizado

function base64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 256 bits de sorteio; vai na URL e nunca é gravado (o banco guarda só o hash). */
export function gerarToken(): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export const tokenComFormato = (token: unknown): token is string => typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);

export async function hashDoToken(token: string): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
  return Array.from(h, (b) => b.toString(16).padStart(2, "0")).join("");
}
