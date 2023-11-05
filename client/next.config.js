/** @type {import('next').NextConfig} */
console.log(process.env)
const nextConfig = {
    basePath: process.env.SERVER.trim() === "dev" ? "/dev" : ""
}

module.exports = nextConfig
