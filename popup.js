function getMutedItems() {
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
  chrome.storage.sync.set({ mutedRepos, mutedUsers }, renderMutedItems);
}

function createListItem(name, className, onUnmute) {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = `https://github.com/${name}`;
  link.textContent = name;
  link.target = "_blank";
  link.className = className;
  link.title = name;

  const unmuteBtn = document.createElement("button");
  unmuteBtn.textContent = "Unmute";
  unmuteBtn.className = "unmute-btn";
  unmuteBtn.addEventListener("click", onUnmute);

  li.appendChild(link);
  li.appendChild(unmuteBtn);
  return li;
}

async function removeMutedRepo(repoFullName) {
  const { mutedRepos, mutedUsers } = await getMutedItems();
  saveMutedItems(
    mutedRepos.filter((repo) => repo !== repoFullName),
    mutedUsers,
  );
}

async function removeMutedUser(username) {
  const { mutedRepos, mutedUsers } = await getMutedItems();
  saveMutedItems(
    mutedRepos.filter((repo) => !repo.startsWith(`${username}/`)),
    mutedUsers.filter((user) => user !== username),
  );
}

async function renderMutedItems() {
  const { mutedRepos, mutedUsers } = await getMutedItems();
  const repoList = document.getElementById("repo-list");
  const userList = document.getElementById("user-list");

  repoList.innerHTML = "";
  userList.innerHTML = "";

  if (mutedRepos.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No muted repositories.";
    li.style.color = "#8b949e";
    repoList.appendChild(li);
  } else {
    mutedRepos.forEach((repo) => {
      repoList.appendChild(
        createListItem(repo, "repo-name", () => removeMutedRepo(repo)),
      );
    });
  }

  if (mutedUsers.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No muted users.";
    li.style.color = "#8b949e";
    userList.appendChild(li);
  } else {
    mutedUsers.forEach((user) => {
      userList.appendChild(
        createListItem(user, "user-name", () => removeMutedUser(user)),
      );
    });
  }
}

document.addEventListener("DOMContentLoaded", renderMutedItems);
