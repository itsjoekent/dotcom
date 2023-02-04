import express from 'express';
import { resolve } from 'path';
import { renderContentFile } from './renderer';
import { loadGlobalConfig, loadPath } from './loader';

const app = express();

app.use('/public', express.static(resolve(process.cwd(), 'dist')));

app.use('*', async (request, response) => {
  const contentFile = await loadPath(request.path);
  const globalConfig = await loadGlobalConfig();

  const html = await renderContentFile(contentFile, globalConfig);
  response.setHeader('content-type', 'text/html').send(html);
});

const PORT = process.env.PORT || '3000';
app.listen(PORT, () => console.log(`Listening on port:${PORT}`));
