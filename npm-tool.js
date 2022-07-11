const { ChildProcess } = require('@banez/child_process');
const { createConfig, createTasks } = require('@banez/npm-tool');
const path = require('path');
const util = require('util');
const fs = require('fs');
const fsp = require('fs/promises');
const fse = require('fs-extra');

/**
 * @typedef {{
 *  rel: string;
 *  abs: string;
 * }} FileTreeItem
 */

/**
 *
 * @param {string} startingLocation
 * @param {string} location
 * @returns {Promise<FileTreeItem[]>}
 */
async function fileTree(startingLocation, location) {
  /**
   * @type FileTreeItem[]
   */
  const output = [];
  const basePath = path.join(startingLocation, location);
  const files = await util.promisify(fs.readdir)(basePath);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(basePath, file);
    const stat = await util.promisify(fs.lstat)(filePath);
    if (stat.isDirectory()) {
      const children = await fileTree(
        startingLocation,
        path.join(location, file),
      );
      for (let j = 0; j < children.length; j++) {
        const child = children[j];
        output.push(child);
      }
    } else {
      output.push({
        abs: filePath,
        rel: location,
      });
    }
  }
  return output;
}
async function fixImports() {
  const filePaths = await fileTree(path.join(process.cwd(), 'dist'), '');
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    if (filePath.abs.endsWith('.js')) {
      let replacer = './';
      if (filePath.rel !== '') {
        const depth = filePath.rel.split('/').length;
        replacer = new Array(depth - 1).fill('..').join('/');
      }
      const file = (await util.promisify(fs.readFile)(filePath.abs)).toString();
      const fileFixed = file
        .replace(/@bcms/g, replacer)
        .replace(/@becomes\/cms-backend/g, replacer)
        .replace(/@becomes\/cms-backend\/src/g, replacer);
      if (file !== fileFixed) {
        await util.promisify(fs.writeFile)(filePath.abs, fileFixed);
      }
    }
  }
}
async function createImage() {
  const tasks = createTasks([
    {
      title: 'Create lib',
      task: async () => {
        await fse.copy(
          path.join(process.cwd(), 'dist'),
          path.join(process.cwd(), 'lib'),
        );
        await fse.copy(
          path.join(
            process.cwd(),
            'node_modules',
            '@becomes',
            'cms-ui',
            'public',
          ),
          path.join(process.cwd(), 'lib', 'public'),
        );
      },
    },
    {
      title: 'Create docker image',
      task: async () => {
        await ChildProcess.spawn('docker', [
          'build',
          '.',
          '-t',
          'becomes/cms-backend',
        ]);
      },
    },
    {
      title: 'Remove lib',
      task: async () => {
        await fse.remove(path.join(process.cwd(), 'lib'));
      },
    },
  ]);
  await tasks.run();
}

module.exports = createConfig({
  bundle: {
    extend: [
      {
        title: 'Fix imports',
        task: async () => {
          await fixImports();
        },
      },
      {
        title: 'Copy response codes',
        task: async () => {
          await fse.copy(
            path.join(process.cwd(), 'src', 'response-code', 'codes'),
            path.join(process.cwd(), 'dist', 'src', 'response-code', 'codes'),
          );
        },
      },
      {
        title: 'Create custom package.json',
        task: async () => {
          const packageJson = JSON.parse(
            await fsp.readFile(path.join(process.cwd(), 'package.json')),
          );
          packageJson.devDependencies = undefined;
          packageJson.nodemonConfig = undefined;
          packageJson.scripts = {
            start: 'node src/main.js',
          };
          await fsp.writeFile(
            path.join(process.cwd(), 'dist', 'package.json'),
            JSON.stringify(packageJson, null, '  '),
          );
        },
      },
    ],
  },
  custom: {
    '--local-dev-bundle': async () => {
      const tasks = createTasks([
        {
          title: 'Remove dist directory.',
          task: async () => {
            await fse.remove(path.join(__dirname, 'local-dev-dist'));
          },
        },
        {
          title: 'Copy src',
          task: async () => {
            await fse.copy(
              path.join(__dirname, 'src'),
              path.join(__dirname, 'local-dev-dist', 'src'),
            );
          },
        },
        {
          title: 'Copy assets',
          task: async () => {
            const files = ['tsconfig.json', '.eslintrc', '.eslintignore'];
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              await fse.copy(
                path.join(__dirname, file),
                path.join(__dirname, 'local-dev-dist', file),
              );
            }
            await fse.copy(
              path.join(
                process.cwd(),
                'node_modules',
                '@becomes',
                'cms-ui',
                'public',
              ),
              path.join(process.cwd(), 'local-dev-dist', 'public'),
            );
          },
        },
        {
          title: 'Copy package.json.',
          task: async () => {
            const data = JSON.parse(
              (
                await util.promisify(fs.readFile)(
                  path.join(__dirname, 'package.json'),
                )
              ).toString(),
            );
            await util.promisify(fs.writeFile)(
              path.join(__dirname, 'local-dev-dist', 'package.json'),
              JSON.stringify(data, null, '  '),
            );
          },
        },
        {
          title: 'Copy LICENSE',
          task: async () => {
            await util.promisify(fs.copyFile)(
              path.join(__dirname, 'LICENSE'),
              path.join(__dirname, 'local-dev-dist', 'LICENSE'),
            );
          },
        },
        {
          title: 'Copy Dockerfile',
          task: async () => {
            await util.promisify(fs.copyFile)(
              path.join(__dirname, 'Dockerfile.dev'),
              path.join(__dirname, 'local-dev-dist', 'Dockerfile'),
            );
          },
        },
      ]);
      await tasks.run();
    },
    '--local-dev-pack': async () => {
      await ChildProcess.spawn('npm', ['pack'], {
        cwd: path.join(process.cwd(), 'local-dev-dist'),
        stdio: 'inherit',
      });
    },
    '--create-image': async () => {
      await createImage();
    },
  },
});
