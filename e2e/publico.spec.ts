import { test, expect } from '@playwright/test'

test('home mostra o hero e os números do portfólio', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Grandes empreendimentos')

  const numeros = page.getByLabel('A EGI em números')
  await expect(numeros).toContainText('18')
  await expect(numeros).toContainText('148')
  await expect(numeros).toContainText('91%')
})

test('listagem filtra por tipo pela URL', async ({ page }) => {
  await page.goto('/empreendimentos?tipo=centro_comercial')
  await expect(page.locator('main a[href^="/empreendimentos/"]')).toHaveCount(5)
})

test('listagem filtra por disponibilidade pela URL', async ({ page }) => {
  await page.goto('/empreendimentos?disponiveis=1')
  await expect(page.locator('main a[href^="/empreendimentos/"]')).toHaveCount(4)
})

test('ficha lista unidades e a aba de disponíveis reduz a tabela', async ({ page }) => {
  await page.goto('/empreendimentos/centro-comercial-ana-dina')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Centro Comercial Ana Dina')

  await expect(page.locator('tbody tr')).toHaveCount(21)
  await page.getByRole('button', { name: /^Disponíveis/ }).click()
  await expect(page.locator('tbody tr')).toHaveCount(9)
})

test('empreendimento lotado não oferece contato por unidade', async ({ page }) => {
  await page.goto('/empreendimentos/centro-comercial-patio-brasil')
  await expect(page.getByText('Tenho interesse')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Avise-me quando vagar' })).toBeVisible()
})

test('empreendimento despublicado devolve 404', async ({ page }) => {
  const resposta = await page.goto('/empreendimentos/galpao-maracana-rascunho')
  expect(resposta?.status()).toBe(404)
})

test('sitemap lista as 18 fichas e omite o rascunho', async ({ request }) => {
  const resposta = await request.get('/sitemap.xml')
  const xml = await resposta.text()
  expect(xml.match(/<loc>/g)?.length).toBe(22)
  expect(xml).not.toContain('maracana')
})

test('painel exige sessão', async ({ page }) => {
  await page.goto('/admin/empreendimentos')
  await expect(page).toHaveURL('/admin')
  await expect(page.getByRole('heading', { name: 'Painel administrativo' })).toBeVisible()
})
