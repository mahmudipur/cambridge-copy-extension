function isThesaurusPage(): boolean {
  return window.location.pathname.startsWith("/thesaurus/");
}

function addThesaurusCopyFeatures(): void {
  const groups = document.querySelectorAll(".pr.sense.dsense");

  groups.forEach((group) => {
    const synonyms = group.querySelectorAll(".dx-h.dthesButton.synonym");

    synonyms.forEach((syn) => {
      const synEl = syn as HTMLElement;

      if (synEl.getAttribute("data-enhanced") === "true") return;

      // Create checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.style.marginRight = "6px";

      // Create single copy button
      const copyBtn = document.createElement("button");
      copyBtn.textContent = "📋";
      copyBtn.className = "copy-button";
      copyBtn.style.marginLeft = "6px";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.border = "none";
      copyBtn.style.background = "none";
      copyBtn.style.fontSize = "1em";

      copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(synEl.textContent?.trim() || "");
        copyBtn.textContent = "✅";
        setTimeout(() => (copyBtn.textContent = "📋"), 1500);
      });

      // Insert checkbox before and button after
      synEl.insertBefore(checkbox, synEl.firstChild);
      synEl.appendChild(copyBtn);
      synEl.setAttribute("data-enhanced", "true");
    });

    // Add “Copy All” at the bottom of the group
    if (!group.querySelector(".copy-all-button")) {
      const copyAllBtn = document.createElement("button");
      copyAllBtn.textContent = "📋 Copy All";
      copyAllBtn.className = "copy-all-button";
      copyAllBtn.style.marginTop = "8px";
      copyAllBtn.style.cursor = "pointer";
      copyAllBtn.style.border = "1px solid #ccc";
      copyAllBtn.style.padding = "4px 8px";
      copyAllBtn.style.borderRadius = "4px";
      copyAllBtn.style.fontSize = "0.9em";

      copyAllBtn.addEventListener("click", () => {
        const checkedSynonyms = group.querySelectorAll(
          '.dx-h.dthesButton.synonym input[type="checkbox"]:checked'
        );

        const items = Array.from(checkedSynonyms).map((checkbox) => {
          const synItem = checkbox.parentElement;
          return synItem?.textContent?.replace(/📋|✅/g, "").trim() || "";
        });

        if (items.length > 0) {
          navigator.clipboard.writeText(items.join(", "));
          copyAllBtn.textContent = "✅ Copied!";
          setTimeout(() => (copyAllBtn.textContent = "📋 Copy All"), 1500);
        }
      });

      // Append to group
      const wrapper = document.createElement("div");
      wrapper.style.marginTop = "8px";
      wrapper.appendChild(copyAllBtn);
      group.appendChild(wrapper);
    }
  });
}

function addCopyButtons(): void {
  if (isThesaurusPage()) {
    addThesaurusCopyFeatures();
  } else {
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
