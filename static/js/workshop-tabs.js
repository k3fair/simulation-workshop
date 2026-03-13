document.addEventListener("DOMContentLoaded", function () {
  var sectionNav = document.querySelector(".section-nav");
  if (!sectionNav) {
    return;
  }

  var tabLinks = Array.prototype.slice.call(sectionNav.querySelectorAll('a[href^="#"]'));
  var tabIds = tabLinks
    .map(function (link) {
      return link.getAttribute("href").replace("#", "");
    })
    .filter(function (id) {
      return id.length > 0;
    });

  if (tabIds.length === 0) {
    return;
  }

  var panelMap = new Map();

  function buildPanel(id) {
    var heading = document.getElementById(id);
    if (!heading) {
      return;
    }

    var panelNodes = [];
    var previous = heading.previousElementSibling;
    if (previous && previous.matches("hr.section-divider")) {
      panelNodes.push(previous);
    }

    panelNodes.push(heading);

    var node = heading.nextElementSibling;
    while (node) {
      if (node.matches("h2[id]")) {
        break;
      }

      if (node.matches("hr.section-divider")) {
        var next = node.nextElementSibling;
        if (next && next.matches("h2[id]")) {
          break;
        }
      }

      panelNodes.push(node);
      node = node.nextElementSibling;
    }

    panelMap.set(id, panelNodes);
  }

  tabIds.forEach(buildPanel);

  if (panelMap.size === 0) {
    return;
  }

  sectionNav.setAttribute("role", "tablist");

  tabLinks.forEach(function (link) {
    var id = link.getAttribute("href").replace("#", "");
    if (!panelMap.has(id)) {
      return;
    }

    link.setAttribute("role", "tab");
    link.setAttribute("aria-selected", "false");
    link.setAttribute("tabindex", "-1");
  });

  function setActiveTab(id, updateHash) {
    if (!panelMap.has(id)) {
      return;
    }

    tabLinks.forEach(function (link) {
      var linkId = link.getAttribute("href").replace("#", "");
      var isActive = linkId === id;

      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-selected", isActive ? "true" : "false");
      link.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panelMap.forEach(function (nodes, panelId) {
      var hidden = panelId !== id;
      nodes.forEach(function (node) {
        node.classList.toggle("tab-hidden", hidden);
      });
    });

    if (updateHash) {
      history.replaceState(null, "", "#" + id);
    }
  }

  tabLinks.forEach(function (link) {
    var id = link.getAttribute("href").replace("#", "");
    if (!panelMap.has(id)) {
      return;
    }

    link.addEventListener("click", function (event) {
      event.preventDefault();
      setActiveTab(id, true);
    });
  });

  var initialTab = window.location.hash.replace("#", "");
  if (!panelMap.has(initialTab)) {
    initialTab = panelMap.has("speakers")
      ? "speakers"
      : tabIds.find(function (id) {
          return panelMap.has(id);
        });
  }

  if (initialTab) {
    setActiveTab(initialTab, false);
  }

  window.addEventListener("hashchange", function () {
    var hashTab = window.location.hash.replace("#", "");
    if (panelMap.has(hashTab)) {
      setActiveTab(hashTab, false);
    }
  });
});
