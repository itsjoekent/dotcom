import express from 'express';
import { resolve } from 'path';
import { render } from './templates';

const app = express();

app.use('/public', express.static(resolve(process.cwd(), 'dist')));

app.use('*', async (request, response) => {
  console.log(request.path);
  
  const html = await render('home');
  response.setHeader('content-type', 'text/html').send(html);
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Listening on port:${PORT}`));
