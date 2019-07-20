var entradas = [];
var classes =  [];

var contador = 0;

var carregados = '';

function abrir() {
	//var file = event.target.value;
	//file = file.replace(/\\/g, '-');
	//var arr = file.split('-');
	//carregar(arr[arr.length-1]);
	var file;
	file = $('#url').val();
	console.log(file);
	carregar(file);
}

function carregar(str) {
	/*
	$.ajax({
		url: str,
		dataType: 'text',
		success: function(data) {
			var Classe = str.substr(0, str.indexOf('.')).toString().trim();

			data = data.replace(/\r\n\r\n/g, '');
			var arr = data.split('\r\n');

			for(let i=0; i<arr.length; i++) {
				var tokens = arr[i].split(' ');
				for(let j=0; j<tokens.length; j++) {
					entradas.push(tokens[j].toString().trim());
					classes.push(Classe);
				}
			}

			carregados += 'Carregado o arquivo: ' + Classe + '<br>';
			$('#carregados').html(carregados);
			$('#classe').html('0'); 

		}
	}); */
	
	data = $('#texto').val();
	console.log(data);
	
    let Classe = $('#autor').val();
			data = data.replace(/\r\n\r\n/g, '');
			var arr = data.split('\r\n');

			for(let i=0; i<arr.length; i++) {
				var tokens = arr[i].split(' ');
				for(let j=0; j<tokens.length; j++) {
					entradas.push(tokens[j].toString().trim());
					classes.push(Classe);
				}
			}

			carregados += 'Carregado o arquivo: ' + Classe + '<br>';
			$('#carregados').html(carregados);
			$('#classe').html('0'); 


}

function executar() {
	$('#classe').html('...');

	var Entrada = $('#entrada').val().toString().trim();
	var tokenizationEntrada = Entrada.split(' ');

	var nomeClasses = retornaClasses();
	var probabilidade = [];

	for(let x=0; x<tokenizationEntrada.length; x++) {
		var Naive = NaiveBayes(tokenizationEntrada[x]);

		for(let i=0; i<nomeClasses.length; i++) {
			var percentual = math.round(parseFloat(math.dotMultiply(Naive[nomeClasses[i]], 100)), 2);
			if(percentual >= 50)
				probabilidade.push(nomeClasses[i]);
		}
	}

	var classificacao = '';
	var repeticao = 0;
	for(let i=0; i<nomeClasses.length; i++) {
		var repete = probabilidade.filter(function(x){return x==nomeClasses[i]}).length;
		if(repete > repeticao) {
			repeticao = repete;
			classificacao = nomeClasses[i];
		}
	}

	$('#classe').html(classificacao);
}

// elimina os elementos duplicados
function eliminaDuplicados(arr) {
	return [...new Set(arr)];
}

// retorna as classes existentes
function retornaClasses() {
	return eliminaDuplicados(classes);
}

/*
	cria um json com as classes como chave
	e as entradas de cada classe como valor
*/
function organizar() {
	var labels = retornaClasses();

	var params = {};

	for(let i=0; i<entradas.length; i++) {
		// separa as palavras com '-'
		var carac = '';
		if(i<(entradas.length-1)) carac = '-';

		/*
			concatena as entradas de cada classe
			no valor da classe correspondente

			a quantidade de palavras repetidas por classe
			corresponde ao número de classes para a respectiva palavra
		*/
		if(params[classes[i]]) {
			params[classes[i]] += entradas[i] + carac;
		}else {
			params[classes[i]] = entradas[i] + carac;
		}
	}

	// elimina a última vírgula de cada valor
	var str = JSON.stringify(params);
	str = str.replace(/-"/g, '"');
	str = str.replace(/-/g, ',');
	params = JSON.parse(str);

	return params;
}

// conta a quantidade de palavras repetidas em um texto
function contaTexto(texto, procura) {
	return texto.split(procura).length - 1;
}

// tabela de frequência
// monta um json com o número de classes para cada entrada
function frequencia() {
	var categorias = [];
	var params = {};
	var objeto = organizar();
	var labels = retornaClasses();

	for(let i=0; i<entradas.length; i++) {
		params['Entrada'] = entradas[i];

		for(let j=0; j<labels.length; j++) {
			// conta o número de entradas em cada classe
			params[labels[j]] = contaTexto(objeto[labels[j]], entradas[i]);
		}

		categorias[i] = JSON.stringify(params);
	}

	categorias = eliminaDuplicados(categorias);

	for(let i=0; i<categorias.length; i++) {
		categorias[i] = JSON.parse(categorias[i]);
	}

	return categorias;
}

// retorna a quantidade de classes
function quantidadeClasses() {
	var categorias = frequencia();
	return parseInt(Object.keys(categorias[0]).length-1);
}

// soma os valores das classes da entrada passada
function somaClasses(arr) {
	return math.sum(arr.slice(1));
}

// retorna a soma total de cada classe
function totalPorClasse() {
	var totalClasse = [];
	var nomeClasses = retornaClasses();
	var str_classes = JSON.stringify(classes);

	for(let i=0; i<nomeClasses.length; i++) {
		totalClasse[nomeClasses[i]] = contaTexto(str_classes, nomeClasses[i]);
	}
	return totalClasse;
}

// soma dos totais de todas as classes
function somaTotaisClasses() {
	return math.sum(Object.values(totalPorClasse()));
}

// pesos para as entradas
function entradasPeso() {
	var pesos = [];
	var categorias = frequencia();

	for(let i=0; i<categorias.length; i++) {
		pesos[categorias[i].Entrada] = math.dotDivide(somaClasses(Object.values(categorias[i])), somaTotaisClasses());
	}
	return pesos;
}

// pesos para as classes
function classesPeso() {
	var nomeClasses = retornaClasses();
	var totalClasses = totalPorClasse();

	var pesos = [];

	for(let i=0; i<nomeClasses.length; i++) {
		pesos[nomeClasses[i]] = math.dotDivide(totalClasses[nomeClasses[i]], somaTotaisClasses());
	}
	return pesos;
}

// retorna a ocorrência de uma 'Classe' para uma 'Entrada'
function ocorrenciaClasseParaEntrada(_entrada='', _classe='') {
	var categorias = frequencia();
	var retorno = 0;

	categorias.forEach((item) => {
		if(item['Entrada'] == _entrada) {
			retorno = parseFloat(item[_classe]);
		}
	});
	return retorno;
}

// calcula a probabilidade da entrada pertencer a uma determinada classe
function NaiveBayes(_entrada='') {
	var nomeClasses = retornaClasses();
	var totalClasse = totalPorClasse();

	var categorias = frequencia();
	var soma = 0;
	categorias.forEach((item) => {
		if(item['Entrada'] == _entrada) {
			for(let i=0; i<nomeClasses.length; i++) {
				soma += parseFloat(item[nomeClasses[i]]);
			}
		}
	});

	var probabilidade = [];
	for(let i=0; i<nomeClasses.length; i++) {
		probabilidade[nomeClasses[i]] = 

		math.chain(math.dotDivide(ocorrenciaClasseParaEntrada(_entrada, nomeClasses[i]), totalClasse[nomeClasses[i]]))
		.multiply(math.dotDivide(totalClasse[nomeClasses[i]], somaTotaisClasses()))
		.dotDivide(math.dotDivide(soma, somaTotaisClasses())).value;
	}

	return probabilidade;
}
