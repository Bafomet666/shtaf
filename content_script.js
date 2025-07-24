// Загружаем оба списка
Promise.all([
  fetch(browser.runtime.getURL('badlist.txt')).then(r => r.text()),
  fetch(browser.runtime.getURL('badwords.txt')).then(r => r.text())
]).then(([badSitesText, badWordsText]) => {
  const badSites = badSitesText
    .split('\n')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const badPhrases = badWordsText
    .split('\n')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  function isBadSite(url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return badSites.some(site => hostname.includes(site));
    } catch (e) {
      return false;
    }
  }

  function findBadPhrase(text) {
    const lower = text.toLowerCase();
    return badPhrases.find(phrase => phrase.length > 0 && lower.includes(phrase));
  }

  function markElement(el, reason) {
    el.style.border = "2px solid red";
    el.style.backgroundColor = "#ffe6e6";
    el.title = "🚫 " + reason;
    el.addEventListener('click', e => {
      e.preventDefault();
      alert('❌ Переход заблокирован!\n' + reason);
    });
  }

  function processResults() {
    document.querySelectorAll('a').forEach(link => {
      const url = link.href;
      const text = link.innerText || "";

      if (isBadSite(url)) {
        markElement(link, "Домен из запрещённого списка");
        return;
      }

      const foundPhrase = findBadPhrase(text);
      if (foundPhrase) {
        markElement(link, "Найдена запрещённая фраза: " + foundPhrase);
      }
    });

    // (необязательно) можно подсвечивать и описания
    document.querySelectorAll('span, div').forEach(block => {
      const foundPhrase = findBadPhrase(block.innerText || "");
      if (foundPhrase) {
        block.style.border = "2px solid red";
        block.style.backgroundColor = "#ffe6e6";
        block.title = "🚫 Найдена запрещённая фраза: " + foundPhrase;
      }
    });
  }

  const observer = new MutationObserver(processResults);
  observer.observe(document.body, { childList: true, subtree: true });

  processResults();
});
