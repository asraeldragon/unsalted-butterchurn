const esbuild = require('esbuild')
const { htmlPlugin } = require('@craftamap/esbuild-plugin-html')

const outputFolder = process.env.NODE_ENV === 'production' ? 'docs' : 'dist/'

const main = async () => {
  const pluginsList = [htmlPlugin({
    files: [{
      entryPoints: [
        'src/index.js',
      ],
      filename: 'index.html',
      title: 'Visualizer',
      serve: process.env.NODE_ENV !== 'production',
      define: {
        env: process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
      },
      htmlTemplate: 'src/index.html.template',
    }],
  })]

  const buildOptions = {
    entryPoints: ['src/index.js'],
    bundle: true,
    metafile: true,
    minify: true,
    sourcemap: true,
    target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    outdir: outputFolder,
    assetNames: '[name]',
    plugins: pluginsList,
    logLevel: 'info',
  }

  if( process.env.NODE_ENV === 'production' ) {
    // build mode
    await esbuild.build(buildOptions)
  } else {
    // Start dev server
    const livery = (await import('livery')).default
    const { fileWatcher } = livery(outputFolder, {
      delay: 250,
      httpPort: 3000,
      livePort: 35729,
      spa: false,
      watch: outputFolder + '*.*',
    })

    // watch and rebuild files live
    await esbuild.build(Object.assign({}, buildOptions, {
      watch: {
        onRebuild(error, result) {
          if( error ) {
            console.error('watch build failed', error)
          } else {
            console.log('watch build succeeded')
            // Livery uses Chokidar and on Windows, Chokidar is crappy.
            // Force a reload when ESBuild rebuilds.
            // This is fine to do regardless of OS since it's debounced.
            fileWatcher.emit('all')
          }
        },
      },
    }))
  }
}
main()
