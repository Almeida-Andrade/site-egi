// As colunas que o site lê do banco do CRM. Um lugar só: coluna nova entra
// aqui e no tipo em lib/tipos.ts.

export const CAMPOS = `
  id, slug, nome, descricao, tipo, built_to_suit, endereco, bairro, cidade, uf,
  cep, localizacao_aproximada, maps_embed_url, maps_link, publicado, destaque, ordem,
  finalidade, video_url
`

export const CAMPOS_UNIDADES = `
  id, empreendimento_id, identificacao, tipo, area_m2, piso, status, disponivel_em,
  descricao, caracteristicas, ordem
`

// O banco do CRM guarda a URL pública completa (fotos antigas ainda servidas
// do bucket do projeto antigo; novas sobem no bucket do CRM)
export const CAMPOS_IMAGENS = `
  id, storage_path, url, alt, capa, ordem, tipo
`

// No banco do CRM a tabela chama empreendimento_imagens; o alias mantém o
// nome "imagens" no restante do código
export const REL_IMAGENS = `imagens:empreendimento_imagens(${CAMPOS_IMAGENS})`
