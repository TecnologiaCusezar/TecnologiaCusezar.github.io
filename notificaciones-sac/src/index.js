/* Cusezar S.A. Copyright */
let clnb = (n) =>
  (n.includes(",") ? n.replace(/[,]/g, "+") : n.replace(/[.]/g, "+"))
    .replace(/[^0-9+]/g, "")
    .replace(/[\+]/g, ".");
let apo = (s, n, v, cb = () => null) => {
  s.appendChild(
    (() => {
      let o = document.createElement("option");
      (o.text = n), (o.value = v);
      cb(s);
      return o;
    })()
  );
};
let f = async (a, cb, p = null) =>
  fetch(
    document.querySelector('meta[name="send-endpoint"]').content,
    await (async () => ({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: ((a) => {
          switch (a) {
            case "c":
              return "consulta_proyecto";
            case "r":
              return "registro_informacion";
          }
        })(a),
        params: tf(p) ? await p() : p,
      }),
    }))()
  )
    .then((r) => r.json())
    .then((d) => cb(d))
    .catch((e) => location.reload());
let clo = (s, m) => {
  let i,
    ops = s.options.length - 1;
  for (i = ops; i >= 0; i--) {
    s.remove(i);
  }
  apo(s, m);
};
let tf = (f) => typeof f == "function";
let frm = document.getElementById("form"),
  m = document.getElementById("macroproyecto"),
  wm = document.getElementById("waiting-macroproyecto"),
  p = document.getElementById("proyecto"),
  wp = document.getElementById("waiting-proyecto"),
  u = document.getElementById("unidad"),
  wu = document.getElementById("waiting-unidad"),
  v_id = document.getElementById("venta"),
  p_p = document.getElementById("plan-de-pagos"),
  wp_p = document.getElementById("waiting-plan-de-pagos"),
  rc = document.getElementById("rest-content");
f("c", (d) => {
  clo(m, "Seleccione un proyecto...");
  d.results.forEach((o) =>
    apo(m, o.Name, o.Id, (m) => m.parentElement.classList.remove("d-none"))
  );
  wm.parentElement.classList.add("d-none");
});
m.onchange = () => {
  wp.parentElement.classList.remove("d-none");
  f(
    "c",
    (d) => {
      clo(p, "Seleccione una etapa...");
      d.results.forEach((m) =>
        m.Proyectos__r.records.forEach((e) =>
          apo(p, e.Name, e.Id, (p) =>
            p.parentElement.classList.remove("d-none")
          )
        )
      );
      wp.parentElement.classList.add("d-none");
    },
    [{ name: "macroproyecto", value: m.value }]
  );
};
p.onchange = () => {
  wu.parentElement.classList.remove("d-none");
  f(
    "c",
    (d) => {
      clo(u, "Seleccione una unidad...");
      d.results.forEach((p) =>
        p.Agrupaciones__r.records.forEach((a) =>
          apo(u, a.Name, a.Id, (u) =>
            u.parentElement.classList.remove("d-none")
          )
        )
      );
      wu.parentElement.classList.add("d-none");
    },
    [{ name: "proyecto", value: p.value }]
  );
};
u.onchange = () => {
  wp_p.parentElement.classList.remove("d-none");
  f(
    "c",
    (d) => {
      v_id.value = d?.venta_id;
      clo(p_p, "Seleccione un concepto de pago...");
      apo(p_p, "Sin especificar", "No se ha especificado cuota");
      if (Array.isArray(d.results)) {
        d.results?.forEach((p) => {
          apo(p_p, p.Concepto.replace(/-/g, " "), p.Concepto);
        });
      }
      p_p.parentElement.classList.remove("d-none");
      apo(p_p, "Abono extraordinario", "Abono extraordinario");
      wp_p.parentElement.classList.add("d-none");
    },
    [{ name: "unidad", value: u.value }]
  );
};
p_p.onchange = () => rc.classList.remove("d-none");
let v = document.getElementById("valor");
let cf = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COL" });
v.onchange = (i) => {
  i.target.value =
    "$" +
    parseFloat(
      (() => {
        let n = clnb(i.target.value);
        if (n.length === 0) {
          n = 0;
          alert("Recuerde introducir caracteres numéricos");
        }
        return n;
      })()
    )
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,");
};
let a = document.getElementById("adjuntos"),
  s = document.querySelector("[type=submit]"),
  msg = document.getElementById("message"),
  fmsg = document.getElementById("feedback-message");
frm.onsubmit = async (e) => {
  e.preventDefault();
  frm.style.display = "none";
  msg.classList.add("d-none");
  fmsg.classList.remove("d-none");
  f(
    "r",
    (d) => {
      [...document.getElementsByTagName("form")].forEach((e) => e.remove());
      [...document.getElementsByTagName("script")].forEach((e) => e.remove());
    },
    async () => {
      let prs = {};
      for (const e of frm.querySelectorAll("[name]")) {
        prs[e.name] = await (async (e) => {
          let v = "";
          if (e.type === "file") {
            v = await Promise.all(
              [...e.files].map(
                (f) =>
                  new Promise((ps, rj) => {
                    try {
                      let r = new FileReader();
                      r.onload = () =>
                        ps({ name: f.name, content: r.result.split(",")[1] });
                      r.readAsDataURL(f);
                    } catch (err) {
                      rj(err);
                    }
                  })
              )
            );
          } else {
            v =
              e.name === "valor"
                ? parseFloat(clnb(e.value.replace(/[^0-9.]/g, ""))).toFixed(2)
                : e.name == "titular"
                ? parseInt(e.value) == 1
                  ? 1
                  : 0
                : e.value;
          }
          return v;
        })(e);
      }
      return [{ name: "payload", value: prs }];
    }
  );
};
