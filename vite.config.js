import { defineConfig } from 'vite';
import path from 'path';
import vuePlugin from '@vitejs/plugin-vue2';
import { execSync } from 'child_process';

const getGitDescription = () => {
  try {
    return execSync('git describe --tags').toString()
  } catch (error) {
    return null
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: ''
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src')
      }
    ],
    extensions: [
      '.mjs',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
      '.vue'
    ]
  },
  plugins: [
    vuePlugin({ jsx: true }),
  ],
  define: {
    GIT_DESCRIBE_TAGS: JSON.stringify(getGitDescription())
  },
  server: {
    port: 8080,
    hmr: {
      overlay: false
    }
  },
})
