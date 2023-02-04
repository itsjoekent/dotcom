import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { minify } from 'html-minifier';
import { ContentFile, GlobalConfig } from './loader';

export type TemplateToken = { token: string, value: string };

const PAGE_TEMPLATE = 'page';

async function render(name: string, tokens: TemplateToken[] = []): Promise<string> {
  const isRenderingPageTemplate = name === PAGE_TEMPLATE;
  
  const manifestBuffer = await readFile(resolve(process.cwd(), 'dist/manifest.json'));
  const manifest = JSON.parse(manifestBuffer.toString('utf8'));

  const finalTokens = [
    ...tokens,
    ...(isRenderingPageTemplate ? [
      { token: 'pageCss', value: `${manifest['src/entries/page.css'].file}` },
      { token: 'pageJs', value: `${manifest['src/entries/page.ts'].file}` },
    ] : []),
  ];

  const htmlBuffer = await readFile(resolve(process.cwd(), 'templates/', `${name}.html`));
  const html = finalTokens.reduce((html, content) => html.replaceAll(`{{${content.token}}}`, content.value), htmlBuffer.toString('utf8'));

  if (!isRenderingPageTemplate) {
    const manifestEntry = manifest[`src/entries/${name}.ts`];
    const templateJs = manifestEntry ? `<script src="/public/${manifestEntry.file}"></script>` : '';
    const templateCss = manifestEntry && manifestEntry.css ? manifestEntry.css.map((cssFile: string) => `<link rel="stylesheet" href="/public/${cssFile}" />`) : '';

    return render(PAGE_TEMPLATE, [
      { token: 'templateHtml', value: html },
      { token: 'templateJs', value: templateJs },
      { token: 'templateCss', value: templateCss },
      ...tokens,
    ]);
  }

  if (isRenderingPageTemplate && process.env.NODE_ENV === 'production') {
    return minify(html);
  }

  // If prod, minify HTML?
  return html;
}

export async function renderContentFile(contentFile: ContentFile, globalConfig: GlobalConfig): ReturnType<typeof render> {
  const title = contentFile.meta.title ? `${contentFile.meta.title} | ${globalConfig.meta.title}` : globalConfig.meta.title;

  return render(contentFile.template.type, [
    { token: 'title', value: title },
    { token: 'metaDescription', value: contentFile.meta.description || globalConfig.meta.description },
    { token: 'path', value: contentFile.meta.path || '' },
  ]);
}
