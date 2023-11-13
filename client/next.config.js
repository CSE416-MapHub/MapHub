/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    basePath: process.env.SERVER?.trim() === "dev" ? "/dev" : "",
    compiler: { 
      // Removes attributes /^data-test/ from components during compilation.
      reactRemoveProperties: true,
    },
    sassOptions: {
      includePaths: [path.join(__dirname, 'src', 'styles')],
    },
}

module.exports = nextConfig
