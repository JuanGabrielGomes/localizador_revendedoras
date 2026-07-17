/**
 * O CSV original veio com mojibake: os bytes UTF-8 corretos foram relidos como
 * Latin-1/Windows-1252 em algum ponto da cadeia de exportação (ex: "PatrÃ­cia" em
 * vez de "Patrícia", BOM virando "ï»¿"). Revertendo: cada caractere do texto
 * corrompido corresponde 1:1 a um byte Latin-1 do UTF-8 original, então
 * reinterpretar a string como Latin-1 e decodificar como UTF-8 recupera o texto correto.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const inputPath = resolve(__dirname, "../data/revendedoras-original.csv");
const outputPath = resolve(__dirname, "../data/revendedoras-raw.csv");

const mojibake = readFileSync(inputPath, "utf-8");
const fixed = Buffer.from(mojibake, "latin1").toString("utf-8").replace(/^﻿/, "");

writeFileSync(outputPath, fixed, "utf-8");

console.log(`Encoding corrigido: ${inputPath} -> ${outputPath}`);
console.log(fixed.split("\n").slice(0, 4).join("\n"));
