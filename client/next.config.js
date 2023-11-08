/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.SERVER?.trim() === "dev" ? "/dev" : ""
}

module.exports = nextConfig
