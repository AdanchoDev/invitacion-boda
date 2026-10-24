/* Genera enlaces personalizados: index.html?invitado=...&pases=... */
(function () {
  "use strict";

  const C = window.INVITACION || {};
  const $ = (sel) => document.querySelector(sel);
  const form = $("#gen-form");
  const result = $("#gen-result");
  const linkInput = $("#g-link");
  const msgInput = $("#g-msg");
  const waBtn = $("#g-wa");
  const toastEl = $("#toast");
  let phone = "";

  const baseUrl = () => {
    const publica = String(C.generador?.urlPublica || "").trim();
    return publica ? new URL(publica) : new URL("index.html", location.href);
  };

  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    setTimeout(() => toastEl.classList.remove("is-show"), 2400);
  };

  const updateWhatsApp = () => {
    waBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(msgInput.value)}`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = form.elements.nombre.value.trim();
    const error = $("#g-e-nombre");
    error.hidden = Boolean(nombre);
    form.elements.nombre.toggleAttribute("aria-invalid", !nombre);
    if (!nombre) {
      form.elements.nombre.focus();
      return;
    }

    const pases = Math.max(1, Math.min(20, parseInt(form.elements.pases.value, 10) || 1));
    const digits = form.elements.telefono.value.replace(/\D/g, "");
    phone = digits.length === 10 ? `${C.generador?.codigoPais || "52"}${digits}` : digits;

    const url = baseUrl();
    url.searchParams.set("invitado", nombre);
    url.searchParams.set("pases", String(pases));

    const varios = pases > 1;
    const [n1, n2] = C.novios?.nombres || [];
    const novios = n1 && n2 ? `${n1} y ${n2}` : "";
    linkInput.value = url.toString();
    msgInput.value =
      `¡Hola, ${nombre}! Con mucha ilusión ${varios ? "les" : "te"} compartimos nuestra invitación de boda. ` +
      `${varios ? "Ábranla" : "Ábrela"} aquí:\n${url}\n\nCon cariño, ${novios}`;

    updateWhatsApp();
    $("#g-open").href = url.toString();
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  msgInput.addEventListener("input", updateWhatsApp);

  $("#g-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(linkInput.value);
      toast("Enlace copiado");
    } catch {
      linkInput.select();
      toast("Selecciona el enlace y cópialo");
    }
  });
})();
