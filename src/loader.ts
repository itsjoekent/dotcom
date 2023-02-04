import { readFile, readdir, stat } from 'fs/promises';
import matter from 'gray-matter';
import { resolve } from 'path';
import { marked } from 'marked';
import toml from 'toml';

export type ContentFile = {
  meta: {
    title?: string;
    description?: string;
    path?: string;
  };
  template: {
    type: string;
  };
  markdown: string;
  markdownHtml: string;
};

export type GlobalConfig = {
  meta: {
    title: string;
    description: string;
  };
};

const matterConfig = {
  engines: {
    toml: {
      parse: toml.parse.bind(toml),
    },
  },
};

export async function loadGlobalConfig(): Promise<GlobalConfig> {
  const buffer = await readFile(resolve(process.cwd(), 'content/_global.toml'));
  const data = toml.parse(buffer.toString('utf8'));

  return {
    meta: {
      title: data?.meta?.title || '',
      description: data?.meta?.description || '',
    },
  };
}

export async function loadAllContent(): Promise<ContentFile[]> {
  async function recursiveLookup(path: string): Promise<ContentFile[]> {
    const files = await readdir(path);
    const contentFilenames = files.filter((filename) => !filename.startsWith('_') && filename.endsWith('.md'));
    
    const stats = await Promise.all(files.map((filename) => stat(resolve(path, filename))));

    const directories = stats
      .map((stat, index) => ({ stat, filename: files[index] }))
      .filter(({ stat }) => stat.isDirectory())
      .map(({ filename }) => filename);
    
    const contentFileBuffers = await Promise.all(contentFilenames.map((filename) => readFile(resolve(path, filename))));
    const contentFilesParsed = contentFileBuffers.map((buffer) => matter(buffer, matterConfig));
    const contentFiles: ContentFile[] = contentFilesParsed.map((parsed) => ({
      meta: {
        title: parsed.data?.meta?.title,
        description: parsed.data?.meta?.description,
        path: parsed.data?.meta?.path,
      },
      template: {
        type: parsed.data?.template?.type || 'home', // TODO: Replace with 404 type
      },
      markdown: parsed.content,
      // Remove the most common zerowidth characters from the start of the file
      markdownHtml: marked.parse(parsed.content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')),
    }));

    const subdirectoryContentFiles = await Promise.all(directories.map((directory) => recursiveLookup(resolve(path, directory))));

    return [
      ...contentFiles,
      ...subdirectoryContentFiles.reduce((flatten, list) => [...flatten, ...list] , []),
    ];
  }

  return recursiveLookup(resolve(process.cwd(), 'content'));
}

export async function loadPath(path: string): Promise<ContentFile> {
  const content = await loadAllContent();
  const match = content.find((contentFile) => contentFile.meta.path === path);

  if (!match) throw new Error('404 not found');
  return match;
}
