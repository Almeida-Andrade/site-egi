import { test, expect } from '@playwright/test'

test('home mostra o hero e os números do portfólio', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Grandes empreendimentos')

  const numeros = page.getByLabel('A EGI em números')
  await expect(numeros).toContainText(/[1-9]\d*\s*Empreendimentos/i)
  await expect(numeros).toContainText(/[1-9]\d*\s*Unidades/i)
  await expect(numeros).toContainText(/\d{1,3}%\s*Taxa de ocupação/i)
})

test('listagem filtra por tipo pela URL', async ({ page }) => {
  await page.goto('/empreendimentos?tipo=centro_comercial')
  await expect(page.locator('main a[href^="/empreendimentos/"]')).toHaveCount(5)
})

test('listagem filtra por disponibilidade pela URL', async ({ page }) => {
  const cartoes = 'main a[href^="/empreendimentos/"]'

  await page.goto('/empreendimentos')
  const total = await page.locator(cartoes).count()

  await page.goto('/empreendimentos?disponiveis=1')
  const filtrados = await page.locator(cartoes).count()

  expect(filtrados).toBeGreaterThan(0)
  expect(filtrados).toBeLessThan(total)
  await expect(page.locator(cartoes, { hasText: /dispon[ií]ve/i })).toHaveCount(filtrados)
})

test('ficha lista unidades e a aba de disponíveis reduz a tabela', async ({ page }) => {
  await page.goto('/empreendimentos/centro-comercial-ana-dina')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Centro Comercial Ana Dina')

  await expect(page.locator('tbody tr')).toHaveCount(21)
  await page.getByRole('button', { name: /^Disponíveis/ }).click()
  await expect(page.locator('tbody tr')).toHaveCount(9)
})

test('empreendimento lotado não oferece contato por unidade', async ({ page }) => {
  await page.goto('/empreendimentos/centro-comercial-empresarial-galeria-a')
  await expect(page.getByRole('button', { name: /^Disponíveis\s*0/ })).toBeVisible()
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

test.describe('navegação no celular', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('menu abre, navega e fecha — a barra de links não existe nesta largura', async ({
    page,
  }) => {
    await page.goto('/empreendimentos')

    await expect(page.locator('header nav[aria-label="Principal"]').first()).toBeHidden()

    const botao = page.getByRole('button', { name: 'Abrir menu' })
    await expect(botao).toBeVisible()

    const alvo = await botao.boundingBox()
    expect(alvo!.width).toBeGreaterThanOrEqual(44)
    expect(alvo!.height).toBeGreaterThanOrEqual(44)

    await botao.click()
    await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    const painel = page.locator('#menu-mobile')
    await expect(painel.getByRole('link', { name: 'Empreendimentos' })).toBeVisible()
    await expect(painel.getByRole('link', { name: 'Falar no WhatsApp' })).toBeVisible()

    await painel.getByRole('link', { name: 'Contato' }).click()
    await expect(page).toHaveURL(/\/contato$/)

    await expect(painel).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vamos conversar')
  })

  test('Esc fecha o menu e devolve a rolagem', async ({ page }) => {
    await page.goto('/sobre')
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

    await page.keyboard.press('Escape')
    await expect(page.locator('#menu-mobile')).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
})

const ITEM_ATIVO = 'header > nav a[aria-current="page"]'

test('cabeçalho marca a página atual', async ({ page }) => {
  await page.goto('/sobre')
  await expect(page.locator(ITEM_ATIVO)).toHaveText('A EGI')

  await page.goto('/empreendimentos/residencial-buzios')
  await expect(page.locator(ITEM_ATIVO)).toHaveText('Empreendimentos')

  await page.goto('/')
  await expect(page.locator(ITEM_ATIVO)).toHaveText('Início')

  await page.goto('/admin')
  await expect(page.locator(ITEM_ATIVO)).toHaveCount(0)
})

test('hero leva ao filtro de disponíveis, que saiu do menu', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header > nav').getByRole('link', { name: 'Disponíveis' })).toHaveCount(
    0,
  )

  await page.getByRole('link', { name: /unidades disponíveis agora/ }).click()
  await expect(page).toHaveURL(/disponiveis=1/)
  await expect(page.locator('main a[href^="/empreendimentos/"]').first()).toBeVisible()
})
