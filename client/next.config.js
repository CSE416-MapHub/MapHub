/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.SERVER === "prod" ? "/" : "/dev"
}

module.exports = nextConfig
