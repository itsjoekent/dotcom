import { readFile } from 'fs/promises';
import { resolve } from 'path';

type TemplateToken = { token: string, value: string };

const PAGE_TEMPLATE = 'page';

export async function render(name: string, tokens: TemplateToken[] = []): Promise<string> {
  const isRenderingPageTemplate = name === PAGE_TEMPLATE;
  
  const manifestBuffer = await readFile(resolve(process.cwd(), 'dist/manifest.json'));
  const manifest = JSON.parse(manifestBuffer.toString('utf8'));

  const finalTokens = [
    ...tokens,
    ...(isRenderingPageTemplate ? [
      { token: 'pageCss', value: `${manifest['src/entries/page.ts'].file}` },
      { token: 'pageJs', value: `${manifest['src/entries/page.ts'].file}` },
    ] : []),
  ];

  const htmlBuffer = await readFile(resolve(process.cwd(), 'templates/', `${name}.html`));
  const html = finalTokens.reduce((html, content) => html.replace(`{{${content.token}}}`, content.value), htmlBuffer.toString('utf8'));

  if (!isRenderingPageTemplate) {
    // TODO: Entry files
    return render(PAGE_TEMPLATE, [{ token: 'templateHtml', value: html }]);
  }

  // If prod, minify HTML?
  return html;
}


