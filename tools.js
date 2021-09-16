const childProcess = require('child_process');
const fse = require('fs-extra');
const fs = require('fs');
const util = require('util');
const path = require('path');

/**
 * @typedef {{
 *  title: string
 *  task: (function(): Promise<void>)
 * }} Task
 */

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {import('child_process').SpawnOptions?} options
 */
async function spawn(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const proc = childProcess.spawn(
      cmd,
      args,
      options
        ? options
        : {
            stdio: 'inherit',
          },
    );
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
}
/**
 * @param {Task[]} tasks
 */
function createTasks(tasks) {
  return {
    run: async () => {
      for (let i = 0; i < tasks.length; i = i + 1) {
        const t = tasks[i];
        console.log(`${i + 1}. ${t.title}`);
        try {
          await t.task();
          console.log(`✓`);
        } catch (error) {
          console.log(`⨉`);
          throw error;
        }
      }
    },
  };
}

const parseArgs = (rawArgs) => {
  const args = {};
  let i = 2;
  while (i < rawArgs.length) {
    const arg = rawArgs[i];
    let value = '';
    if (rawArgs[i + 1]) {
      value = rawArgs[i + 1].startsWith('--') ? '' : rawArgs[i + 1];
    }
    args[arg] = value;
    if (value === '') {
      i = i + 1;
    } else {
      i = i + 2;
    }
  }
  return {
    bundle: args['--bundle'] === '' || args['--bundle'] === 'true' || false,
    local: args['--local'] === '' || args['--local'] === 'true' || false,
    link: args['--link'] === '' || args['--link'] === 'true' || false,
    unlink: args['--unlink'] === '' || args['--unlink'] === 'true' || false,
    publish: args['--publish'] === '' || args['--publish'] === 'true' || false,
    build: args['--build'] === '' || args['--build'] === 'true' || false,
    sudo: args['--sudo'] === '' || args['--sudo'] === 'true' || false,
    pack: args['--pack'] === '' || args['--pack'] === 'true' || false,
    localDevBundle:
      args['--local-dev'] === '' || args['--local-dev'] === 'true' || false,
    localDevPack:
      args['--local-dev-pack'] === '' ||
      args['--local-dev-pack'] === 'true' ||
      false,
  };
};
async function bundle() {
  const tasks = createTasks([
    {
      title: 'Remove dist directory.',
      task: async () => {
        await fse.remove(path.join(__dirname, 'dist'));
      },
    },
    {
      title: 'Compile Typescript.',
      task: async () => {
        await build();
      },
    },
    {
      title: 'Fix imports',
      async task() {
        await fixImports()
      }
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
        data.devDependencies = undefined;
        data.nodemonConfig = undefined;
        data.scripts = undefined;
        await util.promisify(fs.writeFile)(
          path.join(__dirname, 'dist', 'package.json'),
          JSON.stringify(data, null, '  '),
        );
      },
    },
    {
      title: 'Copy LICENSE',
      task: async () => {
        await util.promisify(fs.copyFile)(
          path.join(__dirname, 'LICENSE'),
          path.join(__dirname, 'dist', 'LICENSE'),
        );
      },
    },
  ]);
  await tasks.run();
}
async function localDevBundle() {
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
          path.join(__dirname, 'local-dev-dist'),
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
      },
    },
    {
      // TODO: Remove this set when prod is ready
      title: 'Copy purple Cheetah - DEV ONLY',
      task: async () => {
        await fse.copy(
          path.join(__dirname, 'purple-cheetah'),
          path.join(__dirname, 'local-dev-dist', 'purple-cheetah'),
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
  ]);
  await tasks.run();
}
/**
 * @param {boolean} sudo
 * @returns {Promise<void>}
 */
async function link(sudo) {
  await spawn('npm', ['i'], {
    cwd: path.join(process.cwd(), 'dist'),
    stdio: 'inherit',
  });
  if (sudo) {
    await spawn('sudo', ['npm', 'link'], {
      cwd: path.join(process.cwd(), 'dist'),
      stdio: 'inherit',
    });
  } else {
    await spawn('npm', ['link'], {
      cwd: path.join(process.cwd(), 'dist'),
      stdio: 'inherit',
    });
  }
}
/**
 * @param {boolean} sudo
 * @returns {Promise<void>}
 */
async function unlink(sudo) {
  if (sudo) {
    await spawn('sudo', ['npm', 'link'], {
      cwd: path.join(process.cwd(), 'dist'),
      stdio: 'inherit',
    });
  } else {
    await spawn('npm', ['unlink'], {
      cwd: path.join(process.cwd(), 'dist'),
      stdio: 'inherit',
    });
  }
}
async function publish() {
  if (
    await util.promisify(fs.exists)(
      path.join(__dirname, 'dist', 'node_modules'),
    )
  ) {
    throw new Error(
      `Please remove "${path.join(__dirname, 'dist', 'node_modules')}"`,
    );
  }
  await spawn('npm', ['publish', '--access=private'], {
    cwd: path.join(process.cwd(), 'dist'),
    stdio: 'inherit',
  });
}
async function build() {
  await spawn('npm', ['run', 'build:ts']);
  await fse.copy(
    path.join(__dirname, 'src', 'response-code', 'codes'),
    path.join(__dirname, 'dist', 'src', 'response-code', 'codes'),
  );
}
async function pack() {
  await spawn('npm', ['pack'], {
    cwd: path.join(process.cwd(), 'dist'),
    stdio: 'inherit',
  });
}
async function localDevPack() {
  await spawn('npm', ['pack'], {
    cwd: path.join(process.cwd(), 'local-dev-dist'),
    stdio: 'inherit',
  });
}
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
async function fileTree(
  startingLocation,
  location,
) {
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
    if(filePath.abs.endsWith('.js')) {
      let replacer = './';
      if (filePath.rel !== '') {
        const depth = filePath.rel.split('/').length;
        replacer = new Array(depth - 1).fill('..').join('/');
      }
      const file = (await util.promisify(fs.readFile)(filePath.abs)).toString();
      const fileFixed = file.replace(/@bcms/g, replacer).replace(/@becomes\/cms-backend/g, replacer);
      if (file !== fileFixed) {
        await util.promisify(fs.writeFile)(filePath.abs, fileFixed);
      }
    }
  }
}

async function main() {
  const options = parseArgs(process.argv);
  if (options.bundle === true) {
    await bundle();
  } else if (options.link === true) {
    await link(options.sudo);
  } else if (options.unlink === true) {
    await unlink(options.sudo);
  } else if (options.publish === true) {
    await publish();
  } else if (options.build === true) {
    await build();
  } else if (options.pack === true) {
    await pack();
  } else if (options.localDevBundle) {
    await localDevBundle();
  } else if (options.localDevPack) {
    await localDevPack();
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
