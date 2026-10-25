/* =============================================================
   Invitación de boda
   Pinta el contenido de config.js y maneja el sobre, la cuenta
   regresiva, el calendario, el pase digital, la confirmación y
   los accesos rápidos.
   ============================================================= */
(function () {
  "use strict";

  const C = window.INVITACION;
  const O = window.Ornamentos;
  if (!C || !O) {
    console.error("Faltan js/config.js o js/ornamentos.js");
    return;
  }

  /* ---------- Utilidades ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const enc = encodeURIComponent;
  const list = (v) => (Array.isArray(v) ? v : []);
  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const slug = (s) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Memoria en este teléfono (si el navegador no la permite, todo sigue funcionando).
  const store = {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    },
  };

  /* ---------- Fechas ---------- */
  const inicio = new Date(C.fecha);
  const fin = new Date(C.fechaFin || C.fecha);
  const partsOf = (opts) =>
    Object.fromEntries(
      new Intl.DateTimeFormat("es-MX", { timeZone: C.zonaHoraria, ...opts })
        .formatToParts(inicio)
        .map((p) => [p.type, p.value])
    );
  const larga = partsOf({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const corta = partsOf({ day: "2-digit", month: "2-digit", year: "numeric" });

  const [nombre1, nombre2] = C.novios.nombres || [C.novios.ella, C.novios.el];
  const pareja = `${nombre1} y ${nombre2}`;

  const derived = {
    nombre1,
    nombre2,
    nombres: `${nombre1} & ${nombre2}`,
    fechaLarga: `${cap(larga.weekday)} ${larga.day} de ${larga.month} de ${larga.year}`,
    fechaDia: `${cap(larga.weekday)} ${larga.day} de ${larga.month}`,
    fechaCorta: `${corta.day}.${corta.month}.${corta.year}`,
    // Igual que en los pases impresos: 13/Marzo/2027
    fechaPase: `${larga.day}/${cap(larga.month)}/${larga.year}`,
  };

  /* ---------- Invitado (enlace personalizado) ----------
     index.html?invitado=Familia%20Ríos&pases=4                 */
  const params = new URLSearchParams(location.search);
  const invitado = (params.get("invitado") || "").trim().slice(0, 80);
  const pasesUrl = parseInt(params.get("pases"), 10);
  const tienePases = Number.isInteger(pasesUrl) && pasesUrl > 0;
  const pases = tienePases ? Math.min(pasesUrl, 20) : C.rsvp?.pasesPorDefecto || 2;

  const memoria = `boda:${slug(pareja)}:${slug(invitado || "general")}`;
  const KEY_SOBRE = `${memoria}:sobre`;
  const KEY_RSVP = `${memoria}:respuesta`;

  /* ---------- Secciones apagadas ---------- */
  Object.entries(C.secciones || {}).forEach(([key, visible]) => {
    if (visible === false) $(`[data-section="${key}"]`)?.remove();
  });

  /* ---------- Textos simples ---------- */
  $$("[data-text]").forEach((el) => {
    const key = el.dataset.text;
    const value = key in derived ? derived[key] : get(C, key);
    if (value === undefined || value === null || value === "") {
      if ("optional" in el.dataset) el.remove();
      return;
    }
    el.textContent = value;
  });

  $$("[data-href]").forEach((el) => {
    const url = get(C, el.dataset.href);
    if (url) el.href = url;
    else el.remove();
  });

  const [ini1, ini2] = C.novios.iniciales || [nombre1.charAt(0), nombre2.charAt(0)];
  $$("[data-mono]").forEach((el) => {
    el.innerHTML = `<span>${esc(ini1)}</span><span class="mono-amp">&amp;</span><span>${esc(ini2)}</span>`;
  });

  /* ---------- Ornamentos (corona, ramas y separadores) ---------- */
  const WREATH = O.toSVG(O.wreath(), "wreath__svg");
  const SPRIG = O.toSVG(O.sprig(), "sprig__svg");
  const DIVIDER = O.toSVG(O.divider(), "divider__svg");
  $$("[data-wreath]").forEach((el) => el.insertAdjacentHTML("afterbegin", WREATH));
  $$("[data-sprig]").forEach((el) => (el.innerHTML = SPRIG));

  // Separador de laurel entre secciones seguidas que comparten el mismo fondo.
  const plainSection = (el) => Boolean(el?.matches?.("section.section:not(.rsvp)"));
  $$("main > section").forEach((sec) => {
    if (plainSection(sec) && plainSection(sec.nextElementSibling)) {
      sec.insertAdjacentHTML("afterend", `<div class="divider" data-reveal aria-hidden="true">${DIVIDER}</div>`);
    }
  });

  /* ---------- Fotos ---------- */
  if ((C.fotosEnTono ?? C.fotosEnAzul) !== false) document.documentElement.classList.add("duotone");

  const photo = (src, alt, cls = "", eager = false) =>
    src
      ? `<figure class="photo ${cls}"><img src="${esc(src)}" alt="${esc(alt)}" ${
          eager ? 'fetchpriority="high"' : 'loading="lazy"'
        } decoding="async"></figure>`
      : `<figure class="photo is-empty ${cls}" aria-hidden="true"></figure>`;

  // Si una foto no carga, se muestra el espacio "Tu foto aquí" en lugar de un ícono roto.
  document.addEventListener(
    "error",
    (e) => {
      if (e.target instanceof HTMLImageElement) e.target.closest(".photo")?.classList.add("is-empty");
    },
    true
  );

  /* ---------- Bloques con listas ---------- */
  function render(name, items, template) {
    const el = $(`[data-render="${name}"]`);
    if (!el) return null;
    const data = list(items);
    if (!data.length) {
      (el.closest("[data-hide-empty]") || el.closest("[data-section]") || el).remove();
      return null;
    }
    el.innerHTML = data.map(template).join("");
    return el;
  }

  const heroPhoto = $("#hero-photo");
  if (heroPhoto) heroPhoto.innerHTML = photo(C.portada, derived.nombres, "arch", true);

  render(
    "padres",
    C.mensaje?.padres,
    (g) =>
      `<div class="parents__group" data-reveal><p class="label">${esc(g.titulo)}</p>${list(g.nombres)
        .map((n) => `<p class="parents__name">${esc(n)}</p>`)
        .join("")}</div>`
  );

  render(
    "padrinos",
    C.mensaje?.padrinos,
    (p) => `<li><span class="label">${esc(p.rol)}</span><span>${esc(p.nombres)}</span></li>`
  );

  render(
    "historia",
    C.historia,
    (m) => `
      <li class="moment" data-reveal>
        ${photo(m.foto, m.titulo, "arch moment__photo")}
        <div class="moment__body">
          <span class="moment__year">${esc(m.anio)}</span>
          <h3 class="moment__title">${esc(m.titulo)}</h3>
          <p>${esc(m.texto)}</p>
        </div>
      </li>`
  );

  const program = render(
    "programa",
    C.programa,
    (s, i) => `
      <li class="step" data-reveal style="--i:${i}">
        <span class="step__icon" aria-hidden="true"><i class="ph-light ph-${esc(s.icono || "sparkle")}"></i></span>
        <span class="step__time">${esc(s.hora)}</span>
        <span class="step__name">${esc(s.evento)}</span>
        <span class="step__place">${esc(s.lugar)}</span>
      </li>`
  );
  program?.style.setProperty("--n", list(C.programa).length);

  const mapsUrl = (l) =>
    l.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${enc(`${l.nombre}, ${l.direccion}`)}`;
  const wazeUrl = (l) => l.wazeUrl || `https://waze.com/ul?q=${enc(`${l.nombre} ${l.direccion}`)}&navigate=yes`;

  // Foto del lugar (con el crédito del autor si no es suya) o, si no hay foto,
  // un arco con la corona de laurel y un ícono, para que no quede un hueco.
  const venueVisual = (l) => {
    if (!l.foto) {
      return `<div class="venue__photo venue__ornament arch" aria-hidden="true"><span class="leaves"></span><span class="wreath venue__wreath">${WREATH}<i class="ph-light ph-${esc(l.icono || "heart")}"></i></span></div>`;
    }
    const c = l.credito;
    const credit = c?.texto
      ? `<p class="venue__credit">${
          c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.texto)}</a>` : esc(c.texto)
        }</p>`
      : "";
    const extra = l.fotoExtra ? photo(l.fotoExtra, `${l.nombre}, detalle`, "venue__inset") : "";
    return `<div class="venue__media${extra ? " has-inset" : ""}"><div class="venue__frame">${photo(
      l.foto,
      l.nombre,
      "arch venue__photo"
    )}${extra}</div>${credit}</div>`;
  };

  render(
    "lugares",
    C.lugares,
    (l, i) => `
      <article class="venue" data-reveal style="--i:${i}">
        ${venueVisual(l)}
        <div class="venue__body">
          <p class="label">${esc(l.tipo)}</p>
          <h3 class="venue__name">${esc(l.nombre)}</h3>
          <p class="venue__meta"><i class="ph-light ph-clock" aria-hidden="true"></i>${esc(l.hora)}</p>
          <p class="venue__meta"><i class="ph-light ph-map-pin" aria-hidden="true"></i>${esc(l.direccion)}</p>
          <div class="venue__actions">
            <a class="btn btn--primary btn--sm" href="${esc(mapsUrl(l))}" target="_blank" rel="noopener">
              <i class="ph-light ph-map-trifold" aria-hidden="true"></i>Google Maps
            </a>
            <a class="btn btn--outline btn--sm" href="${esc(wazeUrl(l))}" target="_blank" rel="noopener">
              <i class="ph-light ph-navigation-arrow" aria-hidden="true"></i>Waze
            </a>
          </div>
        </div>
      </article>`
  );

  const gallery = render("galeria", C.galeria, (src, i) => photo(src, `${derived.nombres}, foto ${i + 1}`));
  if (gallery) gallery.dataset.count = list(C.galeria).length;

  render(
    "preguntas",
    C.preguntas,
    (q, i) => `
      <details class="faq__item" data-reveal style="--i:${i}">
        <summary>${esc(q.p)}<i class="ph-light ph-plus" aria-hidden="true"></i></summary>
        <p>${esc(q.r)}</p>
      </details>`
  );

  /* ---------- Avisos ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2600);
  }

  /* ---------- Cuenta regresiva ---------- */
  const cdGrid = $("[data-countdown]");
  if (cdGrid) {
    const slots = $$(".unit", cdGrid).map((u) => ({ num: $("[data-num]", u), label: $("[data-label]", u) }));
    const cdDone = $("[data-countdown-done]");
    const DAY = 864e5;
    let timer = null;

    // ?hoy=2027-02-20 simula otra fecha para ver cómo se verá la cuenta (solo para probar).
    const simulada = params.has("hoy") ? new Date(params.get("hoy")) : null;
    const desfase = simulada && !isNaN(simulada) ? simulada.getTime() - Date.now() : 0;

    // Suma meses de calendario sin pasarse de fin de mes (31 de enero + 1 mes = 28 de febrero).
    const addMonths = (date, n) => {
      const d = new Date(date);
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() + n);
      d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
      return d;
    };

    const unit = (value, one, many, padded) => ({
      value: padded ? pad(value) : String(value),
      label: value === 1 ? one : many,
    });

    const tick = () => {
      const now = Date.now() + desfase;
      const diff = inicio.getTime() - now;
      if (diff <= 0) {
        clearInterval(timer);
        cdGrid.hidden = true;
        cdDone.hidden = false;
        cdDone.textContent = now >= fin.getTime() ? "Gracias por celebrar con nosotros." : "¡Hoy es el gran día!";
        return;
      }

      let parts;
      if (Math.floor(diff / DAY) > 30) {
        // Más de 30 días: meses, días, horas y minutos.
        const from = new Date(now);
        let months = (inicio.getFullYear() - from.getFullYear()) * 12 + (inicio.getMonth() - from.getMonth());
        if (addMonths(from, months) > inicio) months--;
        const rest = inicio.getTime() - addMonths(from, months).getTime();
        parts = [
          unit(months, "mes", "meses", true),
          unit(Math.floor(rest / DAY), "día", "días", true),
          unit(Math.floor(rest / 36e5) % 24, "hora", "horas", true),
          unit(Math.floor(rest / 6e4) % 60, "minuto", "minutos", true),
        ];
      } else {
        // 30 días o menos: días, horas, minutos y segundos.
        parts = [
          unit(Math.floor(diff / DAY), "día", "días", true),
          unit(Math.floor(diff / 36e5) % 24, "hora", "horas", true),
          unit(Math.floor(diff / 6e4) % 60, "minuto", "minutos", true),
          unit(Math.floor(diff / 1e3) % 60, "segundo", "segundos", true),
        ];
      }

      parts.forEach((p, i) => {
        slots[i].num.textContent = p.value;
        slots[i].label.textContent = p.label;
      });
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Agregar al calendario ---------- */
  const lugares = list(C.lugares);
  const utc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const pageUrl = location.href.split(/[?#]/)[0];
  const evTitle = `Boda de ${pareja}`;
  const evLocation = lugares[0] ? `${lugares[0].nombre}, ${lugares[0].direccion}` : C.ciudad;
  const evDetails = [...lugares.map((l) => `${l.tipo}: ${l.nombre}, ${l.hora}. ${l.direccion}`), `Invitación: ${pageUrl}`].join(
    "\n"
  );

  $$('[data-cal="google"]').forEach((a) => {
    a.href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${enc(evTitle)}&dates=${utc(inicio)}/${utc(fin)}` +
      `&details=${enc(evDetails)}&location=${enc(evLocation)}`;
  });

  const icsEscape = (s) => String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
  const icsFold = (line) => (line.length <= 73 ? line : line.match(/.{1,73}/g).join("\r\n "));

  $$('[data-cal="ics"]').forEach((btn) =>
    btn.addEventListener("click", () => {
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Invitacion de boda//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${utc(inicio)}-${slug(`${nombre1}-${nombre2}`)}@invitacion`,
        `DTSTAMP:${utc(new Date())}`,
        `DTSTART:${utc(inicio)}`,
        `DTEND:${utc(fin)}`,
        `SUMMARY:${icsEscape(evTitle)}`,
        `DESCRIPTION:${icsEscape(evDetails)}`,
        `LOCATION:${icsEscape(evLocation)}`,
        "BEGIN:VALARM",
        "TRIGGER:-P1D",
        "ACTION:DISPLAY",
        `DESCRIPTION:${icsEscape(evTitle)}`,
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
      ]
        .map(icsFold)
        .join("\r\n");

      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `boda-${slug(`${nombre1}-${nombre2}`)}.ics`,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast("Listo, ábrelo para guardarlo en tu calendario");
    })
  );

  /* ---------- Accesos rápidos ----------
     Barrita con "Ubicación" y "Confirmar" que aparece al bajar de la
     portada y se esconde cuando ya estás en la confirmación.          */
  const quickNav = (() => {
    const nav = $("#quicknav");
    const noop = { refresh() {}, setAnswer() {} };
    if (!nav) return noop;
    $$("a", nav).forEach((a) => {
      if (!$(a.getAttribute("href"))) a.remove();
    });
    if (!$("a", nav)) {
      nav.remove();
      return noop;
    }

    const rsvpLink = $("[data-quick-rsvp]", nav);
    const state = { pastHero: false, inRsvp: false };
    const refresh = () =>
      nav.classList.toggle(
        "is-visible",
        document.body.classList.contains("is-opened") && state.pastHero && !state.inRsvp
      );

    if ("IntersectionObserver" in window) {
      const hero = $("#inicio");
      if (hero) {
        new IntersectionObserver(
          ([e]) => {
            state.pastHero = e.intersectionRatio < 0.2;
            refresh();
          },
          { threshold: [0, 0.2, 0.5] }
        ).observe(hero);
      }
      const rsvp = $("#confirmar");
      if (rsvp) {
        new IntersectionObserver(
          ([e]) => {
            state.inRsvp = e.isIntersecting && e.intersectionRatio > 0.08;
            refresh();
          },
          { threshold: [0, 0.08, 0.3] }
        ).observe(rsvp);
      }
    }

    // Después de responder, el acceso lleva a "Mi pase" (o a la respuesta).
    const setAnswer = (answer) => {
      if (!rsvpLink) return;
      const passShown = $("#mi-pase") && !$("#mi-pase").hidden;
      const toPass = answer?.asistencia === "si" && passShown;
      rsvpLink.querySelector("span").textContent = toPass ? "Mi pase" : answer ? "Mi respuesta" : "Confirmar";
      rsvpLink.querySelector("i").className = `ph-light ${toPass ? "ph-ticket" : "ph-envelope-simple"}`;
      rsvpLink.setAttribute("href", toPass ? "#mi-pase" : "#confirmar");
    };

    return { refresh, setAnswer };
  })();

  /* ---------- Pase digital (igual que los pases impresos) ----------
     Solo aparece en enlaces personalizados (?pases=N).              */
  const pass = $("[data-pass]");
  const passCard = pass && $(".pass__card", pass);
  const passStamp = pass && $("[data-pass-stamp]", pass);
  const countText = pases === 1 ? "1 persona" : `${pases} personas`;
  const isStamped = () => Boolean(passStamp && !passStamp.hidden);
  let flipPass = () => {};
  let preparePassImage = () => {};

  const passLabel = () =>
    `Tu pase: válido para ${countText}${isStamped() ? ", confirmado" : ""}. Toca para voltearlo.`;

  const setStamp = (on, animate = false) => {
    if (!passStamp) return;
    passStamp.hidden = !on;
    passStamp.classList.toggle("is-stamping", on && animate && !reduceMotion);
    passCard?.setAttribute("aria-label", passLabel());
    preparePassImage();
  };

  if (pass && tienePases) {
    $("[data-pass-count]", pass).textContent = countText;
    const guestEl = $("[data-pass-guest]", pass);
    if (invitado) guestEl.textContent = invitado;
    else guestEl.remove();
    pass.hidden = false;
    passCard.setAttribute("aria-label", passLabel());

    let touched = false;
    flipPass = (on) => {
      passCard.classList.toggle("is-flipped", on);
      passCard.setAttribute("aria-pressed", String(on));
    };
    passCard.addEventListener("click", () => {
      touched = true;
      flipPass(!passCard.classList.contains("is-flipped"));
    });

    // La primera vez que se ve, se voltea solo para mostrar cuántos lugares tiene.
    if ("IntersectionObserver" in window) {
      const passIo = new IntersectionObserver(
        (entries) => {
          if (!entries.some((en) => en.isIntersecting)) return;
          passIo.disconnect();
          setTimeout(() => !touched && flipPass(true), reduceMotion ? 0 : 1100);
        },
        { threshold: 0.6 }
      );
      passIo.observe(passCard);
    }

    /* "Guardar mi pase": imagen con frente y reverso (y el sello si ya confirmó).
       La imagen se prepara antes para que el botón responda al instante. */
    const saveBtn = $("[data-save-pass]", pass);
    if (saveBtn && window.Pase) {
      const fileName = `pase-${slug(pareja)}.png`;
      let passBlob = null;
      let preparing = null;

      preparePassImage = () => {
        passBlob = null;
        preparing = window.Pase.renderPassImage({ guest: invitado, count: pases, confirmed: isStamped() })
          .then((canvas) => new Promise((resolve) => canvas.toBlob(resolve, "image/png")))
          .then((blob) => (passBlob = blob))
          .catch((err) => {
            console.error(err);
            return null;
          });
        return preparing;
      };

      const download = (blob) => {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        toast("Listo, tu pase quedó guardado");
      };

      saveBtn.addEventListener("click", async () => {
        let blob = passBlob;
        if (!blob) {
          saveBtn.setAttribute("aria-busy", "true");
          blob = await (preparing || preparePassImage());
          saveBtn.removeAttribute("aria-busy");
        }
        if (!blob) {
          toast("No se pudo guardar el pase, inténtalo de nuevo");
          return;
        }
        // En el celular se abre el menú de compartir (ahí está "Guardar imagen").
        const file = typeof File === "function" ? new File([blob], fileName, { type: "image/png" }) : null;
        const touch = window.matchMedia("(pointer: coarse)").matches;
        if (touch && file && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "Mi pase" });
            return;
          } catch (err) {
            if (err?.name === "AbortError") return;
          }
        }
        download(blob);
      });

      document.fonts?.ready.then(() => preparePassImage());
    } else {
      saveBtn?.remove();
    }
  } else {
    pass?.remove();
  }

  /* ---------- Confirmación (RSVP) ---------- */
  const form = $("#rsvp-form");
  if (form) {
    const select = form.elements.asistentes;
    const doneBox = $("#rsvp-done");
    const submitBtn = $("[data-submit]", form);
    const status = $("[data-form-status]", form);
    const endpoint = String(C.rsvp?.endpoint || "").trim();
    const whatsapp = String(C.rsvp?.whatsapp || "").replace(/\D/g, "");
    const dia = derived.fechaDia.charAt(0).toLowerCase() + derived.fechaDia.slice(1);

    select.innerHTML = Array.from(
      { length: pases },
      (_, i) => `<option value="${i + 1}">${i + 1} ${i ? "personas" : "persona"}</option>`
    ).join("");
    select.value = String(pases);
    if (invitado) form.elements.nombre.value = invitado;
    if (endpoint) $("[data-form-note]", form).remove();

    const attendingFields = $$("[data-if-attending]", form);
    const setAttending = (yes) =>
      attendingFields.forEach((f) => {
        f.hidden = !yes || (f.dataset.ifAttending === "multi" && pases === 1);
      });

    const setError = (name, on) => {
      $(`#e-${name}`).hidden = !on;
      $$(`[name="${name}"]`, form).forEach((input) =>
        on ? input.setAttribute("aria-invalid", "true") : input.removeAttribute("aria-invalid")
      );
    };

    form.addEventListener("change", (e) => {
      if (e.target.name === "asistencia") {
        setAttending(e.target.value === "si");
        setError("asistencia", false);
      }
    });
    form.addEventListener("input", (e) => {
      if (e.target.name === "nombre" && e.target.value.trim()) setError("nombre", false);
    });

    const buildMessage = (d) => {
      const lines = [];
      if (d.asistencia === "si") {
        lines.push(`¡Hola! Soy ${d.nombre} y confirmo con mucho gusto mi asistencia a la boda de ${pareja}.`);
        lines.push(`Asistentes: ${d.asistentes}`);
        if (d.dieta) lines.push(`Alergias o restricciones: ${d.dieta}`);
        if (d.cancion) lines.push(`Canción para la fiesta: ${d.cancion}`);
      } else {
        lines.push(`¡Hola! Soy ${d.nombre}. Lamentablemente no podré asistir a la boda de ${pareja}.`);
      }
      if (d.mensaje) lines.push(`Mensaje: ${d.mensaje}`);
      if (invitado && invitado !== d.nombre) lines.push(`(Invitación a nombre de: ${invitado})`);
      return lines.join("\n");
    };
    const waUrlFor = (d) => `https://wa.me/${whatsapp}?text=${enc(buildMessage(d))}`;

    // Vuelve a llenar el formulario con una respuesta guardada.
    const prefill = (d) => {
      form.elements.nombre.value = d.nombre || invitado || "";
      const radio = $(`[name="asistencia"][value="${d.asistencia === "si" ? "si" : "no"}"]`, form);
      if (radio) radio.checked = true;
      setAttending(d.asistencia === "si");
      if (d.asistentes) select.value = String(Math.min(Number(d.asistentes) || pases, pases));
      ["dieta", "cancion", "mensaje"].forEach((k) => {
        if (d[k]) form.elements[k].value = d[k];
      });
    };

    const showDone = (d, waUrl, { returning = false, focus = true } = {}) => {
      const si = d.asistencia === "si";
      $("[data-done-title]", doneBox).textContent = si ? `¡Gracias, ${d.nombre}!` : `Gracias por avisarnos, ${d.nombre}`;
      let text;
      if (waUrl && returning) {
        text =
          "Tu respuesta quedó guardada en este teléfono. Si no alcanzaste a enviar el mensaje por WhatsApp, puedes abrirlo de nuevo." +
          (si ? ` Nos vemos el ${dia}.` : "");
      } else if (waUrl) {
        text = si
          ? `Tu confirmación quedó lista en WhatsApp. Solo falta presionar enviar. Nos vemos el ${dia}.`
          : "Tu respuesta quedó lista en WhatsApp. Solo falta presionar enviar. Te vamos a extrañar.";
      } else {
        text = si ? `Recibimos tu confirmación. Nos vemos el ${dia}.` : "Recibimos tu respuesta. Te vamos a extrañar.";
      }
      $("[data-done-text]", doneBox).textContent = text;
      const link = $("[data-done-link]", doneBox);
      link.hidden = !waUrl;
      if (waUrl) link.href = waUrl;
      form.hidden = true;
      doneBox.hidden = false;
      if (focus) doneBox.focus();
    };

    // El pase recibe el sello "Confirmado" y el acceso rápido cambia a "Mi pase".
    const afterAnswer = (d, { animate }) => {
      const si = d.asistencia === "si";
      setStamp(si, animate);
      if (si && animate) flipPass(true);
      quickNav.setAnswer(d);
    };

    $("[data-done-edit]", doneBox).addEventListener("click", () => {
      doneBox.hidden = true;
      form.hidden = false;
      form.elements.nombre.focus();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.hidden = true;

      const d = Object.fromEntries(new FormData(form));
      d.nombre = String(d.nombre || "").trim();
      d.mensaje = String(d.mensaje || "").trim();

      const missingName = !d.nombre;
      const missingChoice = !d.asistencia;
      setError("nombre", missingName);
      setError("asistencia", missingChoice);
      if (missingName || missingChoice) {
        (missingName ? form.elements.nombre : $('[name="asistencia"]', form)).focus();
        return;
      }

      if (d.asistencia === "si") {
        if (pases === 1) d.asistentes = "1";
      } else {
        delete d.asistentes;
        delete d.dieta;
        delete d.cancion;
      }
      if (invitado) d.invitacion = invitado;

      if (endpoint) {
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.querySelector("span").textContent = "Enviando...";
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new URLSearchParams(d),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          store.set(KEY_RSVP, { ...d, via: "endpoint", fecha: Date.now() });
          showDone(d, null);
          afterAnswer(d, { animate: true });
        } catch (err) {
          console.error(err);
          status.textContent = "No pudimos enviar tu respuesta. Revisa tu conexión e inténtalo de nuevo.";
          status.hidden = false;
        } finally {
          submitBtn.removeAttribute("aria-busy");
          submitBtn.querySelector("span").textContent = "Enviar confirmación";
        }
        return;
      }

      const waUrl = waUrlFor(d);
      window.open(waUrl, "_blank", "noopener");
      store.set(KEY_RSVP, { ...d, via: "whatsapp", fecha: Date.now() });
      showDone(d, waUrl);
      afterAnswer(d, { animate: true });
    });

    // Si ya había respondido desde este teléfono, se muestra su respuesta.
    const saved = store.get(KEY_RSVP);
    if (saved && saved.nombre && saved.asistencia) {
      prefill(saved);
      showDone(saved, saved.via === "whatsapp" && !endpoint ? waUrlFor(saved) : null, { returning: true, focus: false });
      afterAnswer(saved, { animate: false });
    }
  }

  /* ---------- Música ---------- */
  const audio = $("#audio");
  const musicBtn = $("#music");
  const musicSrc = C.musica?.src;

  const setMusicState = (on) => {
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", on ? "Pausar música" : "Reproducir música");
    musicBtn.querySelector("i").className = `ph-light ${on ? "ph-speaker-simple-high" : "ph-speaker-simple-slash"}`;
  };
  const playMusic = () => {
    if (!musicSrc) return;
    audio.volume = 0.6;
    audio.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
  };

  if (musicSrc) {
    audio.src = musicSrc;
    musicBtn.hidden = false;
    audio.addEventListener("error", () => (musicBtn.hidden = true));
    musicBtn.addEventListener("click", () => {
      if (audio.paused) playMusic();
      else {
        audio.pause();
        setMusicState(false);
      }
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Sobre de bienvenida ---------- */
  const intro = $("#intro");
  const envelope = $("#envelope");
  const seal = $("#seal");
  const main = $("#contenido");

  // Nombre del invitado escrito sobre el sobre; se achica si es muy largo.
  $$("[data-guest]").forEach((el) => (el.textContent = invitado || "ti"));
  if (invitado) seal.setAttribute("aria-label", `Abrir la invitación para ${invitado}`);
  const guestLine = $(".envelope__guest");
  const fitGuest = () => {
    if (!guestLine || !guestLine.isConnected) return;
    guestLine.style.fontSize = "";
    let size = parseFloat(getComputedStyle(guestLine).fontSize);
    while (guestLine.scrollWidth > guestLine.clientWidth + 1 && size > 11) {
      size -= 1;
      guestLine.style.fontSize = `${size}px`;
    }
  };
  fitGuest();
  document.fonts?.ready.then(fitGuest);
  window.addEventListener("resize", fitGuest);

  const revealPage = () => {
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-opened");
    main.inert = false;
    quickNav.refresh();
  };

  const removeIntro = () => {
    intro.remove();
    window.removeEventListener("resize", fitGuest);
  };

  let opened = false;
  const openInvitation = () => {
    if (opened) return;
    opened = true;
    store.set(KEY_SOBRE, Date.now());
    envelope.classList.add("is-open");
    playMusic(); // el toque en el sello cuenta como interacción, así el navegador permite el audio
    const wait = reduceMotion ? 120 : 1900;
    setTimeout(() => {
      intro.classList.add("is-leaving");
      revealPage();
      main.focus({ preventScroll: true });
    }, wait);
    setTimeout(removeIntro, wait + 1000);
  };

  // El sobre se abre una sola vez por teléfono; al volver se entra directo.
  // ?sinsobre lo salta siempre y ?sobre lo vuelve a mostrar.
  const yaAbierto = Boolean(store.get(KEY_SOBRE));
  if (params.has("sinsobre") || (yaAbierto && !params.has("sobre"))) {
    removeIntro();
    revealPage();
  } else {
    main.inert = true;
    envelope.addEventListener("click", openInvitation);
  }
})();
