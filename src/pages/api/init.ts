import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(404).end();

	const config = await prisma.config.findUnique({ where: { name: 'init' } });

	if (config && config.value === 'true') return res.status(400).end();

	const databaseData = getDatabaseData();

	await prisma.$transaction([
		prisma.config.createMany({ data: databaseData.config }),
		prisma.info.createMany({ data: databaseData.info }),
		prisma.extraInfo.createMany({ data: databaseData.extraInfo }),
		prisma.attribute.createMany({ data: databaseData.attribute }),
		prisma.spec.createMany({ data: databaseData.spec }),
		prisma.characteristic.createMany({ data: databaseData.characteristic }),
		prisma.currency.createMany({ data: databaseData.currency }),
		prisma.specialization.createMany({ data: databaseData.specialization }),
		prisma.equipment.createMany({ data: databaseData.equipment }),
		prisma.item.createMany({ data: databaseData.item }),
		prisma.spell.createMany({ data: databaseData.spell }),
	]);

	await prisma.$transaction([
		prisma.attributeStatus.createMany({ data: databaseData.attribute_status }),
		prisma.skill.createMany({ data: databaseData.skill }),
	]);

	res.end();
}

const getDatabaseData = () => ({
	config: [
		{
			name: 'init',
			value: 'true',
		},
		{
			name: 'environment',
			value: 'idle',
		},
		{
			name: 'admin_key',
			value: '123456',
		},
		{
			name: 'enable_success_types',
			value: 'false',
		},
		{
			name: 'enable_automatic_markers',
			value: 'true',
		},
		{
			name: 'portrait_font',
			value: 'null',
		},
		{
			name: 'dice',
			value: JSON.stringify({
				characteristic: {
					value: 20,
					branched: false,
					enable_modifiers: false,
				},
				skill: {
					value: 20,
					branched: false,
					enable_modifiers: false,
				},
				attribute: {
					value: 100,
					branched: false,
				},
			}),
		},
	],
	attribute: [
		{
			id: 1,
			name: 'Vida',
			color: 'b62323',
			rollable: false,
		},
		{
			id: 2,
			name: 'Sanidade',
			color: '1f3ce0',
			rollable: true,
		},
		{
			id: 3,
			name: 'Magia',
			color: 'ae00ff',
			rollable: false,
		},	
	],
	attribute_status: [
		{
			name: 'Inconsciente',
			attribute_id: 1,
		},
		{
			name: 'Ferimento Grave',
			attribute_id: 1,
		},
		{
			name: 'Traumatizado',
			attribute_id: 3,
		},
		{
			name: 'Enlouquecido',
			attribute_id: 3,
		},
	],
	characteristic: [
		{ name: 'For??a' },
		{ name: 'Destreza' },
		{ name: 'Intelig??ncia' },
		{ name: 'Constitui????o' },
		{ name: 'Apar??ncia' },
		{ name: 'Poder' },
		{ name: 'Tamanho' },
		{ name: 'Educa????o' },
	],
	currency: [{ name: 'N??vel de Gasto Di??rio' }, { name: 'Dinheiro' }],
	equipment: [
		{
			name: 'Desarmado',
			type: 'Comum',
			damage: '1d3+DB',
			range: 'Toque',
			attacks: '1',
			ammo: null,
			visible: true,
		},
	],
	extraInfo: [
		{ name: 'Descri????o Pessoal' },
		{ name: 'Ideologia & Cren??as' },
		{ name: 'Pessoas & Lugares Significativos' },
		{ name: 'Patrim??nio & Bens Preciosos' },
		{ name: 'Caracter??sticas' },
		{ name: 'Les??es/Cicatrizes' },
		{ name: 'Fobias & Manias' },
		{ name: 'Encontros com Criaturas' },
	],
	info: [
		{
			name: 'Player',
		},
		{
			name: 'Ocupa????o',
		},
		{
			name: 'Idade',
		},
		{
			name: 'G??nero',
		},
		{
			name: 'Resid??ncia',
		},
		{
			name: 'Local de Nascimento',
		},
		{
			name: 'Peso',
		},
		{
			name: 'Altura',
		},
	],
	item: [
		{
			name: 'Chapa de Identifica????o',
			description: 'Uma chapa de identifica????o militar.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Vestimentas',
			description: 'Descreva suas vestimentas aqui.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Celular',
			description: 'Um celular comum.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Isqueiro',
			description: 'Um isqueiro comum.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Mochila',
			description: 'Uma mochila comum. Descreva aqui seu tamanho e sua capacidade.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Maleta',
			description: 'Uma maleta comum. Descreva aqui seu tamanho e sua capacidade.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Mala',
			description: 'Uma mala comum. Descreva aqui seu tamanho e sua capacidade.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Bolsa',
			description: 'Uma bolsa comum. Descreva aqui seu tamanho e sua capacidade.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Rel??gio',
			description: 'Um rel??gio comum.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Carteira',
			description: 'Uma carteira comum.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Livro',
			description: 'Um livro comum. Descreva aqui o conte??do do livro.',
			weight: 0,
			visible: true,
		},
		{
			name: 'Kit M??dico',
			description:
				'Um kit m??dico que garante vantagem em Primeiros Socorros/Medicina no uso.',
			weight: 0,
			visible: true,
		},
	],
	skill: [
		{
			name: 'Antropologia',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Arcos',
			specialization_id: 1,
			mandatory: false,
			startValue: 15,
		},
		{
			name: 'Armas Pesadas',
			specialization_id: 1,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Lan??a-Chamas',
			specialization_id: 1,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Metralhadoras',
			specialization_id: 1,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Pistolas',
			specialization_id: 1,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Rifles/Espingardas',
			specialization_id: 1,
			mandatory: true,
			startValue: 25,
		},
		{
			name: 'Submetralhadoras',
			specialization_id: 1,
			mandatory: false,
			startValue: 15,
		},
		{
			name: 'Arqueologia',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Arremessar',
			specialization_id: null,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Atua????o',
			specialization_id: 2,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Belas Artes',
			specialization_id: 2,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Criptografia',
			specialization_id: 2,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Falsifica????o',
			specialization_id: 2,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Fotografia',
			specialization_id: 2,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Artilharia',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Avalia????o',
			specialization_id: null,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Cavalgar',
			specialization_id: null,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Charme',
			specialization_id: null,
			mandatory: true,
			startValue: 15,
		},
		{
			name: 'Chaveiro',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Astronomia',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Biologia',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Bot??nica',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Ci??ncia Forense',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Engenharia',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Farm??cia',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'F??sica',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Geologia',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Matem??tica',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Meteorologia',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Qu??mica',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Zoologia',
			specialization_id: 3,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Consertos El??tricos',
			specialization_id: null,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Consertos Mec??nicos',
			specialization_id: null,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Contabilidade',
			specialization_id: null,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Demoli????es',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Direito',
			specialization_id: null,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Dirigir Autom??veis',
			specialization_id: null,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Disfarce',
			specialization_id: null,
			mandatory: true,
			startValue: 5,
		},
		{
			name: 'Eletr??nica',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Encontrar',
			specialization_id: null,
			mandatory: true,
			startValue: 25,
		},
		{
			name: 'Escalar',
			specialization_id: null,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Escutar',
			specialization_id: null,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Esquivar',
			specialization_id: null,
			mandatory: true,
			startValue: 0,
		},
		{
			name: 'Furtividade',
			specialization_id: null,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Hipnose',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Hist??ria',
			specialization_id: null,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Intimida????o',
			specialization_id: null,
			mandatory: true,
			startValue: 15,
		},
		{
			name: 'L??bia',
			specialization_id: null,
			mandatory: true,
			startValue: 5,
		},
		{
			name: 'Leitura Labial',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Nativa',
			specialization_id: 4,
			mandatory: true,
			startValue: 0,
		},
		{
			name: 'Briga',
			specialization_id: 5,
			mandatory: true,
			startValue: 25,
		},
		{
			name: 'Chicotes',
			specialization_id: 5,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Espadas',
			specialization_id: 5,
			mandatory: false,
			startValue: 20,
		},
		{
			name: 'Garrote',
			specialization_id: 5,
			mandatory: false,
			startValue: 15,
		},
		{
			name: 'Lan??as',
			specialization_id: 5,
			mandatory: false,
			startValue: 20,
		},
		{
			name: 'Machados',
			specialization_id: 5,
			mandatory: false,
			startValue: 15,
		},
		{
			name: 'Manguais',
			specialization_id: 5,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Motosserras',
			specialization_id: 5,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Medicina',
			specialization_id: null,
			mandatory: true,
			startValue: 1,
		},
		{
			name: 'Mergulho',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Mundo Natural',
			specialization_id: null,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Nata????o',
			specialization_id: null,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Navega????o',
			specialization_id: null,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'N??vel de Cr??dito',
			specialization_id: null,
			mandatory: true,
			startValue: 0,
		},
		{
			name: 'Ocultismo',
			specialization_id: null,
			mandatory: true,
			startValue: 5,
		},
		{
			name: 'Operar Maquin??rio Pesado',
			specialization_id: null,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Persuas??o',
			specialization_id: null,
			mandatory: true,
			startValue: 10,
		},
		{
			name: 'Aeronave',
			specialization_id: 6,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Barco',
			specialization_id: 6,
			mandatory: false,
			startValue: 1,
		},
		{
			name: 'Prestidigita????o',
			specialization_id: null,
			mandatory: true,
			startValue: 10,
		},
		{
			name: 'Primeiros Socorros',
			specialization_id: null,
			mandatory: true,
			startValue: 30,
		},
		{
			name: 'Psican??lise',
			specialization_id: null,
			mandatory: true,
			startValue: 1,
		},
		{
			name: 'Psicologia',
			specialization_id: null,
			mandatory: true,
			startValue: 10,
		},
		{
			name: 'Rastrear',
			specialization_id: null,
			mandatory: false,
			startValue: 10,
		},
		{
			name: 'Saltar',
			specialization_id: null,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Treinar Animais',
			specialization_id: null,
			mandatory: false,
			startValue: 5,
		},
		{
			name: 'Usar Bibliotecas',
			specialization_id: null,
			mandatory: true,
			startValue: 20,
		},
		{
			name: 'Usar Computadores',
			specialization_id: null,
			mandatory: false,
			startValue: 5,
		},
	],
	spec: [{ name: 'Dano B??nus' }, { name: 'Corpo' }, { name: 'Taxa de Movimento' }],
	specialization: [
		{
			id: 1,
			name: 'Armas de Fogo',
		},
		{
			id: 2,
			name: 'Arte e Of??cio',
		},
		{
			id: 3,
			name: 'Ci??ncia',
		},
		{
			id: 4,
			name: 'L??ngua',
		},
		{
			id: 5,
			name: 'Lutar',
		},
		{
			id: 6,
			name: 'Pilotar',
		},
		{
			id: 7,
			name: 'Sobreviv??ncia',
		},
	],
	spell: [
		{
			name: 'Bola de Fogo',
			description: 'Gera uma pequena bola de fogo na m??o do usu??rio.',
			cost: '1d4+2 PM',
			type: 'Nenhum',
			target: '??nico',
			damage: '1d10',
			castingTime: 'Instant??neo',
			range: '25 Metros',
			duration: 'Instant??neo',
			slots: 1,
			visible: true,
		},
	],
});
