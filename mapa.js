/* ============================================================
   MAPA INTERACTIVO COMARCAS — MOVEMENTO SUMAR GALICIA
   Lóxica do mapa. Servido vía jsDelivr desde o repo.
   ============================================================ */

(function() {
  // ========== CONFIG ==========
  var URL_COMARCAS   = 'https://cdn.jsdelivr.net/gh/sumar-galicia/sumargalicia-datos-comarcas@main/comarcas_sumar.json';
  var URL_MUNICIPIOS = 'https://cdn.jsdelivr.net/gh/sumar-galicia/sumargalicia-datos-comarcas@main/municipios_galicia.json';
  var URL_DATOS_CSV  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRF5nBP2ohGoCJNpna9z02IRGRJEKu1Ow4KPZIu20FgDhXUa9RzDaTP1nTmwa4pd50nrPo7Eg6Ntgab/pub?gid=0&single=true&output=csv';
  // ============================

  var COLOR_FALLBACK = '#888';
  var panel = document.getElementById('sg-panel');
  var mapa, capaComarcas;
  var datosComarca = {};

  var ICON_INSTAGRAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>';
  var ICON_FACEBOOK  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>';

  function mostrarError(msg) { if (panel) panel.innerHTML = '<p class="sg-error">' + msg + '</p>'; }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function siglas(nombre) {
    return nombre.replace(/[–-]/g,' ').split(/\s+/).filter(Boolean).slice(0,2).map(function(w){return w[0];}).join('').toUpperCase();
  }

  function colorDe(id) {
    var d = datosComarca[id];
    if (d && d.color && /^#[0-9a-f]{3,8}$/i.test(String(d.color).trim())) return String(d.color).trim();
    return COLOR_FALLBACK;
  }

  function normalizaUrl(u, tipo) {
    u = String(u || '').trim();
    if (!u) return '';
    if (tipo === 'instagram' && /^@?[\w.]+$/.test(u)) return 'https://instagram.com/' + u.replace(/^@/, '');
    if (tipo === 'facebook'  && /^[\w.\-]+$/.test(u))  return 'https://facebook.com/' + u;
    if (/^https?:\/\//i.test(u)) return u;
    if (/^[\w.\-]+\.[a-z]{2,}/i.test(u)) return 'https://' + u;
    return '';
  }

  function pintarPanel(props) {
    var id = props.comarca_id;
    var d = datosComarca[id] || {};
    var nombre = (d.nombre && String(d.nombre).trim()) || props.comarca;
    var sede = (d.sede && String(d.sede).trim()) || props.sede;
    var color = colorDe(id);
    var urlSello = String(d.url_sello || '').trim();
    var sello = /^https?:\/\//i.test(urlSello) ? '<img src="'+escapeHtml(urlSello)+'" alt="">' : escapeHtml(siglas(nombre));

    var html = '<div class="sg-comarca-card">';
    html += '<button class="sg-comarca-volver" type="button" aria-label="Voltar á vista xeral">‹ Voltar</button>';
    html += '<div class="sg-comarca-head">';
    html += '<div class="sg-comarca-marca" style="background:'+color+'">'+sello+'</div>';
    html += '<div class="sg-comarca-titulo"><h3>'+escapeHtml(nombre)+'</h3>';
    html += '<p>'+escapeHtml(props.n_concellos)+' concellos · sede en '+escapeHtml(sede)+'</p></div></div>';

    var resp = String(d.responsable || '').trim();
    var email = String(d.email || '').trim();
    if (resp || email) {
      html += '<dl class="sg-comarca-meta">';
      if (resp) html += '<dt>Responsable</dt><dd>'+escapeHtml(resp)+'</dd>';
      if (email) html += '<dt>Contacto</dt><dd><a href="mailto:'+escapeHtml(email)+'">'+escapeHtml(email)+'</a></dd>';
      html += '</dl>';
    }

    var ig = normalizaUrl(d.instagram, 'instagram');
    var fb = normalizaUrl(d.facebook, 'facebook');
    if (ig || fb) {
      html += '<div class="sg-redes">';
      if (ig) html += '<a href="'+escapeHtml(ig)+'" target="_blank" rel="noopener noreferrer" aria-label="Instagram de '+escapeHtml(nombre)+'" title="Instagram">'+ICON_INSTAGRAM+'</a>';
      if (fb) html += '<a href="'+escapeHtml(fb)+'" target="_blank" rel="noopener noreferrer" aria-label="Facebook de '+escapeHtml(nombre)+'" title="Facebook">'+ICON_FACEBOOK+'</a>';
      html += '</div>';
    }

    html += '</div>';
    panel.innerHTML = html;
    panel.querySelector('.sg-comarca-volver').addEventListener('click', resetVista);
  }

  function resetVista() {
    panel.innerHTML =
      '<div class="sg-panel-inicial">' +
      '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.828 0l-4.244-4.243a8 8 0 1 1 11.315 0Z" stroke="currentColor" stroke-width="1.5"/>' +
      '</svg>' +
      '<h3>Escolle a túa comarca</h3>' +
      '<p>Selecciona unha comarca no mapa para ver o seu equipo, sede e información de contacto.</p>' +
      '</div>';
    if (capaComarcas) capaComarcas.eachLayer(function(l){ capaComarcas.resetStyle(l); });
    if (mapa && capaComarcas) mapa.fitBounds(capaComarcas.getBounds(), { padding: [20,20] });
  }

  function estilo(feature) {
    return { color: '#1a1a1a', weight: 1, opacity: 1, fillColor: colorDe(feature.properties.comarca_id), fillOpacity: .55 };
  }
  function estiloHover(feature) {
    return { color: '#1a1a1a', weight: 2, fillColor: colorDe(feature.properties.comarca_id), fillOpacity: .8 };
  }

  function init(comarcasGJ, municipiosGJ) {
    mapa = L.map('sg-mapa', { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([42.75, -8.0], 8);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd', maxZoom: 18
    }).addTo(mapa);

    if (municipiosGJ) {
      L.geoJSON(municipiosGJ, { style: { color: '#777', weight: .4, fillOpacity: 0, opacity: .5 }, interactive: false }).addTo(mapa);
    }

    capaComarcas = L.geoJSON(comarcasGJ, {
      style: estilo,
      onEachFeature: function(feature, layer) {
        var p = feature.properties;
        var nombre = (datosComarca[p.comarca_id] && datosComarca[p.comarca_id].nombre) || p.comarca;
        layer.bindTooltip(nombre, { sticky: true, direction: 'top', className: 'sg-tooltip-comarca' });
        layer.on({
          mouseover: function(e) { e.target.setStyle(estiloHover(feature)); e.target.bringToFront(); },
          mouseout: function(e) { capaComarcas.resetStyle(e.target); },
          click: function(e) { pintarPanel(p); mapa.fitBounds(e.target.getBounds(), { padding: [20,20] }); }
        });
      }
    }).addTo(mapa);

    mapa.fitBounds(capaComarcas.getBounds(), { padding: [20,20] });
    setTimeout(function(){ mapa.invalidateSize(); }, 100);
  }

  function cargarDatos(csvText) {
    if (!csvText) return;
    var parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    parsed.data.forEach(function(row) {
      if (row.comarca_id) datosComarca[String(row.comarca_id).trim()] = row;
    });
  }

  function go() {
    if (!document.getElementById('sg-mapa')) return;
    var P = [
      fetch(URL_COMARCAS).then(function(r){ if(!r.ok) throw new Error('comarcas '+r.status); return r.json(); }),
      fetch(URL_MUNICIPIOS).then(function(r){ if(!r.ok) throw new Error('municipios '+r.status); return r.json(); }).catch(function(){ return null; }),
      fetch(URL_DATOS_CSV).then(function(r){ if(!r.ok) throw new Error('csv '+r.status); return r.text(); }).catch(function(e){ console.warn('Datos non dispoñibles:', e); return ''; })
    ];
    Promise.all(P).then(function(arr) {
      cargarDatos(arr[2]);
      init(arr[0], arr[1]);
    }).catch(function(err) {
      console.error(err);
      mostrarError('Non foi posible cargar o mapa. Comproba as URLs no script.');
    });
  }

  if (typeof L === 'undefined' || typeof Papa === 'undefined') {
    var iv = setInterval(function() {
      if (typeof L !== 'undefined' && typeof Papa !== 'undefined') { clearInterval(iv); go(); }
    }, 50);
  } else { go(); }
})();
