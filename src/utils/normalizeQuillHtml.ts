export function normalizeQuillHtml(rawHtml: string | null | undefined): string {
  if (!rawHtml) return '';

  // Guard untuk SSR/non-browser
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return String(rawHtml);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  const qlEditor = doc.querySelector<HTMLElement>('.ql-editor');
  const root: ParentNode = qlEditor ?? doc.body;

  // Hapus elemen UI Quill
  root.querySelectorAll('.ql-tooltip, .ql-clipboard, .ql-ui').forEach((el) => el.remove());

  // Hapus atribut residu
  root
    .querySelectorAll<HTMLElement>('[contenteditable]')
    .forEach((el) => el.removeAttribute('contenteditable'));
  root
    .querySelectorAll<HTMLElement>('[data-list]')
    .forEach((el) => el.removeAttribute('data-list'));

  // Unwrap .ql-editor
  if (qlEditor) {
    const frag = doc.createDocumentFragment();
    while (qlEditor.firstChild) frag.appendChild(qlEditor.firstChild);
    qlEditor.replaceWith(frag);
  }

  // Perbaiki kasus OL tapi isinya bullet → ganti ke UL
  doc.querySelectorAll('ol').forEach((ol) => {
    const lis = Array.from(ol.querySelectorAll('li'));
    const isBullets = lis.some((li) => li.getAttribute('data-list') === 'bullet');
    if (isBullets) {
      const ul = doc.createElement('ul');
      lis.forEach((li) => ul.appendChild(li));
      ol.replaceWith(ul);
    }
  });

  // Bersihkan class ql-*
  root.querySelectorAll<HTMLElement>('[class]').forEach((el) => {
    const kept = el.className.split(/\s+/).filter((c) => c && !/^ql-/.test(c));
    if (kept.length) el.className = kept.join(' ');
    else el.removeAttribute('class');
  });

  // Ambil inner HTML final
  const container = qlEditor ? doc.body : (root as HTMLElement);
  return container.innerHTML.trim();
}
export default normalizeQuillHtml;