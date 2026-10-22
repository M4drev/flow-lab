const entrada = Number(process.argv[2] ?? "2");
const resultado = dobrar(entrada);
console.log(resultado);
function dobrar(valor) {
  return valor * 2;
}
