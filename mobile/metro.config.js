const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
// packages/shared vive fora de mobile/ (é compartilhado com o app web em ../).
// watchFolders + extraNodeModules ensinam o Metro a enxergar e resolver
// "@localizador/shared" mesmo estando fora da raiz padrão do projeto.
const sharedPackageRoot = path.resolve(projectRoot, "../packages/shared");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), sharedPackageRoot];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@localizador/shared": sharedPackageRoot,
};

module.exports = config;
