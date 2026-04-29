// archive.js — Shared form archive utilities for meridmail.
// Each form includes this script, then runs `EpArchive.attach()` to wire up
// auto-restore (via ?archive=<id> URL param) and the Save-to-Archive button
// (which must have id="saveArchiveBtn" on the page).
(function() {
  'use strict';

  var STORAGE_KEY = 'ep_form_archive';

  // --- Per-form configuration -----------------------------------------------
  // Keyed by the form's HTML filename. Each entry tells the archive how to
  // serialize, label, and restore the form.
  var FORMS = {
    'meridian-commercial-lines.html': {
      form_id: 'clForm',
      form_label: 'Commercial Spec Sheet',
      label_field: 'client_name',
      // Re-fire toggles after restore so "Other" inputs get shown.
      after_restore: function() {
        try { toggleCarrierOther('carrier','carrier_other'); } catch(e){}
        try { togglePolicyTypeOther(); } catch(e){}
      }
    },
    'meridian-personal-lines.html': {
      form_id: 'plForm',
      form_label: 'Personal Spec Sheet',
      label_field: 'client_name',
      after_restore: function() {
        try { toggleCarrierOther('carrier','carrier_other'); } catch(e){}
        try { togglePolicyTypeOther(); } catch(e){}
      }
    },
    'meridian-payment-receipt.html': {
      form_id: 'prForm',
      form_label: 'Payment Receipt',
      label_field: 'client',
      after_restore: function() {
        try { toggleCarrierOther('top_carrier','top_carrier_other'); } catch(e){}
        try { toggleCarrierOther('carrier','carrier_other'); } catch(e){}
        try { togglePolicyTypeOther(); } catch(e){}
        // Recompute totals after restore.
        try {
          var btn = document.querySelector('[name="billing_type"]');
          if (btn) btn.dispatchEvent(new Event('change'));
        } catch(e){}
      }
    },
    'meridian-policy-change.html': {
      form_id: 'pcForm',
      form_label: 'Policy Change',
      label_field: 'insured',
      after_restore: function() {
        try { toggleCarrierOther('carrier','carrier_other'); } catch(e){}
        try { togglePolicyTypeOther(); } catch(e){}
      }
    },
    'acord-125.html': {
      form_id: 'a125Form',
      form_label: 'ACORD 125',
      label_field: 'ni_name'
    },
    'acord-126.html': {
      form_id: 'a126Form',
      form_label: 'ACORD 126',
      label_field: 'applicant'
    },
    'acord-25.html': {
      form_id: 'a25Form',
      form_label: 'ACORD 25',
      label_field: 'insured_name'
    },
    'wc-blanket-waiver.html': {
      form_id: 'wcbForm',
      form_label: 'WC Blanket Waiver',
      label_field: 'named_insured'
    },
    'wc-scheduled-waiver.html': {
      form_id: 'wcsForm',
      form_label: 'WC Scheduled Waiver',
      label_field: 'named_insured'
    }
  };

  // --- Storage helpers ------------------------------------------------------
  function getAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  }
  function setAll(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    catch(e) { console.error('archive write failed', e); }
  }
  function uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  // --- Form (de)serialization ----------------------------------------------
  function serializeForm(formEl) {
    var snap = {};
    if (!formEl) return snap;
    Array.from(formEl.elements).forEach(function(el) {
      if (!el.name) return;
      var t = el.type;
      if (t === 'submit' || t === 'button' || t === 'reset' || t === 'file') return;
      if (t === 'checkbox' || t === 'radio') {
        snap[el.name + '::' + el.value] = el.checked;
      } else {
        snap[el.name] = el.value;
      }
    });
    return snap;
  }

  function restoreForm(formEl, fields) {
    if (!formEl || !fields) return;
    Object.keys(fields).forEach(function(key) {
      var v = fields[key];
      var idx = key.indexOf('::');
      if (idx > -1) {
        var n = key.slice(0, idx), val = key.slice(idx+2);
        var el = formEl.querySelector('[name="'+n+'"][value="'+CSS.escape(val)+'"]');
        if (el) el.checked = !!v;
      } else {
        var el2 = formEl.querySelector('[name="'+key+'"]');
        if (!el2) return;
        if (el2.tagName === 'SELECT') {
          el2.value = v;
        } else {
          el2.value = v;
        }
      }
    });
  }

  // --- CRUD -----------------------------------------------------------------
  function save(item) {
    var all = getAll();
    var entry = {
      id: uid(),
      form_url: item.form_url || '',
      form_label: item.form_label || '',
      label: item.label || 'Untitled',
      saved_at: new Date().toISOString(),
      fields: item.fields || {}
    };
    all.push(entry);
    setAll(all);
    return entry;
  }

  function update(id, item) {
    var all = getAll();
    var idx = all.findIndex(function(x) { return x.id === id; });
    if (idx === -1) return null;
    var entry = all[idx];
    if (item.label !== undefined) entry.label = item.label;
    if (item.fields !== undefined) entry.fields = item.fields;
    entry.saved_at = new Date().toISOString();
    all[idx] = entry;
    setAll(all);
    return entry;
  }

  function get(id) { return getAll().find(function(x) { return x.id === id; }) || null; }
  function remove(id) { setAll(getAll().filter(function(x) { return x.id !== id; })); }
  function list() {
    return getAll().slice().sort(function(a, b) {
      return (b.saved_at || '').localeCompare(a.saved_at || '');
    });
  }

  // --- URL helpers ----------------------------------------------------------
  function currentFormFile() {
    var path = window.location.pathname.split('/').pop();
    return path || '';
  }
  function archiveIdFromUrl() {
    var m = window.location.search.match(/[?&]archive=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  // --- Auto-attach: restore + wire Save button -----------------------------
  function attach() {
    var fileName = currentFormFile();
    var cfg = FORMS[fileName];
    if (!cfg) return; // not a known form page

    var formEl = document.getElementById(cfg.form_id);
    if (!formEl) return;

    // 1. Restore from ?archive=<id> URL param if present.
    var aid = archiveIdFromUrl();
    if (aid) {
      var entry = get(aid);
      if (entry && entry.fields) {
        restoreForm(formEl, entry.fields);
        if (typeof cfg.after_restore === 'function') {
          try { cfg.after_restore(); } catch(e){}
        }
        // Show a small banner so the user knows they're editing a saved form.
        showRestoredBanner(entry, cfg);
      }
    }

    // 2. Wire the Save button (any element with id="saveArchiveBtn").
    var btn = document.getElementById('saveArchiveBtn');
    if (btn) {
      btn.addEventListener('click', function() {
        handleSaveClick(formEl, cfg);
      });
    }
  }

  function showRestoredBanner(entry, cfg) {
    var bar = document.createElement('div');
    bar.style.cssText = 'position:sticky;top:0;z-index:50;background:#e8edf3;border-bottom:1px solid #2c4a6e;color:#2c4a6e;padding:8px 16px;font-size:13px;display:flex;align-items:center;gap:10px;';
    var lbl = document.createElement('span');
    lbl.innerHTML = 'Editing archived form: <b>' + escapeHtml(entry.label) + '</b>' +
                    '<span style="color:#555;margin-left:8px;">(' + entry.form_label + ' \u2022 saved ' + new Date(entry.saved_at).toLocaleString() + ')</span>';
    var spacer = document.createElement('span'); spacer.style.flex = '1';
    var newLink = document.createElement('a');
    newLink.href = window.location.pathname;
    newLink.textContent = 'Start a new form';
    newLink.style.color = '#2c4a6e';
    bar.appendChild(lbl);
    bar.appendChild(spacer);
    bar.appendChild(newLink);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function handleSaveClick(formEl, cfg) {
    var fields = serializeForm(formEl);
    var labelEl = formEl.querySelector('[name="'+cfg.label_field+'"]');
    var defaultLabel = (labelEl && labelEl.value && labelEl.value.trim())
                       || (cfg.form_label + ' \u2014 ' + new Date().toLocaleDateString());
    var aid = archiveIdFromUrl();
    var existing = aid ? get(aid) : null;
    var promptDefault = existing ? existing.label : defaultLabel;
    var label = window.prompt('Save as:', promptDefault);
    if (label === null) return;
    label = label.trim() || defaultLabel;

    if (existing) {
      update(aid, { label: label, fields: fields });
      flash('Updated archived form: ' + label);
    } else {
      var entry = save({
        form_url: currentFormFile(),
        form_label: cfg.form_label,
        label: label,
        fields: fields
      });
      // Update URL so subsequent saves overwrite this entry rather than
      // creating a new one each time.
      var newUrl = window.location.pathname + '?archive=' + entry.id;
      try { window.history.replaceState({}, '', newUrl); } catch(e){}
      flash('Saved to archive: ' + label);
    }
  }

  function flash(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2c4a6e;color:#fff;padding:10px 18px;border-radius:6px;font-size:14px;z-index:1000;box-shadow:0 4px 14px rgba(0,0,0,0.18);';
    document.body.appendChild(t);
    setTimeout(function() { t.style.transition = 'opacity 0.4s'; t.style.opacity = '0'; }, 1800);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2400);
  }

  // --- Public API -----------------------------------------------------------
  window.EpArchive = {
    serializeForm: serializeForm,
    restoreForm: restoreForm,
    save: save,
    update: update,
    get: get,
    delete: remove,
    list: list,
    attach: attach,
    flash: flash,
    formConfigs: FORMS
  };

  // Auto-attach on DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
