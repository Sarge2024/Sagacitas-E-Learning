/**
 * Utilitários para formatação de texto rico usando Selection API e Range API nativas.
 */

export function applyInlineFormat(format: 'bold' | 'italic' | 'underline') {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    // Caso não haja seleção textual, aplica via execCommand padrão do browser
    document.execCommand(format, false, undefined);
    return;
  }

  const range = selection.getRangeAt(0);
  const tagMap = { bold: 'strong', italic: 'em', underline: 'u' } as const;
  const tag = tagMap[format];

  // Verifica se o ancestral comum ou algum pai dele é a tag de formatação desejada
  let node: Node | null = range.commonAncestorContainer;
  let existingTagNode: HTMLElement | null = null;

  while (node && node !== document.body && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    if (node.nodeName.toLowerCase() === tag) {
      existingTagNode = node as HTMLElement;
      break;
    }
    node = node.parentNode;
  }

  if (existingTagNode) {
    // Se a formatação já existe, remove a tag (unwrap)
    const parent = existingTagNode.parentNode;
    if (parent) {
      while (existingTagNode.firstChild) {
        parent.insertBefore(existingTagNode.firstChild, existingTagNode);
      }
      parent.removeChild(existingTagNode);
    }
  } else {
    // Se não existe, envolve a seleção na tag correspondente
    const wrapper = document.createElement(tag);
    try {
      range.surroundContents(wrapper);
    } catch (e) {
      // Se a seleção cruzar múltiplos nós/tags (seleções complexas),
      // o surroundContents falhará. Usamos execCommand como fallback estável.
      document.execCommand(format, false, undefined);
    }
  }
}

export function applyLink(url: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);

  let node: Node | null = range.commonAncestorContainer;
  let existingLink: HTMLAnchorElement | null = null;

  while (node && node !== document.body && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    if (node.nodeName.toLowerCase() === 'a') {
      existingLink = node as HTMLAnchorElement;
      break;
    }
    node = node.parentNode;
  }

  if (existingLink) {
    if (!url) {
      // Se a URL for vazia, remove o link (unwrap)
      const parent = existingLink.parentNode;
      if (parent) {
        while (existingLink.firstChild) {
          parent.insertBefore(existingLink.firstChild, existingLink);
        }
        parent.removeChild(existingLink);
      }
    } else {
      existingLink.href = url;
    }
  } else if (url) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'underline text-[#2fd9f4] hover:text-[#0a6ed1] transition-colors';
    try {
      range.surroundContents(a);
    } catch (e) {
      document.execCommand('createLink', false, url);
    }
  }
}

export function applyList(type: 'bullet' | 'ordered') {
  const command = type === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList';
  document.execCommand(command, false, undefined);
}
