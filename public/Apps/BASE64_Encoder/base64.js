// BASE64 编解码与图片编解码逻辑（纯前端）
document.addEventListener('DOMContentLoaded', () => {
  // 切换 页签
  const tabs = document.querySelectorAll('.页签按钮');
  const panels = document.querySelectorAll('.面板');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.querySelector(`.面板[data-panel="${btn.dataset.tab}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  // 文本区元素
  const textInput = document.getElementById('text-input');
  const textOutput = document.getElementById('text-output');
  const urlsafe = document.getElementById('urlsafe');
  const textMeta = document.getElementById('text-meta');

  // 文本操作
  document.getElementById('text-clear').addEventListener('click', () => {
    textInput.value = '';
    textOutput.value = '';
    textMeta.textContent = '';
  });
  document.getElementById('text-paste').addEventListener('click', async () => {
    try {
      const txt = await navigator.clipboard.readText();
      textInput.value = txt;
    } catch {}
  });

  function utf8ToBase64(str) {
    const enc = new TextEncoder().encode(str);
    let binary = '';
    enc.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }
  function base64ToUtf8(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
    return new TextDecoder().decode(bytes);
  }
  function toUrlSafe(b64) {
    return b64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }
  function fromUrlSafe(b64) {
    let s = b64.replaceAll('-', '+').replaceAll('_', '/');
    const pad = s.length % 4;
    if (pad) s += '='.repeat(4 - pad);
    return s;
  }

  function setTextMeta(src, out) {
    const srcBytes = new TextEncoder().encode(src).length;
    const outBytes = out.length;
    textMeta.textContent = `输入: ${srcBytes} B · 输出: ${outBytes} 字符`;
  }

  // 通用下载
  function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  document.getElementById('encode-text').addEventListener('click', () => {
    try {
      const src = textInput.value || '';
      let b64 = utf8ToBase64(src);
      if (urlsafe.checked) b64 = toUrlSafe(b64);
      textOutput.value = b64;
      setTextMeta(src, b64);
    } catch (e) {
      alert('编码失败：' + e.message);
    }
  });
  document.getElementById('decode-text').addEventListener('click', () => {
    try {
      let s = textInput.value || '';
      if (urlsafe.checked) s = fromUrlSafe(s);
      const txt = base64ToUtf8(s);
      textOutput.value = txt;
      setTextMeta(s, txt);
    } catch (e) {
      alert('解码失败：请确认是否为有效的 Base64 字符串');
    }
  });
  document.getElementById('text-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(textOutput.value || ''); } catch {}
  });
  document.getElementById('text-download').addEventListener('click', () => {
    const blob = new Blob([textOutput.value || ''], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'base64-result.txt');
  });

  // 图片相关
  const dropzone = document.getElementById('img-dropzone');
  const fileInput = document.getElementById('img-file');
  const browseBtn = document.getElementById('img-browse');
  const previewImg = document.getElementById('img-preview-img');
  const imgOutput = document.getElementById('img-output');
  const imgMeta = document.getElementById('img-meta');

  function setImgMeta(file, b64) {
    const sizeKB = file ? (file.size / 1024).toFixed(1) + ' KB' : '-';
    const outKB = b64 ? (b64.length / 1024).toFixed(1) + ' KB' : '-';
    const type = file ? file.type : '-';
    imgMeta.textContent = `类型: ${type} · 原始: ${sizeKB} · Base64长度: ${outKB}`;
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function dataURLtoBlob(dataurl) {
    const [meta, content] = dataurl.split(',');
    const mime = meta.match(/data:(.*?);base64/)[1];
    const bin = atob(content);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function handleFiles(files) {
    if (!files || !files.length) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
    readFileAsDataURL(file).then(url => {
      previewImg.src = url;
      setImgMeta(file, '');
    }).catch(() => alert('读取文件失败'));
  }

  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => handleFiles(e.target.files));

  ;['dragenter','dragover'].forEach(ev => dropzone.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation(); dropzone.classList.add('dragover');
  }));
  ;['dragleave','drop'].forEach(ev => dropzone.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('dragover');
  }));
  dropzone.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
  dropzone.addEventListener('paste', e => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const it of items) {
      if (it.type.startsWith('image/')) {
        const file = it.getAsFile();
        handleFiles([file]);
        break;
      }
    }
  });

  document.getElementById('img-clear').addEventListener('click', () => {
    previewImg.removeAttribute('src');
    imgOutput.value = '';
    imgMeta.textContent = '';
    fileInput.value = '';
  });

  document.getElementById('encode-image').addEventListener('click', () => {
    if (!previewImg.src) { alert('请先选择或粘贴图片'); return; }
    const dataUrl = previewImg.src;
    imgOutput.value = dataUrl;
    const fakeFile = { size: Math.ceil((dataUrl.length * 3) / 4), type: dataUrl.match(/^data:(.*?);/)?.[1] || '-' };
    setImgMeta(fakeFile, dataUrl);
  });

  document.getElementById('img-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(imgOutput.value || ''); } catch {}
  });
  document.getElementById('img-paste').addEventListener('click', async () => {
    try {
      const txt = await navigator.clipboard.readText();
      imgOutput.value = txt.trim();
    } catch {}
  });
  document.getElementById('img-download').addEventListener('click', () => {
    const blob = new Blob([imgOutput.value || ''], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'image-base64.txt');
  });

  document.getElementById('decode-image').addEventListener('click', () => {
    const dataUrl = imgOutput.value.trim();
    if (!/^data:image\/.+;base64,/.test(dataUrl)) { alert('请输入合法的 data:image/...;base64,... 字符串'); return; }
    try {
      const blob = dataURLtoBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      previewImg.src = url;
      setImgMeta({ size: blob.size, type: blob.type }, dataUrl);
    } catch { alert('解码失败，请检查输入'); }
  });

  document.getElementById('download-image').addEventListener('click', () => {
    const source = (imgOutput.value && imgOutput.value.trim()) || previewImg.src;
    if (!source) { alert('没有可下载的图片'); return; }
    // 若是 dataURL，转 Blob；若是 objectURL/网络地址，直接下载（可能需跨域许可）
    if (/^data:image\//.test(source)) {
      const blob = dataURLtoBlob(source);
      const mime = blob.type || 'image/png';
      const ext = (mime.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '').toLowerCase();
      downloadBlob(blob, `image-from-base64.${ext}`);
    } else {
      // 直接触发下载（若为 objectURL 可直接用；若为远程URL，是否可下载取决于 CORS）
      triggerDownload(source, 'image-from-preview');
    }
  });
});

