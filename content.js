async function getMutedItems() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["mutedRepos", "mutedUsers"], (data) => {
      resolve({
        mutedRepos: data.mutedRepos || [],
        mutedUsers: data.mutedUsers || [],
      });
    });
  });
}

function saveMutedItems(mutedRepos, mutedUsers) {
  chrome.storage.sync.set({ mutedRepos, mutedUsers });
}

function createDropdownMenu(repoFullName, username) {
  const container = document.createElement("div");
  container.className = "custom-mute-dropdown";

  const dropdownButton = document.createElement("button");
  dropdownButton.className = "custom-dropdown-button";
  dropdownButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98-1.332c-.552-.616-.158-1.579 .634-1.661l.11-.006h4.471z"></path>
      <path d="M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387-1.364 -.493-1.87a3 3 0 0 0 1.472-2.063l.021-.143l.001-2.97a8 8 0 0 1 3.821-6.454l.248-.146l.01-.043a3.003 3.003 0 0 1 2.562-2.29l.182-.017l.176-.004zm2 8h-4l-.117 .007a1 1 0 0 0 .117 1.993h4l.117-.007a1 1 0 0 0-.117-1.993z"></path>
    </svg>
  `;

  const dropdownContent = document.createElement("div");
  dropdownContent.className = "custom-dropdown-content";
  dropdownContent.innerHTML = `
    <button class="custom-dropdown-item mute-repo">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path d="m4.182 4.31.016.011 10.104 7.316.013.01 1.375.996a.75.75 0 1 1-.88 1.214L13.626 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947V5.305L.31 3.357a.75.75 0 1 1 .88-1.214Zm7.373 7.19L4.5 6.391v1.556c0 .346-.102.683-.294.97l-1.703 2.556a.017.017 0 0 0-.003.01c0 .005.002.009.005.012l.006.004.007.001ZM8 1.5c-.997 0-1.895.416-2.534 1.086A.75.75 0 1 1 4.38 1.55 5 5 0 0 1 13 5v2.373a.75.75 0 0 1-1.5 0V5A3.5 3.5 0 0 0 8 1.5ZM8 16a2 2 0 0 1-1.985-1.75c-.017-.137.097-.25.235-.25h3.5c.138 0 .252.113.235.25A2 2 0 0 1 8 16Z"></path>
      </svg>
      Mute Repository
    </button>
    <button class="custom-dropdown-item mute-user">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path>
      </svg>
      Mute User
    </button>
  `;

  container.appendChild(dropdownButton);
  container.appendChild(dropdownContent);

  dropdownButton.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownContent.classList.toggle("show");
  });

  dropdownContent
    .querySelector(".mute-repo")
    .addEventListener("click", async () => {
      const { mutedRepos, mutedUsers } = await getMutedItems();
      if (!mutedRepos.includes(repoFullName)) {
        mutedRepos.push(repoFullName);
        saveMutedItems(mutedRepos, mutedUsers);
        removeRepoFromDOM(repoFullName);
      }
      dropdownContent.classList.remove("show");
    });

  dropdownContent
    .querySelector(".mute-user")
    .addEventListener("click", async () => {
      const { mutedRepos, mutedUsers } = await getMutedItems();
      if (!mutedUsers.includes(username)) {
        mutedUsers.push(username);
        saveMutedItems(mutedRepos, mutedUsers);
        removeUserFromDOM(username);
      }
      dropdownContent.classList.remove("show");
    });

  window.addEventListener("click", (event) => {
    if (!container.contains(event.target)) {
      dropdownContent.classList.remove("show");
    }
  });

  return container;
}

function removeRepoFromDOM(repoFullName) {
  const repoLink = document.querySelector(`a[href="/${repoFullName}"]`);
  if (repoLink) {
    const article = repoLink.closest("article");
    if (article) article.remove();
  }
}

function removeUserFromDOM(username) {
  const repoLinks = document.querySelectorAll(
    'h3 a[href^="/"][href*="/"][data-view-component="true"].text-bold',
  );
  repoLinks.forEach((link) => {
    const repoFullName = link.getAttribute("href").slice(1);
    const repoUsername = repoFullName.split("/")[0];
    if (repoUsername === username) {
      const article = link.closest("article");
      if (article) article.remove();
    }
  });
}

function injectDropdown(article) {
  if (article.querySelector(".custom-mute-dropdown")) return;

  const repoLink = article.querySelector(
    'h3 a.text-bold[href^="/"][href*="/"][data-view-component="true"]',
  );
  if (!repoLink) return;
  const repoFullName = repoLink.getAttribute("href").slice(1);
  const username = repoFullName.split("/")[0];

  const dropdown = createDropdownMenu(repoFullName, username);
  const starsContainer = article.querySelector(".js-social-container");
  if (!starsContainer) return;

  starsContainer.parentNode.insertBefore(dropdown, starsContainer.nextSibling);
  dropdown.style.marginLeft = "8px";
}

async function processExistingRepositories() {
  const { mutedRepos, mutedUsers } = await getMutedItems();
  const articles = document.querySelectorAll(
    "article.border.rounded.color-shadow-small.color-bg-subtle.my-4",
  );

  articles.forEach((article) => {
    const repoLink = article.querySelector(
      'h3 a.text-bold[href^="/"][href*="/"][data-view-component="true"]',
    );
    if (!repoLink) return;
    const repoFullName = repoLink.getAttribute("href").slice(1);
    const username = repoFullName.split("/")[0];

    if (mutedRepos.includes(repoFullName) || mutedUsers.includes(username)) {
      article.remove();
      return;
    }

    injectDropdown(article);
  });
}

function handleMutations(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (
        node.nodeType === 1 &&
        node.matches(
          "article.border.rounded.color-shadow-small.color-bg-subtle.my-4",
        )
      ) {
        const repoLink = node.querySelector(
          'h3 a.text-bold[href^="/"][href*="/"][data-view-component="true"]',
        );
        if (!repoLink) return;
        const repoFullName = repoLink.getAttribute("href").slice(1);
        const username = repoFullName.split("/")[0];

        getMutedItems().then(({ mutedRepos, mutedUsers }) => {
          if (
            mutedRepos.includes(repoFullName) ||
            mutedUsers.includes(username)
          ) {
            node.remove();
            return;
          }
          injectDropdown(node);
        });
      }
    });
  });
}

function initialize() {
  processExistingRepositories();
  const observer = new MutationObserver(handleMutations);
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
