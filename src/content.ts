function addCopyButtons(): void {
  const entries = document.querySelectorAll(
    ".def.ddef_d, .trans.dtrans, .dx-h.dthesButton, .synonym"
  );

  entries.forEach((entry) => {
    const el = entry as HTMLElement;

    if (el.getAttribute("data-copy-button-injected") === "true") return;

    const button = document.createElement("button");
    button.textContent = "📋";
    button.className = "copy-button";
    button.style.marginLeft = "8px";
    button.style.cursor = "pointer";
    button.style.border = "none";
    button.style.background = "none";
    button.style.fontSize = "1em";

    button.addEventListener("click", (e) => {
      e.preventDefault();

      // Clone the node, remove the button, then copy the cleaned text
      const clone = el.cloneNode(true) as HTMLElement;
      const btnInClone = clone.querySelector(".copy-button");
      if (btnInClone) btnInClone.remove();

      const cleanText = clone.textContent?.trim() || "";
      navigator.clipboard.writeText(cleanText);

      button.textContent = "✅";
      setTimeout(() => (button.textContent = "📋"), 1500);
    });

    el.appendChild(button);
    el.setAttribute("data-copy-button-injected", "true");
  });
}


// Initial run
addCopyButtons();

// Watch for changes
const observer = new MutationObserver(() => {
  addCopyButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
