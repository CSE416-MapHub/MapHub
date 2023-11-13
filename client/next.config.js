/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    basePath: process.env.SERVER?.trim() === "dev" ? "/dev" : "",
    sassOptions: {
      includePaths: [path.join(__dirname, 'src', 'styles')],
    },
}

module.exports = nextConfig
