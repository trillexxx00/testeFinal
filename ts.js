const cacheTipos = { tabela: null };

async function carregarTiposTempo() {
  if (!cacheTipos.tabela) {
    const resp = await fetch('https://api.ipma.pt/open-data/weather-type-classe.json');
    const json = await resp.json();
    cacheTipos.tabela = json.data;
  }
}

function Tempo(id) {
  if (!cacheTipos.tabela) ;
  return cacheTipos.tabela.find(t => +t.idWeatherType === id)?.descWeatherTypePT ?? '';
}

async function carregarCidades() {
  try {
    const resp = await fetch('https://api.ipma.pt/open-data/distrits-islands.json');
    const { data } = await resp.json();
    const select = document.getElementById('Regiao');

    data.forEach(local => {
      const opt = document.createElement('option');
      opt.value = local.globalIdLocal;
      opt.textContent = local.local;
      select.appendChild(opt);
    });

    carregarPrevisao(select.value);
  } catch (error) {
    console.error('Erro ao carregar cidades:', error);
  }
}

async function carregarPrevisao(globalIdLocal) {
  try {
    await carregarTiposTempo();

    const resp = await fetch(`https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/${globalIdLocal}.json`);
    const { data } = await resp.json();

    const container = document.getElementById('previsao');
    const localNome = document.getElementById('local-nome');
    const select = document.getElementById('Regiao');

    localNome.textContent = select.selectedOptions[0].textContent;
    container.innerHTML = '';

    data.slice(0, 5).forEach((dia) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <strong>${formatarData(dia.forecastDate)}</strong><br>
    Máx: ${dia.tMax} °C<br>
    Mín: ${dia.tMin} °C<br>
    Chuva: ${dia.precipitaProb || 0}%
    Vento: ${dia.predWindDir}<br>
        ${Tempo(+dia.idWeatherType)}
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar previsão:', error);
  }
}

function formatarData(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

document.getElementById('Regiao').addEventListener('change', e => {
  carregarPrevisao(e.target.value);
});

document.getElementById('buscar').addEventListener('click', () => {
  const select = document.getElementById('Regiao');
  carregarPrevisao(select.value);
});

(async function () {
  await carregarCidades();
})();
